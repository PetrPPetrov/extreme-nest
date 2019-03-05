// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <vector>
#include <boost/polygon/polygon.hpp>
#include "config.h"

namespace Nfp
{
    typedef boost::polygon::point_data<int> nfp_point_t;
    typedef boost::polygon::polygon_set_data<int> polygon_set_t;
    typedef boost::polygon::polygon_with_holes_data<int> polygon_t;
    typedef std::pair<nfp_point_t, nfp_point_t> edge_t;

    inline void accumulateMax(point_t& result, const point_t& point)
    {
        result.x(std::max(result.x(), point.x()));
        result.y(std::max(result.y(), point.y()));
    }

    inline void accumulateMin(point_t& result, const point_t& point)
    {
        result.x(std::min(result.x(), point.x()));
        result.y(std::min(result.y(), point.y()));
    }

    inline void accumulate(point_t& max_point, point_t& min_point, const geometry_ptr& geometry)
    {
        for (auto contour : geometry->outer_contours)
        {
            for (auto point : contour)
            {
                accumulateMax(max_point, point);
                accumulateMin(min_point, point);
            }
        }
        for (auto hole : geometry->holes)
        {
            for (auto point : hole)
            {
                accumulateMax(max_point, point);
                accumulateMin(min_point, point);
            }
        }
    }

    inline double calculateInputScale(const nesting_task_ptr& nesting_task)
    {
        point_t max_point(0.0, 0.0);
        point_t min_point(0.0, 0.0);
        for (auto sheet : nesting_task->sheets)
        {
            accumulate(max_point, min_point, sheet->geometry);
        }
        for (auto part : nesting_task->parts)
        {
            accumulate(max_point, min_point, part->variations[0].source_geometry);
        }
        min_point.x(std::fabs(min_point.x()));
        min_point.y(std::fabs(min_point.y()));
        const double max_x = std::max(max_point.x(), min_point.x());
        const double max_y = std::max(max_point.y(), min_point.y());
        double max_coordinate = std::max(max_x, max_y);
        const int max_integer = std::numeric_limits<int>::max();
        if (max_coordinate < 1.0)
        {
            max_coordinate = 1.0;
        }
        // 0.1 is for safety only. If we use 1.0 then max_coordinate
        // after scaling will become max_integer which is very near to integer overflow.
        // During computations our numbers could be slightly bigger than max_coordinate,
        // causing integer overflow. So, 0.1 is for safety only,
        // just to make sure that we avoid integer overflows.
        return 0.1 * static_cast<double>(max_integer) / max_coordinate;
    }

    inline void toPolygons(const contour_t& contour, polygon_set_t& polygons, bool outer_contour)
    {
        std::vector<nfp_point_t> points;
        points.reserve(contour.size());
        for (auto cur_point : contour)
        {
            const int x = static_cast<int>(Config::Nfp::INPUT_SCALE * cur_point.x());
            const int y = static_cast<int>(Config::Nfp::INPUT_SCALE * cur_point.y());
            points.push_back(nfp_point_t(x, y));
        }
        polygon_t polygon;
        boost::polygon::set_points(polygon, points.begin(), points.end());
        using namespace boost::polygon::operators;
        if (outer_contour)
        {
            polygons += polygon;
        }
        else
        {
            polygons -= polygon;
        }
    }

    inline void toPolygons(const Geometry& geometry, polygon_set_t& polygons)
    {
        polygons.clear();
        for (auto& contour : geometry.outer_contours)
        {
            toPolygons(contour, polygons, true);
        }
        for (auto& hole : geometry.holes)
        {
            toPolygons(hole, polygons, false);
        }
    }

    inline void convolve_two_segments(std::vector<nfp_point_t>& figure, const edge_t& a, const edge_t& b)
    {
        using namespace boost::polygon;
        figure.clear();
        figure.reserve(4);
        figure.push_back(nfp_point_t(a.first));
        figure.push_back(nfp_point_t(a.first));
        figure.push_back(nfp_point_t(a.second));
        figure.push_back(nfp_point_t(a.second));
        convolve(figure[0], b.second);
        convolve(figure[1], b.first);
        convolve(figure[2], b.first);
        convolve(figure[3], b.second);
    }

    template <typename itrT1, typename itrT2>
    inline void convolve_two_point_sequences(polygon_set_t& result, itrT1 ab, itrT1 ae, itrT2 bb, itrT2 be)
    {
        if (ab == ae || bb == be)
            return;
        nfp_point_t first_a = *ab;
        nfp_point_t prev_a = *ab;
        std::vector<nfp_point_t> vec;
        polygon_t poly;
        ++ab;
        for (; ab != ae; ++ab)
        {
            nfp_point_t first_b = *bb;
            nfp_point_t prev_b = *bb;
            itrT2 tmpb = bb;
            ++tmpb;
            for (; tmpb != be; ++tmpb)
            {
                convolve_two_segments(vec, std::make_pair(prev_b, *tmpb), std::make_pair(prev_a, *ab));
                set_points(poly, vec.begin(), vec.end());
                result.insert(poly);
                prev_b = *tmpb;
            }
            prev_a = *ab;
        }
    }

    template <typename itrT>
    inline void convolve_point_sequence_with_polygons(polygon_set_t& result, itrT b, itrT e, const std::vector<polygon_t>& polygons)
    {
        using namespace boost::polygon;
        for (std::size_t i = 0; i < polygons.size(); ++i)
        {
            convolve_two_point_sequences(result, b, e, begin_points(polygons[i]), end_points(polygons[i]));
            for (polygon_with_holes_traits<polygon_t>::iterator_holes_type itrh = begin_holes(polygons[i]);
                itrh != end_holes(polygons[i]); ++itrh)
            {
                convolve_two_point_sequences(result, b, e, begin_points(*itrh), end_points(*itrh));
            }
        }
    }

    inline void convolve_two_polygon_sets(polygon_set_t& result, const polygon_set_t& a, const polygon_set_t& b)
    {
        using namespace boost::polygon;
        result.clear();
        std::vector<polygon_t> a_polygons;
        std::vector<polygon_t> b_polygons;
        a_polygons.reserve(a.size());
        b_polygons.reserve(b.size());
        a.get(a_polygons);
        b.get(b_polygons);
        for (std::size_t ai = 0; ai < a_polygons.size(); ++ai)
        {
            convolve_point_sequence_with_polygons(result, begin_points(a_polygons[ai]),
                end_points(a_polygons[ai]), b_polygons);
            for (polygon_with_holes_traits<polygon_t>::iterator_holes_type itrh = begin_holes(a_polygons[ai]);
                itrh != end_holes(a_polygons[ai]); ++itrh)
            {
                convolve_point_sequence_with_polygons(result, begin_points(*itrh),
                    end_points(*itrh), b_polygons);
            }
            for (std::size_t bi = 0; bi < b_polygons.size(); ++bi)
            {
                polygon_t tmp_poly = a_polygons[ai];
                result.insert(convolve(tmp_poly, *(begin_points(b_polygons[bi]))));
                tmp_poly = b_polygons[bi];
                result.insert(convolve(tmp_poly, *(begin_points(a_polygons[ai]))));
            }
        }
    }
}
