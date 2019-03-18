// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <chrono>
#include <thread>
#include "config.h"
#include "nfp_optimization/nest.h"
#include "nfp_optimization/nofit_polygon.h"
#include "nfp_optimization/genetic_algorithm.h"

namespace Nfp
{
    inline part_info_ptr calculatePartInfo(const part_ptr& part)
    {
        part_info_ptr result = boost::make_shared<PartInfo>();
        result->part = part;
        result->variations_info.reserve(part->variations.size());
        for (auto variation : part->variations)
        {
            using namespace boost::polygon;
            part_variation_into_ptr variation_info = boost::make_shared<PartVariationInfo>();
            variation_info->variation = variation;
            variation_info->polygons = boost::make_shared<polygon_set_t>();
            geometry_ptr actual_variation_geometry = variation.calculateActualGeometry();
            toPolygons(*actual_variation_geometry, *variation_info->polygons);
            extents(variation_info->bounding_box, *variation_info->polygons);
            result->variations_info.push_back(variation_info);
        }
        // Use the first variation, because area of all variations should be the same
        if (!g_calculating)
        {
            throw InterruptionException();
        }
        result->area += boost::polygon::area(*result->variations_info[0]->polygons);
        return result;
    }

    inline sheet_info_ptr calculateSheetInfo(const sheet_ptr& sheet)
    {
        sheet_info_ptr result = boost::make_shared<SheetInfo>();
        result->sheet = sheet;
        result->polygons = boost::make_shared<polygon_set_t>();
        toPolygons(*sheet->geometry, *result->polygons);
        extents(result->bounding_box, *result->polygons);
        if (!g_calculating)
        {
            throw InterruptionException();
        }
        result->area += boost::polygon::area(*result->polygons);
        return result;
    }

    class Nesting
    {
        const nesting_task_ptr& task;
        parts_info_t parts_info;
        sheets_info_t sheets_info;
        nesting_result_ptr result;
        size_t generation_count = 0;
        GeneticAlgorithm::individual_ptr best;

        void calculateSheetsInfo()
        {
            sheets_info.reserve(task->sheets.size());
            for (auto sheet : task->sheets)
            {
                sheets_info.push_back(calculateSheetInfo(sheet));
            }
        }
        void calculatePartsInfo()
        {
            parts_info.reserve(task->parts.size());
            size_t index = 0;
            for (auto part : task->parts)
            {
                parts_info.push_back(calculatePartInfo(part));
                parts_info.back()->index = index++;
            }
        }
        void fillResult(const GeneticAlgorithm::individual_ptr& best)
        {
            result = boost::make_shared<NestingResult>();

            // Contains the length until the straight vertical offcut for each sheet
            std::vector<int> sheet_lengths(sheets_info.size(), 0);
            std::vector<size_t> sheet_indexes;
            sheet_indexes.reserve(best->genotype.size());

            for (auto& gene : best->genotype)
            {
                if (gene.placed)
                {
                    PartInstantiation part;
                    const part_info_ptr& part_info = parts_info[gene.part_number];
                    part.part = part_info->part;
                    part.position.x(gene.placement.x() / Config::Nfp::INPUT_SCALE);
                    part.position.y(gene.placement.y() / Config::Nfp::INPUT_SCALE);
                    part.sheet = sheets_info[gene.sheet_number]->sheet;
                    part.variation_index = gene.variation;

                    const int max_point_x = x(gene.placement) + xh(part_info->variations_info[gene.variation]->bounding_box);
                    int& sheet_length = sheet_lengths[gene.sheet_number];
                    sheet_length = std::max<int>(sheet_length, max_point_x);
                    result->instantiations.push_back(part);
                    sheet_indexes.push_back(gene.sheet_number);
                }
            }

            size_t index = 0;
            for (auto& part : result->instantiations)
            {
                part.sheet_length = sheet_lengths[sheet_indexes[index]] / Config::Nfp::INPUT_SCALE;
                index++;
            }
        }
    public:
        Nesting(const nesting_task_ptr& task_) : task(task_)
        {
        }
        nesting_result_ptr getResult()
        {
            return result;
        }
        void calculateNesting()
        {
            if (Config::Generic::Simplification::RUN)
            {
                simplify(task);
            }
            Config::Nfp::INPUT_SCALE = Nfp::calculateInputScale(task);
            calculatePartsInfo();
            calculateSheetsInfo();
            GeneticAlgorithm genetic_algorithm(parts_info, sheets_info);

            while (g_calculating)
            {
                genetic_algorithm.calculatePenalties();
                genetic_algorithm.sort();
                best = genetic_algorithm.getBest();
                genetic_algorithm.nextGeneration();
                ++generation_count;
            }
        }
        void runInThread()
        {
            try
            {
                calculateNesting();
            }
            catch (const InterruptionException&)
            {
            }
        }
        void run()
        {
            std::thread calculation_thread(&Nesting::runInThread, this);
            std::this_thread::sleep_for(std::chrono::seconds(static_cast<int>(task->time_in_seconds)));
            g_calculating = false;
            calculation_thread.join();

            if (!best)
            {
#ifdef _DEBUG
                std::cout << "best is null" << std::endl;
#endif
                throw std::runtime_error("not enough time to calculate nesting");
            }
            fillResult(best);
#ifdef _DEBUG
            std::cout << "generation count " << generation_count << std::endl;
            std::cout << "best penalty " << current_best->penalty << std::endl;
#endif
        }
    };
}

nesting_result_ptr Nfp::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
