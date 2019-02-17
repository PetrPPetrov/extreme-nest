// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include "nesting_task.h"

namespace Nfp
{
    struct Optimization
    {
        nesting_result_ptr nest(const nesting_task_ptr& task);
    };
}
