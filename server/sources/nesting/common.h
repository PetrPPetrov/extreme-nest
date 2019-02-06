// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <list>
#include <boost/geometry/geometries/polygon.hpp>
#include <boost/smart_ptr/shared_ptr.hpp>
#include <boost/smart_ptr/make_shared.hpp>
#include <boost/geometry/algorithms/within.hpp>
#include <boost/geometry/algorithms/envelope.hpp>
#include <boost/geometry/algorithms/expand.hpp>
#include <boost/geometry/algorithms/correct.hpp>
#include "nesting_task.h"

typedef boost::geometry::model::box<point_t> box_t;
typedef boost::geometry::model::polygon<point_t> polygon_t;
typedef boost::shared_ptr<polygon_t> polygon_ptr;
typedef std::list<polygon_ptr> polygons_t;

inline void toPolygons(const Geometry& geometry, polygons_t& polygons)
{
    polygons.clear();
    for (auto outer_contour : geometry.outer_contours)
    {
        polygon_ptr new_polygon = boost::make_shared<polygon_t>();
        new_polygon->outer().assign(outer_contour.begin(), outer_contour.end());
        for (auto inner_contour : geometry.holes)
        {
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
