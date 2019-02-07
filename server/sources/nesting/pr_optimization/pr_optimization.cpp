// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <cassert>
#include <cmath>
#include <iostream>
#include <random>
#include <chrono>
#include <boost/geometry/algorithms/overlaps.hpp>
#include <boost/geometry/algorithms/within.hpp>
#include "config.h"
#include "common.h"
#include "pr_optimization.h"

namespace Pr
{
    typedef boost::geometry::model::d2::point_xy<int> cell_t;
    typedef boost::geometry::model::box<cell_t> cell_box_t;

    inline int coordinate_to_cell(double coordinate)
    {
        return static_cast<int>(floor(coordinate / POSITION_STEP));
    }
    inline cell_t point_to_cell(const point_t& point)
    {
        return cell_t(coordinate_to_cell(point.x()), coordinate_to_cell(point.y()));
    }
    inline cell_box_t box_to_cell_box(const box_t& box)
    {
        cell_box_t result;
        result.min_corner() = point_to_cell(box.min_corner());
        cell_t max_point = point_to_cell(box.max_corner());
        result.max_corner().x(max_point.x() + 1);
        result.max_corner().y(max_point.y() + 1);
        return result;
    }

    class CellSpace
    {
        cell_t size;
        std::vector<bool> data;
        size_t getPlainIndex(cell_t index) const
        {
            assert(index.x() < size.x());
            assert(index.y() < size.y());
            return index.x() * size.y() + index.y();
        }
    public:
        CellSpace(cell_t size_) :
            size(size_), data(size.x() * size.y())
        {
        }
        CellSpace(const polygons_t& polygons, const cell_box_t& cell_box, bool is_sheet = false) :
            CellSpace(cell_t(cell_box.max_corner().x() - cell_box.min_corner().x(), cell_box.max_corner().y() - cell_box.min_corner().y()))
        {
            for (int x = 0; x < size.x(); ++x)
            {
                for (int y = 0; y < size.y(); ++y)
                {
                    const int base_point_x = x + cell_box.min_corner().x();
                    const int base_point_y = y + cell_box.min_corner().y();
                    const int end_point_x = base_point_x + 1;
                    const int end_point_y = base_point_y + 1;

                    contour_t cell_contour;
                    cell_contour.push_back(point_t(base_point_x * POSITION_STEP, base_point_y * POSITION_STEP));
                    cell_contour.push_back(point_t(base_point_x * POSITION_STEP, end_point_y * POSITION_STEP));
                    cell_contour.push_back(point_t(end_point_x * POSITION_STEP, end_point_y * POSITION_STEP));
                    cell_contour.push_back(point_t(end_point_x * POSITION_STEP, base_point_y * POSITION_STEP));

                    polygon_t cell;
                    cell.outer().assign(cell_contour.begin(), cell_contour.end());

                    if (is_sheet)
                    {
                        setCell(cell_t(x, y), true);
                        for (auto polygon : polygons)
                        {
                            if (boost::geometry::overlaps(cell, *polygon) || boost::geometry::within(cell, *polygon))
                            {
                                setCell(cell_t(x, y), false);
                                break;
                            }
                        }
                    }
                    else
                    {
                        for (auto polygon : polygons)
                        {
                            if (boost::geometry::overlaps(cell, *polygon) || boost::geometry::within(cell, *polygon))
                            {
                                setCell(cell_t(x, y), true);
                                break;
                            }
                        }
                    }
                }
            }
        }
        size_t merge(cell_t point, const CellSpace& image)
        {
            size_t overlapped_cell_count = 0;
            for (int x = 0; x < image.getSize().x(); ++x)
            {
                for (int y = 0; y < image.getSize().y(); ++y)
                {
                    if (image.getCell(cell_t(x, y)))
                    {
                        const int cur_x = point.x() + x;
                        const int cur_y = point.y() + y;
                        if (cur_x < size.x() && cur_y < size.y())
                        {
                            if (getCell(cell_t(cur_x, cur_y)))
                            {
                                overlapped_cell_count++;
                            }
                            else
                            {
                                setCell(cell_t(cur_x, cur_y), true);
                            }
                        }
                        else
                        {
                            overlapped_cell_count++;
                        }
                    }
                }
            }
            return overlapped_cell_count;
        }
        void dump() const
        {
            int y = size.y() - 1;
            while (y >= 0)
            {
                for (int x = 0; x < size.x(); ++x)
                {
                    if (getCell(cell_t(x, y)))
                    {
                        std::cout << "*";
                    }
                    else
                    {
                        std::cout << ".";
                    }
                }
                std::cout << "\n";
                --y;
            }
        }
        void setCell(cell_t index, bool value)
        {
            data[getPlainIndex(index)] = value;
        }
        bool getCell(cell_t index) const
        {
            return data[getPlainIndex(index)];
        }
        cell_t getSize() const
        {
            return size;
        }
    };
    typedef boost::shared_ptr<CellSpace> cell_space_ptr;

    struct PartVariationInfo
    {
        PartVariation variation;
        polygons_t polygons;
        box_t bounding_box;
        cell_box_t cell_box;
        point_t zero_position_inside_cell_box;
        cell_space_ptr cell_space;
    };
    typedef boost::shared_ptr<PartVariationInfo> part_variation_into_ptr;
    typedef std::vector<part_variation_into_ptr> part_variations_info_t;

    struct PartInfo
    {
        part_ptr part;
        part_variations_info_t variations_info;
    };
    typedef boost::shared_ptr<PartInfo> part_info_ptr;

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
            variation_info->zero_position_inside_cell_box.x(0.0 - variation_info->cell_box.min_corner().x() * POSITION_STEP);
            variation_info->zero_position_inside_cell_box.y(0.0 - variation_info->cell_box.min_corner().y() * POSITION_STEP);
            variation_info->cell_space = boost::make_shared<CellSpace>(variation_info->polygons, variation_info->cell_box);
            std::cout << "part image" << std::endl;
            variation_info->cell_space->dump();
            result->variations_info.push_back(variation_info);
        }
        return result;
    }

    struct SheetInfo
    {
        sheet_ptr sheet;
        polygons_t polygons;
        box_t bounding_box;
        cell_box_t cell_box;
        point_t zero_position_inside_cell_box;
        cell_space_ptr cell_space;
    };
    typedef boost::shared_ptr<SheetInfo> sheet_info_ptr;

    sheet_info_ptr calculateSheetInfo(const sheet_ptr& sheet)
    {
        sheet_info_ptr result = boost::make_shared<SheetInfo>();
        result->sheet = sheet;
        toPolygons(*sheet->geometry, result->polygons);
        result->bounding_box = calculateBoundingBox(result->polygons);
        result->cell_box = box_to_cell_box(result->bounding_box);
        result->zero_position_inside_cell_box.x(0.0 - result->cell_box.min_corner().x() * POSITION_STEP);
        result->zero_position_inside_cell_box.y(0.0 - result->cell_box.min_corner().y() * POSITION_STEP);
        result->cell_space = boost::make_shared<CellSpace>(result->polygons, result->cell_box, true);
        std::cout << "sheet image" << std::endl;
        result->cell_space->dump();
        return result;
    }

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            cell_t position;
            size_t variation;
            const size_t max_variation;
            Gene(size_t max_variation_) : max_variation(max_variation_)
            {
            }
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            size_t penalty;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;
    private:
        typedef std::list<individual_ptr> population_t;

        population_t population;
        std::vector<part_info_ptr> parts_info;
        sheet_info_ptr sheet_info;

        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;

        individual_ptr randomIndividual() const
        {
            individual_ptr result = boost::make_shared<Individual>();
            result->genotype.reserve(parts_info.size());
            for (auto part_info : parts_info)
            {
                Gene new_gene(part_info->variations_info.size());
                new_gene.position.x(uniform(engine) % sheet_info->cell_space->getSize().x());
                new_gene.position.y(uniform(engine) % sheet_info->cell_space->getSize().y());
                new_gene.variation = uniform(engine) % part_info->variations_info.size();
                result->genotype.push_back(new_gene);
            }
            return result;
        }
        void calculatePenalty(individual_ptr individual) const
        {
            size_t overlapped_cell_count = 0;
            const CellSpace& original_sheet_mask = *sheet_info->cell_space;
            CellSpace image = original_sheet_mask; // Perform copy
            size_t part_index = 0;
            for (auto gene : individual->genotype)
            {
                const cell_t position = gene.position;
                const CellSpace& part_variation_mask = *parts_info[part_index]->variations_info[gene.variation]->cell_space;
                overlapped_cell_count += image.merge(position, part_variation_mask);
            }
            size_t max_point_x = 0;
            size_t max_point_y = 0;
            for (int x = 0; x < image.getSize().x(); ++x)
            {
                for (int y = 0; y < image.getSize().y(); ++y)
                {
                    const cell_t point(x, y);
                    if (image.getCell(point) && !original_sheet_mask.getCell(point))
                    {
                        if (x > max_point_x)
                        {
                            max_point_x = x;
                        }
                        if (y > max_point_y)
                        {
                            max_point_y = y;
                        }
                    }
                }
            }
            const size_t size_x = original_sheet_mask.getSize().x();
            const size_t size_y = original_sheet_mask.getSize().y();
            const size_t sheet_area = size_x * size_y;
            const size_t penalty_for_overlap = overlapped_cell_count * sheet_area;
            const size_t penalty_for_used_sheet_length = max_point_x * size_y;
            const size_t penalty_for_used_sheet_height = max_point_y;
            individual->penalty = penalty_for_overlap + penalty_for_used_sheet_length + penalty_for_used_sheet_height;
        }
        std::vector<individual_ptr> getRandomPair() const
        {
            const size_t max_random = POPULATION_SIZE * POPULATION_SIZE;
            std::vector<individual_ptr> result;
            result.reserve(2);
            while (result.size() < 2)
            {
                size_t index = 0;
                for (auto individual : population)
                {
                    if (!result.empty() && *result.begin() == individual)
                    {
                        continue;
                    }
                    if (uniform(engine) % max_random < 2 * (POPULATION_SIZE - index))
                    {
                        result.push_back(individual);
                        if (result.size() >= 2)
                        {
                            return result;
                        }
                    }
                    index++;
                }
            }
            return result; // Just to avoid compilation warning
        }
        population_t mate(const individual_ptr& male, const individual_ptr& female) const
        {
            const size_t genes_count = parts_info.size();
            const size_t genes_cross_area_size = genes_count * 80 / 10; // 80%
            const size_t genes_cross_area_base = genes_count * 10 / 10; // 10%
            size_t cross_point = (uniform(engine) % genes_cross_area_size + genes_cross_area_base) / 10;
            population_t result;
            individual_ptr child1 = boost::make_shared<Individual>();
            child1->genotype.reserve(genes_count);
            individual_ptr child2 = boost::make_shared<Individual>();
            child2->genotype.reserve(genes_count);
            for (size_t i = 0; i < genes_count; ++i)
            {
                if (i < cross_point)
                {
                    child1->genotype.push_back(male->genotype[i]);
                    child2->genotype.push_back(female->genotype[i]);
                }
                else
                {
                    child1->genotype.push_back(female->genotype[i]);
                    child2->genotype.push_back(male->genotype[i]);
                }
            }
            result.push_back(child1);
            result.push_back(child2);
            return result;
        }
        void mutate(const individual_ptr& individual) const
        {
            for (auto& gene : individual->genotype)
            {
                if (uniform(engine) % 100 < MUTATION_RATE)
                {
                    gene.position.x(uniform(engine) % sheet_info->cell_space->getSize().x());
                }
                if (uniform(engine) % 100 < MUTATION_RATE)
                {
                    gene.position.y(uniform(engine) % sheet_info->cell_space->getSize().y());
                }
                if (uniform(engine) % 100 < MUTATION_RATE)
                {
                    gene.variation = uniform(engine) % gene.max_variation;
                }
            }
        }
    public:
        GeneticAlgorithm(const std::vector<part_info_ptr>& parts_info_, const sheet_info_ptr& sheet_info_) :
            parts_info(parts_info_), sheet_info(sheet_info_), engine(std::random_device()())
        {
            for (size_t i = 0; i < POPULATION_SIZE; ++i)
            {
                population.push_back(randomIndividual());
            }
        }
        void calculatePenalties()
        {
            for (auto individual : population)
            {
                calculatePenalty(individual);
            }
        }
        void sort()
        {
            population.sort([](const individual_ptr& a, const individual_ptr& b)
            {
                return a->penalty < b->penalty;
            });
        }
        void nextGeneration()
        {
            population_t next_population;
            next_population.push_back(getBest());
            while (next_population.size() < POPULATION_SIZE)
            {
                auto pair = getRandomPair();
                population_t children = mate(pair[0], pair[1]);
                for (auto child : children)
                {
                    if (next_population.size() < POPULATION_SIZE)
                    {
                        mutate(child);
                        next_population.push_back(child);
                    }
                    else
                    {
                        break;
                    }
                }
            }
            population = next_population;
        }
        individual_ptr getBest() const
        {
            return *population.begin();
        }
    };

    class Nesting
    {
        const nesting_task_ptr& task;
        nesting_result_ptr result;
        std::vector<part_info_ptr> parts_info;
        std::vector<sheet_info_ptr> sheets_info;

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
            size_t index = 0;
            sheet_info_ptr sheet_info = sheets_info.at(0);
            const double base_sheet_x = sheet_info->cell_box.min_corner().x() * POSITION_STEP;
            const double base_sheet_y = sheet_info->cell_box.min_corner().y() * POSITION_STEP;
            for (auto gene : best->genotype)
            {
                const double zero_offset_x = parts_info[index]->variations_info[gene.variation]->zero_position_inside_cell_box.x();
                const double zero_offset_y = parts_info[index]->variations_info[gene.variation]->zero_position_inside_cell_box.y();

                PartInstantiation part;
                part.instantiation_index = gene.variation;
                part.part = parts_info[index]->part;
                part.position.x(base_sheet_x + gene.position.x() * POSITION_STEP + zero_offset_x);
                part.position.y(base_sheet_y + gene.position.y() * POSITION_STEP + zero_offset_y);
                part.sheet = sheets_info.at(0)->sheet;
                result->instantiations.push_back(part);
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
        void run()
        {
            auto start = std::chrono::steady_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::steady_clock::now() - start);

            size_t generation_count = 0;
            calculatePartsInfo();
            calculateSheetsInfo();
            GeneticAlgorithm genetic_algorithm(parts_info, sheets_info.at(0));
            GeneticAlgorithm::individual_ptr best;
            while (duration.count() < task->time_in_seconds)
            {
                genetic_algorithm.calculatePenalties();
                genetic_algorithm.sort();
                best = genetic_algorithm.getBest();
                genetic_algorithm.nextGeneration();
                generation_count++;

                duration = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::steady_clock::now() - start);
            }
            fillResult(best);
            std::cout << "generation count " << generation_count << std::endl;
        }
    };
}

nesting_result_ptr Pr::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
