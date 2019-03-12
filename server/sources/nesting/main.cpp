// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#if defined(_WIN32) && defined(_DEBUG)
#include <crtdbg.h>
#endif

#include <iostream>
#include <boost/system/system_error.hpp>
#include "nesting_request.h"
#include "nesting_task.h"
#include "extreme_error.h"
#include "pr_optimization/nest.h"
#include "nfp_optimization/nest.h"

int main(int argc, char** argv)
{
#if defined(_WIN32) && defined(_DEBUG)
    _CrtSetDbgFlag(_CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF);
#endif

    std::string nesting_method = "nfp";

    if (argc < 2)
    {
        std::cout << generateJson(
            Error("Insufficient command line arguments, Extreme Nest usage: extreme_nest nesting_request.json [nesting_method]"), 
            "Extreme Nest Copyright (c) 2019 by GkmSoft") << std::endl;
        return EXIT_FAILURE;
    }

    if (argc >= 3)
    {
        nesting_method = argv[2];
    }

    try
    {
        NestingRequest::Order nesting_order(argv[1]);
        nesting_task_ptr nesting_task = generateTask(nesting_order);
        nesting_result_ptr nesting_result;
        if (nesting_method == "nfp")
        {
            nesting_result = Nfp::Optimization().nest(nesting_task);
        }
        else
        {
            nesting_result = Pr::Optimization().nest(nesting_task);
        }
        std::string result_json = generateJson(*nesting_result, *nesting_task);
        std::cout << result_json << std::endl;
    }
    catch (boost::system::system_error& error)
    {
        std::cout << generateJson(Error(error.what())) << std::endl;
        return EXIT_FAILURE;
    }
    catch (const std::exception& exception)
    {
        std::cout << generateJson(Error(exception.what())) << std::endl;
        return EXIT_FAILURE;
    }
    catch (...)
    {
        std::cout << generateJson(Error("Unknown error")) << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
