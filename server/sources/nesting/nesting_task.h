// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <vector>
#include <boost/geometry.hpp>
#include <boost/geometry/geometries/point.hpp>
#include <boost/smart_ptr/shared_ptr.hpp>
#include <boost/smart_ptr/make_shared.hpp>

typedef boost::geometry::model::point<double, 2, boost::geometry::cs::cartesian> point2d_t;
typedef std::vector<point2d_t> contour2d_t;

struct Geometry
{
    std::vector<contour2d_t> geometry;
    std::vector<contour2d_t> holes;
};
typedef boost::shared_ptr<Geometry> geometry_ptr;

struct PartVariation
{
    geometry_ptr geometry;
    double angle = 0.0;
    bool flip = false;
};

struct Part
{
    std::vector<PartVariation> variations;
    int id = -1;
};
typedef boost::shared_ptr<Part> part_ptr;

struct PartInstantiation
{
    part_ptr part;
    point2d_t position;
    size_t instantiation_index = 0;
};

struct Sheet
{
    geometry_ptr geometry;
    int id = -1;
};
typedef boost::shared_ptr<Sheet> sheet_ptr;

struct NestingTask
{
    std::vector<part_ptr> parts;
    std::vector<sheet_ptr> sheets;
};
typedef boost::shared_ptr<NestingTask> nesting_task_ptr;

struct NestingResult
{
    std::vector<PartInstantiation> instantiations;
};
typedef boost::shared_ptr<NestingResult> nesting_result_ptr;
