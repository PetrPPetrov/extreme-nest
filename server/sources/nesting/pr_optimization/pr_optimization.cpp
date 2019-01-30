// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include "pr_optimization.h"

namespace Pr
{

    class Nesting
    {
        const nesting_task_ptr& task;
        nesting_result_ptr result;
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
        }
    };

}

nesting_result_ptr Pr::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
