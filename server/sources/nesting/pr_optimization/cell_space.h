// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <iostream>
#include "nesting_task.h"
#include "config.h"

namespace Pr
{
    typedef boost::geometry::model::box<point_t> box_t;
    typedef boost::geometry::model::polygon<point_t> polygon_t;
    typedef boost::shared_ptr<polygon_t> polygon_ptr;
    typedef std::list<polygon_ptr> polygons_t;

    inline void toPolygons(const Geometry& geometry, polygons_t& polygons)
    {
        polygons.clear();
        for (auto outer_contour : geometry.outer_contours)
        {
            if (!g_calculating)
            {
                throw InterruptionException();
            }
            polygon_ptr new_polygon = boost::make_shared<polygon_t>();
            new_polygon->outer().assign(outer_contour.begin(), outer_contour.end());
            for (auto inner_contour : geometry.holes)
            {
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
                polygon_t inner_polygon;
                inner_polygon.outer().assign(inner_contour.begin(), inner_contour.end());
                // Check if the current hole is completely inside the current outer contour
                if (boost::geometry::within(inner_polygon, *new_polygon))
                {
                    // Add inner contour to the resulting polygon
                    new_polygon->inners().push_back(inner_polygon.outer());
                }
            }
            boost::geometry::correct(*new_polygon);
            polygons.push_back(new_polygon);
        }
    }

    inline box_t calculateBoundingBox(const polygons_t& polygons)
    {
        bool first_iteration = true;
        box_t result;
        for (auto polygon : polygons)
        {
            if (!g_calculating)
            {
                throw InterruptionException();
            }
            box_t local_result;
            boost::geometry::envelope(*polygon, local_result);
            if (first_iteration)
            {
                result = local_result;
                first_iteration = false;
            }
            else
            {
                boost::geometry::expand(result, local_result);
            }
        }
        return result;
    }

    typedef boost::geometry::model::d2::point_xy<int> cell_t;
    typedef boost::geometry::model::box<cell_t> cell_box_t;

    inline int coordinate_to_cell(double coordinate)
    {
        return static_cast<int>(floor(coordinate / Config::Pr::POSITION_STEP));
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
                    cell_contour.push_back(point_t(base_point_x * Config::Pr::POSITION_STEP, base_point_y * Config::Pr::POSITION_STEP));
                    cell_contour.push_back(point_t(base_point_x * Config::Pr::POSITION_STEP, end_point_y * Config::Pr::POSITION_STEP));
                    cell_contour.push_back(point_t(end_point_x * Config::Pr::POSITION_STEP, end_point_y * Config::Pr::POSITION_STEP));
                    cell_contour.push_back(point_t(end_point_x * Config::Pr::POSITION_STEP, base_point_y * Config::Pr::POSITION_STEP));

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
                    if (!g_calculating)
                    {
                        throw InterruptionException();
                    }
                    if (image.getCell(cell_t(x, y)))
                    {
                        const int cur_x = point.x() + x;
                        const int cur_y = point.y() + y;
                        if (cur_x < size.x() && cur_y < size.y() && cur_x >= 0 && cur_y >= 0)
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
        size_t getArea() const
        {
            return size.x() * size.y();
        }
    };
    typedef boost::shared_ptr<CellSpace> cell_space_ptr;
}
