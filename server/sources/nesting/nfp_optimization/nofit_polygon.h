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

    inline void accumulateMinMax(point_t& min_point, point_t& max_point, const point_t& point)
    {
        accumulateMin(min_point, point);
        accumulateMax(max_point, point);
    }

    inline void accumulate(point_t& max_point, point_t& min_point, const geometry_ptr& geometry)
    {
        for (auto contour : geometry->outer_contours)
        {
            for (auto point : contour)
            {
                accumulateMinMax(min_point, max_point, point);
            }
        }
        for (auto hole : geometry->holes)
        {
            for (auto point : hole)
            {
                accumulateMinMax(min_point, max_point, point);
            }
        }
    }

    inline void calculate_size(point_t& result_size, const geometry_ptr& geometry, double max_protection_offset)
    {
        point_t part_max_point(-std::numeric_limits<double>::max(), -std::numeric_limits<double>::max());
        point_t part_min_point(std::numeric_limits<double>::max(), std::numeric_limits<double>::max());
        accumulate(part_max_point, part_min_point, geometry);

        point_t size;
        size.x(part_max_point.x() - part_min_point.x() + 2 * max_protection_offset);
        size.y(part_max_point.y() - part_min_point.y() + 2 * max_protection_offset);

        double max_coordinate = std::max(size.x(), size.y());

        result_size.x(result_size.x() + max_coordinate);
        result_size.y(result_size.y() + max_coordinate);
    }

    inline double calculateInputScale(const nesting_task_ptr& nesting_task)
    {
        double max_protection_offset = 0.0;
        for (auto part : nesting_task->parts)
        {
            if (!g_calculating)
            {
                throw InterruptionException();
            }
            if (part->protection_offset > max_protection_offset)
            {
                max_protection_offset = part->protection_offset;
            }
        }

        point_t max_point(-std::numeric_limits<double>::max(), -std::numeric_limits<double>::max());
        point_t min_point(std::numeric_limits<double>::max(), std::numeric_limits<double>::max());
        for (auto sheet : nesting_task->sheets)
        {
            accumulate(max_point, min_point, sheet->geometry);
        }

        point_t max_size(0.0, 0.0);
        for (auto part : nesting_task->parts)
        {
            calculate_size(max_size, part->variations[0].source_geometry, max_protection_offset);
        }

        point_t possible_min;
        possible_min.x(min_point.x() - max_size.x());
        possible_min.y(min_point.y() - max_size.y());

        point_t possible_max;
        possible_max.x(max_point.x() + max_size.x());
        possible_max.y(max_point.y() + max_size.y());

        accumulateMin(min_point, possible_min);
        accumulateMax(max_point, possible_max);

        for (auto part : nesting_task->parts)
        {
            accumulate(max_point, min_point, part->variations[0].source_geometry);
        }

        min_point.x(min_point.x() - max_protection_offset);
        min_point.y(min_point.y() - max_protection_offset);
        max_point.x(max_point.x() + max_protection_offset);
        max_point.y(max_point.y() + max_protection_offset);
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
        // causing integer overflow. So, /16.0 is for safety only,
        // just to make sure that we avoid integer overflows.
        const double scale_candidate_by_coordinate = static_cast<double>(max_integer) / max_coordinate / 16.0;

        // Nest step is to calculate limits due possible penalty function overflow.
        // For penalty function we use "size_t" type.
        // We must avoid cases when we will have integer overflows in "size_t" type
        // during penalty function calculating.

        // We calculate maximum possible area of sheet
        // Because our maximum coordinate is absolute,
        // it is possible that a maximum sheet is a rectangle from
        // (-max_coordinate, -max_coordinate) point to (max_coordinate, max_coordinate) point.
        // So, max_coordinate * max_coordinate is quarter area of a total maximum possible sheet.
        // So, we need to multiply max_coordinate * max_coordinate by 4.0 to calculate maximum possible area of sheet.
        const double max_sheet_area = 4.0 * max_coordinate * max_coordinate;

        // Calculate maximum area of all sheets
        const double max_all_sheet_area = nesting_task->sheets.size() * max_sheet_area;

        // Maximum penalty for one part is 5.0 * max_all_sheet_area
        // Resulting number ("max_penalty") is maximum possible penalty in squared source units.
        const double max_penalty = 5.0 * nesting_task->parts.size() * max_all_sheet_area;

        const size_t max_size_t = std::numeric_limits<size_t>::max();
        // Calculate maximum allowable input scale in "size_t" units, because "double" type
        // could have overflows (usually size_t is 64-bit number, while double has 48-bit mantis integer number).
        const size_t max_input_scale = max_size_t / (static_cast<size_t>(max_penalty) + 1);
        // Decrease maximum allowable input scale by 16 as we did for coordinate scaling for safety (in size_t integer arithmetic)
        // and when cast the resulting scaling limitation to double type.
        const double scale_candidate_by_penalty = static_cast<double>(max_input_scale / 16);

        // Select the input scale limit as minimum value from two limits
        const double final_limit = std::min<double>(scale_candidate_by_coordinate, scale_candidate_by_penalty);

        // Select actual scale as power of two for a better accuracy
        const double half_final_limit = final_limit / 2.0;
        double result_scale = 1.0;
        while (result_scale < half_final_limit)
        {
            result_scale *= 2;
        }
        return result_scale;
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

    inline const polygon_set_t& cachedInnerNfp(const polygon_set_ptr& a, const polygon_set_ptr& b, double border_gap)
    {
        struct inner_nfp_t
        {
            polygon_set_ptr result;
            double border_gap = 0.0;
        };
        // TODO: switch to std::unordered_map
        typedef std::map<std::pair<polygon_set_t*, polygon_set_t*>, inner_nfp_t> inner_nfp_cache_t;
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
            if (border_gap > 0.0)
            {
                inverted_sheet.bloat(static_cast<int>(Config::Nfp::INPUT_SCALE * border_gap));
            }

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

            inner_nfp_t inner_nfp_info;
            inner_nfp_info.result = new_inner_nfp;
            inner_nfp_info.border_gap = border_gap;

            fit = inner_nfp_cache.insert(inner_nfp_cache_t::value_type(key, inner_nfp_info)).first;
        }

        if (fit->second.border_gap != border_gap)
        {
            assert(false);
            throw std::runtime_error("different border gap!");
        }

        return *fit->second.result;
    }

    inline const polygon_set_t& cachedOuterNfp(const polygon_set_ptr& a, const polygon_set_ptr& b, double effective_protection_offset)
    {
        struct outer_nfp_t
        {
            polygon_set_ptr result;
            double effective_protection_offset = 0.0;
        };
        // TODO: switch to std::unordered_map
        typedef std::map<std::pair<polygon_set_t*, polygon_set_t*>, outer_nfp_t> outer_nfp_cache_t;
        static outer_nfp_cache_t outer_nfp_cache;

        outer_nfp_cache_t::key_type key(a.get(), b.get());
        outer_nfp_cache_t::iterator fit = outer_nfp_cache.find(key);
        if (fit == outer_nfp_cache.end())
        {
            polygon_set_ptr outer_nfp = boost::make_shared<polygon_set_t>();

            if (effective_protection_offset > 0.0)
            {
                polygon_set_t a_for_bloating = *a;
                a_for_bloating.bloat(static_cast<int>(Config::Nfp::INPUT_SCALE * effective_protection_offset));
                convolveTwoPolygonSets(*outer_nfp, a_for_bloating, *b);
            }
            else
            {
                convolveTwoPolygonSets(*outer_nfp, *a, *b);
            }

            outer_nfp_t outer_nfp_info;
            outer_nfp_info.result = outer_nfp;
            outer_nfp_info.effective_protection_offset = effective_protection_offset;

            fit = outer_nfp_cache.insert(outer_nfp_cache_t::value_type(key, outer_nfp_info)).first;
        }
        if (fit->second.effective_protection_offset != effective_protection_offset)
        {
            assert(false);
            throw std::runtime_error("different effective protection offset!");
        }

        return *fit->second.result;
    }
}
