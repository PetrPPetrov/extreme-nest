// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include "nfp_optimization.h"
#include "genetic_algorithm.h"

namespace Nfp
{
    class Nesting
    {
        const nesting_task_ptr& task;
        nesting_result_ptr result;

    public:
        Nesting(const nesting_task_ptr& task_) : task(task_)
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

nesting_result_ptr Nfp::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
