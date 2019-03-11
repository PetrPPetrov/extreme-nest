// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <cassert>
#include <cmath>
#include <iostream>
#include <random>
#include <chrono>
#include <thread>
#include <mutex>
#include <boost/geometry/algorithms/overlaps.hpp>
#include <boost/geometry/algorithms/within.hpp>
#include "config.h"
#include "pr_optimization/cell_space.h"
#include "pr_optimization/genetic_algorithm.h"
#include "pr_optimization/nest.h"

namespace Pr
{
    part_info_ptr calculatePartInfo(const part_ptr& part)
    {
        part_info_ptr result = boost::make_shared<PartInfo>();
        result->part = part;
        result->variations_info.reserve(part->variations.size());
        for (auto variation : part->variations)
        {
            part_variation_into_ptr variation_info = boost::make_shared<PartVariationInfo>();
            variation_info->variation = variation;
            geometry_ptr actual_variation_geometry = variation.calculateActualGeometry();
            toPolygons(*actual_variation_geometry, variation_info->polygons);
            variation_info->bounding_box = calculateBoundingBox(variation_info->polygons);
            variation_info->cell_box = box_to_cell_box(variation_info->bounding_box);
            variation_info->zero_position_inside_cell_box.x(0.0 - variation_info->cell_box.min_corner().x() * Config::Pr::POSITION_STEP);
            variation_info->zero_position_inside_cell_box.y(0.0 - variation_info->cell_box.min_corner().y() * Config::Pr::POSITION_STEP);
            variation_info->cell_space = boost::make_shared<CellSpace>(variation_info->polygons, variation_info->cell_box);
#ifdef _DEBUG
            std::cout << "part image" << std::endl;
            variation_info->cell_space->dump();
#endif
            result->variations_info.push_back(variation_info);
        }
        return result;
    }

    sheet_info_ptr calculateSheetInfo(const sheet_ptr& sheet)
    {
        sheet_info_ptr result = boost::make_shared<SheetInfo>();
        result->sheet = sheet;
        toPolygons(*sheet->geometry, result->polygons);
        result->bounding_box = calculateBoundingBox(result->polygons);
        result->cell_box = box_to_cell_box(result->bounding_box);
        result->zero_position_inside_cell_box.x(0.0 - result->cell_box.min_corner().x() * Config::Pr::POSITION_STEP);
        result->zero_position_inside_cell_box.y(0.0 - result->cell_box.min_corner().y() * Config::Pr::POSITION_STEP);
        result->cell_space = boost::make_shared<CellSpace>(result->polygons, result->cell_box, true);
#ifdef _DEBUG
        std::cout << "sheet image" << std::endl;
        result->cell_space->dump();
#endif
        return result;
    }

    class Nesting
    {
        const nesting_task_ptr& task;
        std::vector<part_info_ptr> parts_info;
        std::vector<sheet_info_ptr> sheets_info;
        nesting_result_ptr result;
        size_t generation_count = 0;
        GeneticAlgorithm::individual_ptr best;
        std::mutex mutex_for_best;
        bool calculating = true;

        void calculatePartsInfo()
        {
            parts_info.reserve(task->parts.size());
            for (auto part : task->parts)
            {
                parts_info.push_back(calculatePartInfo(part));
            }
        }
        void calculateSheetsInfo()
        {
            sheets_info.reserve(task->sheets.size());
            for (auto sheet : task->sheets)
            {
                sheets_info.push_back(calculateSheetInfo(sheet));
            }
        }
        void fillResult(const GeneticAlgorithm::individual_ptr& best)
        {
            result = boost::make_shared<NestingResult>();

            // Contains the length until the straight vertical offcut for each sheet
            std::vector<double> sheet_lengths(sheets_info.size(), 0.0);

            for (size_t i = 0; i < best->genotype.size(); ++i)
            {
                const GeneticAlgorithm::Gene& gene = best->genotype[i];
                const part_info_ptr part_info = parts_info[i];
                const sheet_info_ptr sheet_info = sheets_info[gene.sheet_number];
                const double base_sheet_x = sheet_info->cell_box.min_corner().x() * Config::Pr::POSITION_STEP;
                const double base_sheet_y = sheet_info->cell_box.min_corner().y() * Config::Pr::POSITION_STEP;
                const auto part_variation = part_info->variations_info[gene.variation];
                const double zero_offset_x = part_variation->zero_position_inside_cell_box.x();
                const double zero_offset_y = part_variation->zero_position_inside_cell_box.y();

                PartInstantiation part;
                part.variation_index = gene.variation;
                part.part = part_info->part;
                part.position.x(base_sheet_x + gene.position.x() * Config::Pr::POSITION_STEP + zero_offset_x);
                part.position.y(base_sheet_y + gene.position.y() * Config::Pr::POSITION_STEP + zero_offset_y);
                part.sheet = sheet_info->sheet;
                double& sheet_length = sheet_lengths[gene.sheet_number];
                sheet_length = std::max<double>(sheet_length, part_variation->bounding_box.max_corner().x() + part.position.x());
                result->instantiations.push_back(part);
            }

            size_t index = 0;
            for (auto& part : result->instantiations)
            {
                const GeneticAlgorithm::Gene& gene = best->genotype[index];
                part.sheet_length = sheet_lengths[gene.sheet_number];
                index++;
            }
        }
    public:
        Nesting(const nesting_task_ptr& task_) :
            task(task_)
        {
        }
        nesting_result_ptr getResult()
        {
            return result;
        }
        void runInThread()
        {
            calculatePartsInfo();
            calculateSheetsInfo();
            GeneticAlgorithm genetic_algorithm(parts_info, sheets_info);

            while (calculating)
            {
                genetic_algorithm.calculatePenalties();
                genetic_algorithm.sort();
                {
                    std::lock_guard<std::mutex> guard(mutex_for_best);
                    best = genetic_algorithm.getBest();
                }
                genetic_algorithm.nextGeneration();
                ++generation_count;
            }
        }
        void run()
        {
            std::thread calculation_thread(&Nesting::runInThread, this);
            calculation_thread.detach();
            std::this_thread::sleep_for(std::chrono::seconds(static_cast<int>(task->time_in_seconds)));
            GeneticAlgorithm::individual_ptr current_best;
            {
                std::lock_guard<std::mutex> guard(mutex_for_best);
                current_best = best;
                calculating = false;
            }
            if (!current_best)
            {
#ifdef _DEBUG
                std::cout << "best is null" << std::endl;
#endif
                throw std::runtime_error("not enough time to calculate nesting");
            }
            fillResult(current_best);
#ifdef _DEBUG
            std::cout << "generation count " << generation_count << std::endl;
            std::cout << "best penalty " << current_best->penalty << std::endl;
#endif
        }
    };
}

nesting_result_ptr Pr::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
