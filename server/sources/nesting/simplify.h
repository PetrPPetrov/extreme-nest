// (c) 2013, Vladimir Agafonkin
// Simplify.js, a high-performance JS polyline simplification library
// mourner.github.io/simplify-js
// modified by Jack Qiao
// ported from JavaScript to C++ by GkmSoft (individual entrepreneur Petr Petrovich Petrov)

#pragma once

#include "nesting_task.h"

// square distance between 2 points
inline double getSqDist(point_t p1, point_t p2)
{
    double dx = p1.x() - p2.x();
    double dy = p1.y() - p2.y();

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
inline double getSqSegDist(point_t p, point_t p1, point_t p2)
{
    double x = p1.x(),
        y = p1.y(),
        dx = p2.x() - x,
        dy = p2.y() - y;

    if (fabs(dx) >= std::numeric_limits<double>::epsilon() ||
        fabs(dy) >= std::numeric_limits<double>::epsilon())
    {
        double t = ((p.x() - x) * dx + (p.y() - y) * dy) / (dx * dx + dy * dy);

        if (t > 1)
        {
            x = p2.x();
            y = p2.y();

        }
        else if (t > 0)
        {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x() - x;
    dy = p.y() - y;

    return dx * dx + dy * dy;
}

// basic distance-based simplification
inline contour_t simplifyRadialDist(const contour_t& points, double sq_tolerance)
{
    if (points.empty())
    {
        return contour_t();
    }

    point_t prev_point = points.front();
    contour_t new_points;
    new_points.push_back(prev_point);
    point_t point;

    for (contour_t::const_iterator it = ++points.begin(); it != points.end(); ++it)
    {
        point = *it;

        if (getSqDist(point, prev_point) > sq_tolerance)
        {
            new_points.push_back(point);
            prev_point = point;
        }
    }

    if (points.size() > 1)
    {
        if (prev_point.x() != point.x() ||
            prev_point.y() != point.y())
        {
            new_points.push_back(point);
        }
    }

    return new_points;
}

inline void simplifyDPStep(
    const contour_t& points,
    contour_t::const_iterator first,
    contour_t::const_iterator last,
    double sq_tolerance,
    contour_t& simplified)
{
    double max_sq_dist = sq_tolerance;
    contour_t::const_iterator max_sq_dist_it;
    for (contour_t::const_iterator it = std::next(first); it != last; ++it)
    {
        double sq_dist = getSqSegDist(*it, *first, *last);

        if (sq_dist > max_sq_dist)
        {
            max_sq_dist_it = it;
            max_sq_dist = sq_dist;
        }
    }

    if (max_sq_dist > sq_tolerance)
    {
        if (std::next(first) != max_sq_dist_it)
        {
            simplifyDPStep(points, first, max_sq_dist_it, sq_tolerance, simplified);
        }
        simplified.push_back(*max_sq_dist_it);
        if (std::next(max_sq_dist_it) != last)
        {
            simplifyDPStep(points, max_sq_dist_it, last, sq_tolerance, simplified);
        }
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
inline contour_t simplifyDouglasPeucker(const contour_t& points, double sq_tolerance)
{
    if (points.empty())
    {
        return contour_t();
    }

    contour_t simplified;
    simplified.push_back(points.front());
    simplifyDPStep(points, points.begin(), std::prev(points.end()), sq_tolerance, simplified);
    simplified.push_back(points.back());

    return simplified;
}

// both algorithms combined for awesome performance
inline contour_t simplify(const contour_t& points, double tolerance, bool highest_quality)
{
    if (points.size() <= 2)
    {
        return points;
    }
    return simplifyDouglasPeucker(highest_quality ? points : simplifyRadialDist(points, tolerance), tolerance);
}
