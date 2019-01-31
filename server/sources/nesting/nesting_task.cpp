// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <stdexcept>
#include <iterator>
#include <boost/math/constants/constants.hpp>
#include "config.h"
#include "nesting_task.h"

geometry_ptr PartVariation::calculateActualGeometry() const
{
    geometry_ptr geometry = boost::make_shared<Geometry>();
    *geometry = *source_geometry;

    const double pi = boost::math::constants::pi<double>();
    const double a = angle * pi / 180.0; // Convert from degrees to radians
    const bool mirror_y = flip;

    auto transform_point = [a, mirror_y](point_t& point)
    {
        const double nx = cos(a)*point.x() - sin(a)*point.y();
        const double ny = sin(a)*point.x() + cos(a)*point.y();
        point = mirror_y ? point_t(nx, -ny) : point_t(nx, ny);
    };
    auto transform_contour = [transform_point](contour_t& contour)
    {
        std::for_each(contour.begin(), contour.end(), transform_point);
    };

    std::for_each(geometry->outer_contours.begin(), geometry->outer_contours.end(), transform_contour);
    std::for_each(geometry->holes.begin(), geometry->holes.end(), transform_contour);
    return geometry;
}

class TaskGenerator
{
    const NestingRequest::Order& nesting_order;
    nesting_task_ptr result;

    contour_t extractContour(const NestingRequest::contour_ptr& contour)
    {
        contour_t result;
        //result.reserve(contour->points.size());
        for (auto& point : contour->points)
        {
            switch (point.type)
            {
            case NestingRequest::Point::PointXY:
                result.push_back(point_t(point.x, point.y));
                break;
            default:
                // TODO: add support of arcs
                throw std::runtime_error("arcs are not supported yet");
            }
        }
        return result;
    }
    geometry_ptr extractGeometry(const NestingRequest::part_ptr& part)
    {
        geometry_ptr result = boost::make_shared<Geometry>();
        //result->outer_contours.reserve(part->geometry.size());
        for (auto contour : part->geometry)
        {
            result->outer_contours.push_back(extractContour(contour));
        }
        //result->holes.reserve(part->holes.size());
        for (auto contour : part->holes)
        {
            result->holes.push_back(extractContour(contour));
        }
        return result;
    }
    size_t getVariationCount(const NestingRequest::instance_ptr& instance)
    {
        size_t variation_count = 0;
        for (auto orientation : instance->orientations)
        {
            if (orientation.type == NestingRequest::Orientation::Punctual)
            {
                ++variation_count;
            }
            else if (orientation.type == NestingRequest::Orientation::RangeBased)
            {
                for (double angle = orientation.min_angle; angle <= orientation.max_angle; angle += ROTATION_ANGLE_STEP, ++variation_count);
            }
        }
        if (variation_count == 0)
        {
            variation_count = 1;
        }
        return variation_count;
    }
    void fillPart(const NestingRequest::part_ptr& part)
    {
        geometry_ptr geometry = extractGeometry(part);
        for (auto instance : part->instances)
        {
            for (int i = 0; i < instance->quantity; ++i)
            {
                part_ptr new_part = boost::make_shared<Part>();
                new_part->id = instance->id;
                new_part->variations.reserve(getVariationCount(instance));
                for (auto orientation : instance->orientations)
                {
                    if (orientation.type == NestingRequest::Orientation::Punctual)
                    {
                        PartVariation new_variation;
                        new_variation.source_geometry = geometry;
                        new_variation.angle = orientation.angle;
                        new_variation.flip = orientation.flip;
                        new_part->variations.push_back(new_variation);
                    }
                    else if (orientation.type == NestingRequest::Orientation::RangeBased)
                    {
                        for (double angle = orientation.min_angle; angle <= orientation.max_angle; angle += ROTATION_ANGLE_STEP)
                        {
                            PartVariation new_variation;
                            new_variation.source_geometry = geometry;
                            new_variation.angle = orientation.angle;
                            new_variation.flip = orientation.flip;
                            new_part->variations.push_back(new_variation);
                        }
                    }
                }
                if (new_part->variations.empty())
                {
                    PartVariation new_variation;
                    new_variation.source_geometry = geometry;
                    new_variation.angle = 0.0;
                    new_variation.flip = false;
                    new_part->variations.push_back(new_variation);
                }
                // TODO: protection_offset
                result->parts.push_back(new_part);
            }
        }
    }
    void fillParts()
    {
        for (auto part : nesting_order.parts)
        {
            fillPart(part);
        }
    }
    void fillSheet(const NestingRequest::sheet_ptr& sheet)
    {
        for (int i = 0; i < sheet->quantity; ++i)
        {
            sheet_ptr new_sheet = boost::make_shared<Sheet>();
            new_sheet->id = sheet->id;
            // TODO: add "contour" support
            // TODO: add "defects" support
            // TODO: add "border_gap" support
            // TODO: add infinite length support
            new_sheet->geometry = boost::make_shared<Geometry>();
            contour_t outer_contour;
            outer_contour.push_back(point_t(0.0, 0.0));
            outer_contour.push_back(point_t(sheet->length, 0.0));
            outer_contour.push_back(point_t(sheet->length, sheet->height));
            outer_contour.push_back(point_t(0.0, sheet->height));
            new_sheet->geometry->outer_contours.push_back(outer_contour);
            result->sheets.push_back(new_sheet);
        }
    }
    void fillSheets()
    {
        for (auto sheet : nesting_order.sheets)
        {
            fillSheet(sheet);
        }
    }
public:
    TaskGenerator(const NestingRequest::Order& nesting_order_) :
        nesting_order(nesting_order_), result(boost::make_shared<NestingTask>())
    {
        fillParts();
        fillSheets();
    }
    nesting_task_ptr getResult()
    {
        return result;
    }
};

nesting_task_ptr generateTask(const NestingRequest::Order& nesting_order)
{
    return TaskGenerator(nesting_order).getResult();
}
