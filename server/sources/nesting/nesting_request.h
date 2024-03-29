// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <list>
#include <boost/smart_ptr/shared_ptr.hpp>
#include <boost/smart_ptr/make_shared.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>

namespace NestingRequest
{
    struct Circle
    {
        double x = 0.0;
        double y = 0.0;
        bool dir = false;

        void load(const boost::property_tree::ptree& cir)
        {
            x = cir.get<double>("x");
            y = cir.get<double>("y");
            dir = cir.get<double>("dir");
        }
    };

    struct Point
    {
        enum Type
        {
            PointXY,
            ArcSag,
            ArcBul,
            ArcCir
        };

        Type type = PointXY;
        double x = 0.0;
        double y = 0.0;
        union
        {
            double sag;
            double bul;
            Circle cir;
        };

        Point(const boost::property_tree::ptree& point)
        {
            load(point);
        }
        void load(const boost::property_tree::ptree& point)
        {
            type = PointXY;
            if (!point.get_optional<double>("x").has_value() && !point.get_optional<double>("y").has_value())
            {
                if (point.size() >= 2)
                {
                    auto it = point.begin();
                    x = it->second.get_value<double>();
                    ++it;
                    y = it->second.get_value<double>();
                }
            }
            else
            {
                x = point.get<double>("x");
                y = point.get<double>("y");
                if (point.get_optional<double>("sag").has_value())
                {
                    type = ArcSag;
                    sag = point.get<double>("sag");
                }
                else if (point.get_optional<double>("bul").has_value())
                {
                    type = ArcBul;
                    bul = point.get<double>("bul");
                }
                else if (point.get_child_optional("cir").has_value())
                {
                    type = ArcCir;
                    cir.load(point.get_child("cir"));
                }
            }
        }
    };

    struct Contour
    {
        std::list<Point> points;

        Contour(const boost::property_tree::ptree& contour)
        {
            load(contour);
        }
        void load(const boost::property_tree::ptree& contour)
        {
            points.clear();
            for (auto& child : contour)
            {
                points.push_back(Point(child.second));
            }
        }
    };
    typedef boost::shared_ptr<Contour> contour_ptr;

    struct Orientation
    {
        enum Type
        {
            Punctual,
            RangeBased
        };

        Type type = Punctual;
        union
        {
            double angle;
            struct
            {
                double min_angle;
                double max_angle;
            };
        };
        bool flip = false;

        Orientation(const boost::property_tree::ptree& orientation)
        {
            load(orientation);
        }
        void load(const boost::property_tree::ptree& orientation)
        {
            if (orientation.get_optional<double>("angle").has_value())
            {
                type = Punctual;
                angle = orientation.get<double>("angle");
            }
            else
            {
                type = RangeBased;
                min_angle = orientation.get<double>("min_angle");
                max_angle = orientation.get<double>("max_angle");
            }
            flip = orientation.get<bool>("flip", false);
        }
    };

    struct Instance
    {
        std::list<Orientation> orientations;
        int id = -1;
        int quantity = 1;

        Instance(const boost::property_tree::ptree& instance)
        {
            load(instance);
        }
        void load(const boost::property_tree::ptree& instance)
        {
            orientations.clear();
            if (instance.get_child_optional("orientations").has_value())
            {
                for (auto& child : instance.get_child("orientations"))
                {
                    orientations.push_back(Orientation(child.second));
                }
            }
            id = instance.get<int>("id");
            quantity = instance.get<int>("quantity", 1);
        }
    };
    typedef boost::shared_ptr<Instance> instance_ptr;

    struct Part
    {
        std::list<contour_ptr> geometry;
        std::list<contour_ptr> holes;
        std::list<instance_ptr> instances;
        double protection_offset = 0.0;

        Part(const boost::property_tree::ptree& part)
        {
            load(part);
        }
        void load(const boost::property_tree::ptree& part)
        {
            geometry.clear();
            for (auto& child : part.get_child("geometry"))
            {
                geometry.push_back(boost::make_shared<Contour>(child.second));
            }
            holes.clear();
            if (part.get_child_optional("holes").has_value())
            {
                for (auto& child : part.get_child("holes"))
                {
                    holes.push_back(boost::make_shared<Contour>(child.second));
                }
            }
            instances.clear();
            for (auto& child : part.get_child("instances"))
            {
                instances.push_back(boost::make_shared<Instance>(child.second));
            }
            protection_offset = part.get<double>("protection_offset", 0.0);
            if (protection_offset < 0.0)
            {
                protection_offset = 0.0;
            }
        }
    };
    typedef boost::shared_ptr<Part> part_ptr;

    struct Sheet
    {
        double length = 10.0;
        double height = 10.0;
        contour_ptr contour;
        int id = -1;
        int quantity = 1;
        double border_gap = 0.0;
        std::list<contour_ptr> defects;

        Sheet(const boost::property_tree::ptree& sheet)
        {
            load(sheet);
        }
        void load(const boost::property_tree::ptree& sheet)
        {
            length = sheet.get<double>("length", 1.0);
            height = sheet.get<double>("height", 1.0);
            if (sheet.get_child_optional("contour").has_value())
            {
                contour = boost::make_shared<Contour>(sheet.get_child("contour"));
            }
            id = sheet.get<int>("id");
            quantity = sheet.get<int>("quantity", 1);
            border_gap = sheet.get<double>("border_gap", 0.0);
            if (border_gap < 0.0)
            {
                border_gap = 0.0;
            }
            defects.clear();
            if (sheet.get_child_optional("defects").has_value())
            {
                for (auto& child : sheet.get_child("defects"))
                {
                    defects.push_back(boost::make_shared<Contour>(child.second));
                }
            }
        }
    };
    typedef boost::shared_ptr<Sheet> sheet_ptr;

    struct NestedPart
    {
        int id;
        double angle;
        bool flip;
        Point position;

        NestedPart(const boost::property_tree::ptree& nested_part) : position(nested_part.get_child("position"))
        {
            load(nested_part);
        }
    private:
        void load(const boost::property_tree::ptree& nested_part)
        {
            id = nested_part.get<int>("id");
            angle = nested_part.get<double>("angle");
            flip = nested_part.get<bool>("flip", false);
        }
    };
    typedef boost::shared_ptr<NestedPart> nested_part_ptr;

    struct PreNesting
    {
        int sheet_id;
        int quantity = 1;
        std::list<nested_part_ptr> nested_parts;

        PreNesting(const boost::property_tree::ptree& prenesting)
        {
            load(prenesting);
        }
        void load(const boost::property_tree::ptree& prenesting)
        {
            sheet_id = prenesting.get<int>("sheet");
            quantity = prenesting.get<int>("quanity", 1);
            nested_parts.clear();
            for (auto& child : prenesting.get_child("nested_parts"))
            {
                nested_parts.push_back(boost::make_shared<NestedPart>(child.second));
            }
        }
    };
    typedef boost::shared_ptr<PreNesting> prenesting_ptr;

    struct Order
    {
        std::list<part_ptr> parts;
        std::list<sheet_ptr> sheets;
        double time = 10.0;
        std::list<prenesting_ptr> prenestings;

        Order(const std::string& file_name)
        {
            load(file_name);
        }
        Order(const boost::property_tree::ptree& order)
        {
            load(order);
        }
        void load(const std::string& file_name)
        {
            boost::property_tree::ptree request;
            boost::property_tree::read_json(file_name, request);
            load(request);
        }
        void load(const boost::property_tree::ptree& order)
        {
            parts.clear();
            for (auto& child : order.get_child("parts"))
            {
                parts.push_back(boost::make_shared<Part>(child.second));
            }
            sheets.clear();
            for (auto& child : order.get_child("sheets"))
            {
                sheets.push_back(boost::make_shared<Sheet>(child.second));
            }
            prenestings.clear();
            if (order.get_child_optional("pre_nestings").has_value())
            {
                for (auto& child : order.get_child("pre_nestings"))
                {
                    prenestings.push_back(boost::make_shared<PreNesting>(child.second));
                }
            }
            time = order.get<double>("time");
        }
    };
}
