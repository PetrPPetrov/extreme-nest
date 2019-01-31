// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <cassert>
#include "config.h"
#include "common.h"
#include "pr_optimization.h"

namespace Pr
{
    class GeneticAlgorithm
    {

    };

    class CellSpace
    {
        size_t length;
        size_t height;
        std::vector<bool> data;
        size_t getIndex(size_t length_, size_t height_) const
        {
            return length_ * height + height_;
        }
    public:
        CellSpace(size_t length_, size_t height_) :
            length(length_), height(height_), data(length * height)
        {
        }
        void setCell(size_t length_, size_t height_, bool value)
        {
            assert(length_ < length);
            assert(height_ < height);
            data[getIndex(length_, height_)] = value;
        }
        bool getCell(size_t length_, size_t height_) const
        {
            assert(length_ < length);
            assert(height_ < height);
            return data[getIndex(length_, height_)];
        }
    };
    typedef boost::shared_ptr<CellSpace> cell_space_ptr;

    struct PartVariationInfo
    {
        PartVariation variation;
        polygons_t polygons;
        box_t bounding_box;
        point_t adjusted_begin_point;
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
            result->variations_info.push_back(variation_info);
        }
        return result;
    }

    struct SheetInfo
    {
        sheet_ptr sheet;
        polygons_t polygons;
        box_t bounding_box;
        size_t max_position_x = 1;
        size_t max_position_y = 1;
    };
    typedef boost::shared_ptr<SheetInfo> sheet_info_ptr;

    sheet_info_ptr calculateSheetInfo(const sheet_ptr& sheet)
    {
        sheet_info_ptr result = boost::make_shared<SheetInfo>();
        result->sheet = sheet;
        toPolygons(*sheet->geometry, result->polygons);
        result->bounding_box = calculateBoundingBox(result->polygons);
        const double delta_x = result->bounding_box.max_corner().x() - result->bounding_box.min_corner().x();
        const double delta_y = result->bounding_box.max_corner().y() - result->bounding_box.min_corner().y();
        result->max_position_x = static_cast<size_t>(delta_x / POSITION_STEP);
        result->max_position_y = static_cast<size_t>(delta_y / POSITION_STEP);
        return result;
    }

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
