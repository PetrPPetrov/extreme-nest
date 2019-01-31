// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include "config.h"
#include "common.h"
#include "pr_optimization.h"

namespace Pr
{
    class GeneticAlgorithm
    {

    };

    class Nesting
    {
        const nesting_task_ptr& task;
        nesting_result_ptr result;

        struct SheetInfo
        {
            sheet_ptr sheet;
            std::list<polygon_ptr> sheet_polygons;
            box_t bounding_box;
            size_t max_position_x = 1;
            size_t max_position_y = 1;
        };
        typedef boost::shared_ptr<SheetInfo> sheet_info_ptr;
        std::vector<sheet_info_ptr> sheets_info;

        sheet_info_ptr calculateSheetInfo(const sheet_ptr& sheet)
        {
            sheet_info_ptr result = boost::make_shared<SheetInfo>();
            result->sheet = sheet;
            toPolygons(*sheet->geometry, result->sheet_polygons);
            result->bounding_box = calculateBoundingBox(result->sheet_polygons);
            const double delta_x = result->bounding_box.max_corner().x() - result->bounding_box.min_corner().x();
            const double delta_y = result->bounding_box.max_corner().y() - result->bounding_box.min_corner().y();
            result->max_position_x = static_cast<size_t>(delta_x / POSITION_STEP);
            result->max_position_y = static_cast<size_t>(delta_y / POSITION_STEP);
            return result;
        }
        void calculateSheetInfos()
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
            calculateSheetInfos();
        }
    };
}

nesting_result_ptr Pr::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
