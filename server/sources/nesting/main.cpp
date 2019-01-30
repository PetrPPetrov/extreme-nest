// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <iostream>
#include <boost/system/system_error.hpp>
#include "log.h"
#include "nesting_request.h"
#include "nesting_task.h"

extern std::ofstream* g_log_file = nullptr;

int main(int argc, char** argv)
{
    std::cout << "Extreme Nest Copyright (c) 2019 by GkmSoft" << std::endl;

    if (argc < 2)
    {
        std::cout << "Extreme Nest usage: extreme_nest nesting_request.json" << std::endl;
        return EXIT_FAILURE;
    }

    LogFileHolder log_file_holder;
    g_log_file = new std::ofstream("extreme_nest.log", std::ios::app);
    LOG_INFO << "Extreme Nest is starting..." << std::endl;

    try
    {
        NestingRequest::Order nesting_order(argv[1]);
        std::cout << "time " << nesting_order.time << std::endl;
        nesting_task_ptr nesting_task = generateTask(nesting_order);
    }
    catch (boost::system::system_error& error)
    {
        LOG_FATAL << "boost::system::system_error: " << error.what() << std::endl;
        return EXIT_FAILURE;
    }
    catch (const std::exception& exception)
    {
        LOG_FATAL << "std::exception: " << exception.what() << std::endl;
        return EXIT_FAILURE;
    }
    catch (...)
    {
        LOG_FATAL << "Unknown error" << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
