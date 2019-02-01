// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <cassert>
#include <boost/geometry/algorithms/overlaps.hpp>
#include <boost/geometry/algorithms/within.hpp>
#include "config.h"
#include "common.h"
#include "pr_optimization.h"

namespace Pr
{
    typedef boost::geometry::model::d2::point_xy<int> cell_t;
    typedef boost::geometry::model::box<cell_t> cell_box_t;

    inline cell_t point_to_cell(const point_t& point)
    {
        return cell_t(static_cast<int>(point.x() / POSITION_STEP), static_cast<int>(point.y() / POSITION_STEP));
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
                            if (boost::geometry::within(cell, *polygon))
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
                            if (boost::geometry::overlaps(cell, *polygon))
                            {
                                setCell(cell_t(x, y), true);
                                break;
                            }
                        }
                    }
                }
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
    };
    typedef boost::shared_ptr<CellSpace> cell_space_ptr;

    struct PartVariationInfo
    {
        PartVariation variation;
        polygons_t polygons;
        box_t bounding_box;
        cell_box_t cell_box;
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
            variation_info->cell_space = boost::make_shared<CellSpace>(variation_info->polygons, variation_info->cell_box);
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
        result->cell_space = boost::make_shared<CellSpace>(result->polygons, result->cell_box, true);
        return result;
    }

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            cell_t position;
            size_t variation;
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            double fitness;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;
    private:
        typedef std::list<individual_ptr> population_t;

        population_t population;
        std::vector<part_info_ptr> parts_info;
        sheet_info_ptr sheet_info;

        individual_ptr randomIndividual() const
        {
            // TODO:
            return boost::make_shared<Individual>();
        }
        void calculateFitness(individual_ptr individual) const
        {
            // TODO:
        }
        void mutate(const individual_ptr& individual) const
        {
            // TODO:
        }
        population_t mate(const individual_ptr& male, const individual_ptr& female) const
        {
            // TODO:
            return population_t();
        }
    public:
        GeneticAlgorithm(const std::vector<part_info_ptr>& parts_info_, const sheet_info_ptr& sheet_info_) :
            parts_info(parts_info_), sheet_info(sheet_info_)
        {
            for (size_t i = 0; i < POPULATION_SIZE; ++i)
            {
                population.push_back(randomIndividual());
            }
        }
        void nextGeneration()
        {
            // TODO:
        }
        individual_ptr getBest() const
        {
            // TODO:
            return boost::make_shared<Individual>();
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
    public:
        Nesting(const nesting_task_ptr& task_) :
            task(task_), result(boost::make_shared<NestingResult>())
        {
        }
        nesting_result_ptr getResult()
        {
            return result;
        }
        void run()
        {
            calculatePartsInfo();
            calculateSheetsInfo();
        }
    };
}

nesting_result_ptr Pr::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
