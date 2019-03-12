// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <vector>
#include <map>
#include <boost/polygon/polygon.hpp>
#include <boost/smart_ptr/shared_ptr.hpp>
#include <boost/smart_ptr/make_shared.hpp>
#include "config.h"
#include "nesting_task.h"

namespace Nfp
{
    typedef boost::polygon::point_data<int> nfp_point_t;
    typedef boost::polygon::rectangle_data<int> rectangle_t;
    typedef boost::polygon::polygon_set_data<int> polygon_set_t;
    typedef boost::polygon::polygon_with_holes_data<int> polygon_t;
    typedef std::pair<nfp_point_t, nfp_point_t> edge_t;
    typedef boost::shared_ptr<polygon_set_t> polygon_set_ptr;

    template<typename ProcessPointFunc>
    void iterateAllPoints(const polygon_t& polygon, ProcessPointFunc process_point)
    {
        using namespace boost::polygon;
        for (auto& point_it = begin_points(polygon); point_it != end_points(polygon); ++point_it)
        {
            process_point(*point_it);
        }
        for (polygon_with_holes_traits<polygon_t>::iterator_holes_type it = begin_holes(polygon);
            it != end_holes(polygon); ++it)
        {
            for (auto& point_it = begin_points(*it); point_it != end_points(*it); ++point_it)
            {
                process_point(*point_it);
            }
        }
    }

    template<typename ProcessPointFunc>
    void iterateAllPoints(const polygon_set_t& polygon_set, ProcessPointFunc process_point)
    {
        std::vector<polygon_t> polygons;
        polygon_set.get(polygons);
        for (auto& polygon : polygons)
        {
            iterateAllPoints(polygon, process_point);
        }
    }

    inline void dump(const polygon_t& polygon)
    {
        using namespace boost::polygon;
        std::cout << "outer contour" << std::endl;
        for (auto& point_it = begin_points(polygon); point_it != end_points(polygon); ++point_it)
        {
            //std::cout << "point* " << x(*point_it) << " : " << y(*point_it) << std::endl;
            std::cout << "point " << x(*point_it) / Config::Nfp::INPUT_SCALE << " : " << y(*point_it) / Config::Nfp::INPUT_SCALE << std::endl;
        }
        for (polygon_with_holes_traits<polygon_t>::iterator_holes_type it = begin_holes(polygon);
            it != end_holes(polygon); ++it)
        {
            std::cout << "hole" << std::endl;
            for (auto& point_it = begin_points(*it); point_it != end_points(*it); ++point_it)
            {
                //std::cout << "point* " << x(*point_it) << " : " << y(*point_it) << std::endl;
                std::cout << "point " << x(*point_it) / Config::Nfp::INPUT_SCALE << " : " << y(*point_it) / Config::Nfp::INPUT_SCALE << std::endl;
            }
        }
        std::cout << "===" << std::endl;
    }

    inline void dump(const polygon_set_t& polygon_set)
    {
        std::vector<polygon_t> polygons;
        polygon_set.get(polygons);
        std::cout << "polygon set" << std::endl;
        for (auto& polygon : polygons)
        {
            dump(polygon);
        }
        std::cout << "***" << std::endl;
    }

    inline void accumulateMax(point_t& result, const point_t& point)
    {
        if (!g_calculating)
        {
            throw InterruptionException();
        }
        result.x(std::max(result.x(), point.x()));
        result.y(std::max(result.y(), point.y()));
    }

    inline void accumulateMin(point_t& result, const point_t& point)
    {
        if (!g_calculating)
        {
            throw InterruptionException();
        }
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
        const double scale_candidate_by_coordinate = 0.1 * static_cast<double>(max_integer) / max_coordinate;

        // Nest step is to calculate limits due possible penalty function overflow.
        // For penalty function we use "size_t" type.
        // We must avoid cases when we will have integer overflows in "size_t" type
        // during penalty function calculating.

        // We calculate maximum possible square of sheet
        // Because our maximum coordinate is absolute,
        // it is possible that a maximum sheet is a rectangle from
        // (-max_coordinate, -max_coordinate) point to (max_coordinate, max_coordinate) point.
        // So, max_coordinate * max_coordinate is quarter square of a total maximum possible sheet.
        // So, we need to multiply max_coordinate * max_coordinate by 4.0 to calculate maximum possible square of sheet.
        const double max_sheet_square = 4.0 * max_coordinate * max_coordinate;
        // We use 3 components for penalty:
        // 1) used sheet square 2) square of used part of sheet (which could be the same as the used sheet square in the worst case)
        // 3) used maximum height of sheet (this component could be equal the used sheet heigt in the worst case, so,
        // much lesser than the used sheet square in a generic case; however, if sheet length is 1 than we have the worst case,
        // in this case this component could be the same as the used sheet square again).
        // So, all 3 components for penalty could be the same as the used sheet square, so,
        // it could be 3X of the maximum sheet square. This is because we multiply the maximum possible square of sheet by 3.0.
        // We calculate penalty for each part, so, multiply the resulting
        // maximum penalty by number of parts.
        // Resulting number ("max_penalty") is maximum possible penalty in squared source units.
        const double max_penalty = 3.0 * max_sheet_square * nesting_task->parts.size();
        const size_t max_size_t = std::numeric_limits<size_t>::max();
        // Calculate maximum allowable input scale in "size_t" units, because "double" type
        // could have overflows (usually size_t is 64-bit number, while double has 48-bit mantis integer number).
        const size_t max_input_scale = max_size_t / (static_cast<size_t>(max_penalty) + 1);
        // Decrease maximum allowable input scale by 10 as we did for coordinate scaling for safety (in size_t integer arithmetic)
        // and when cast the resulting scaling limitation to double type.
        const double scale_candidate_by_penalty = static_cast<double>(max_input_scale / 10);

        // Select the input scale as minimum value from two limits
        return std::min<double>(scale_candidate_by_coordinate, scale_candidate_by_penalty);
    }

    inline void toPolygons(const contour_t& contour, polygon_set_t& polygons, bool outer_contour)
    {
        std::vector<nfp_point_t> points;
        points.reserve(contour.size());
        for (auto cur_point : contour)
        {
            if (!g_calculating)
            {
                throw InterruptionException();
            }
            const int x = static_cast<int>(Config::Nfp::INPUT_SCALE * cur_point.x());
            const int y = static_cast<int>(Config::Nfp::INPUT_SCALE * cur_point.y());
            points.push_back(nfp_point_t(x, y));
        }
        polygon_t polygon;
        boost::polygon::set_points(polygon, points.begin(), points.end());
        if (!g_calculating)
        {
            throw InterruptionException();
        }
        using namespace boost::polygon::operators;
        if (outer_contour)
        {
            polygons += polygon;
        }
        else
        {
            polygons -= polygon;
        }
        if (!g_calculating)
        {
            throw InterruptionException();
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

    inline void convolveTwoSegments(std::vector<nfp_point_t>& figure, const edge_t& a, const edge_t& b)
    {
        if (!g_calculating)
        {
            throw InterruptionException();
        }
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
    inline void convolveTwoPointSequences(polygon_set_t& result, itrT1 ab, itrT1 ae, itrT2 bb, itrT2 be)
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
                convolveTwoSegments(vec, std::make_pair(prev_b, *tmpb), std::make_pair(prev_a, *ab));
                set_points(poly, vec.begin(), vec.end());
                result.insert(poly);
                prev_b = *tmpb;
            }
            prev_a = *ab;
        }
    }

    template <typename itrT>
    inline void convolvePointSequenceWithPolygons(polygon_set_t& result, itrT b, itrT e, const std::vector<polygon_t>& polygons)
    {
        using namespace boost::polygon;
        for (size_t i = 0; i < polygons.size(); ++i)
        {
            convolveTwoPointSequences(result, b, e, begin_points(polygons[i]), end_points(polygons[i]));
            for (polygon_with_holes_traits<polygon_t>::iterator_holes_type itrh = begin_holes(polygons[i]);
                itrh != end_holes(polygons[i]); ++itrh)
            {
                convolveTwoPointSequences(result, b, e, begin_points(*itrh), end_points(*itrh));
            }
        }
    }

    inline void convolveTwoPolygonSets(polygon_set_t& result, const polygon_set_t& a, const polygon_set_t& b)
    {
        using namespace boost::polygon;
        result.clear();
        std::vector<polygon_t> a_polygons;
        std::vector<polygon_t> b_polygons;
        a.get(a_polygons);
        b.get(b_polygons);

        for (size_t i = 0; i < b_polygons.size(); ++i)
        {
            scale(b_polygons[i], -1.0); // To detect NFP we need negative coordinates of polygon b
        }

        for (size_t ai = 0; ai < a_polygons.size(); ++ai)
        {
            convolvePointSequenceWithPolygons(result, begin_points(a_polygons[ai]),
                end_points(a_polygons[ai]), b_polygons);
            for (polygon_with_holes_traits<polygon_t>::iterator_holes_type itrh = begin_holes(a_polygons[ai]);
                itrh != end_holes(a_polygons[ai]); ++itrh)
            {
                convolvePointSequenceWithPolygons(result, begin_points(*itrh),
                    end_points(*itrh), b_polygons);
            }
            for (size_t bi = 0; bi < b_polygons.size(); ++bi)
            {
                polygon_t tmp_poly = a_polygons[ai];
                result.insert(convolve(tmp_poly, *(begin_points(b_polygons[bi]))));
                tmp_poly = b_polygons[bi];
                result.insert(convolve(tmp_poly, *(begin_points(a_polygons[ai]))));
            }
        }
    }

    inline const polygon_set_t& cachedInnerNfp(const polygon_set_ptr& a, const polygon_set_ptr& b)
    {
        // TODO: switch to std::unordered_map
        typedef std::map<std::pair<polygon_set_t*, polygon_set_t*>, polygon_set_ptr> inner_nfp_cache_t;
        static inner_nfp_cache_t inner_nfp_cache;

        inner_nfp_cache_t::key_type key(a.get(), b.get());
        inner_nfp_cache_t::iterator fit = inner_nfp_cache.find(key);
        if (fit == inner_nfp_cache.end())
        {
            using namespace boost::polygon;
            using namespace boost::polygon::operators;
            rectangle_t bounding_box;
            extents(bounding_box, *a);
            bloat(bounding_box, 10); // Some value which is bigger than 1 is OK, bounding box should just cover all sheet plus some small border

            polygon_set_t inverted_sheet;
            inverted_sheet += bounding_box;
            inverted_sheet -= *a;

            polygon_set_t negative_inner_nfp;
            convolveTwoPolygonSets(negative_inner_nfp, inverted_sheet, *b);

            polygon_set_ptr new_inner_nfp = boost::make_shared<polygon_set_t>();
            std::vector<polygon_t> negative_nfp_polygons;
            negative_inner_nfp.get(negative_nfp_polygons);

            for (auto& negative_nfp_polygon : negative_nfp_polygons)
            {
                for (polygon_with_holes_traits<polygon_t>::iterator_holes_type it = begin_holes(negative_nfp_polygon);
                    it != end_holes(negative_nfp_polygon); ++it)
                {
                    if (!g_calculating)
                    {
                        throw InterruptionException();
                    }
                    polygon_t polygon;
                    set_points(polygon, begin_points(*it), end_points(*it));
                    *new_inner_nfp += polygon;
                }
            }

            fit = inner_nfp_cache.insert(inner_nfp_cache_t::value_type(key, new_inner_nfp)).first;
        }
        return *fit->second;
    }

    inline const polygon_set_t& cachedOuterNfp(const polygon_set_ptr& a, const polygon_set_ptr& b)
    {
        // TODO: switch to std::unordered_map
        typedef std::map<std::pair<polygon_set_t*, polygon_set_t*>, polygon_set_ptr> outer_nfp_cache_t;
        static outer_nfp_cache_t outer_nfp_cache;

        outer_nfp_cache_t::key_type key(a.get(), b.get());
        outer_nfp_cache_t::iterator fit = outer_nfp_cache.find(key);
        if (fit == outer_nfp_cache.end())
        {
            polygon_set_ptr outer_nfp = boost::make_shared<polygon_set_t>();
            convolveTwoPolygonSets(*outer_nfp, *a, *b);

            fit = outer_nfp_cache.insert(outer_nfp_cache_t::value_type(key, outer_nfp)).first;
        }
        return *fit->second;
    }
}
