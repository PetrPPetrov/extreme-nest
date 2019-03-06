// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#include <chrono>
#include <thread>
#include <mutex>
#include "config.h"
#include "nfp_optimization/nest.h"
#include "nfp_optimization/nofit_polygon.h"
#include "nfp_optimization/genetic_algorithm.h"

namespace Nfp
{
    class Nesting
    {
        const nesting_task_ptr& task;
        nesting_result_ptr result;
        size_t generation_count = 0;
        GeneticAlgorithm::individual_ptr best;
        std::mutex mutex_for_best;
        bool calculating = true;

        void fillResult(const GeneticAlgorithm::individual_ptr& best)
        {
            result = boost::make_shared<NestingResult>();

            //TODO:
        }
    public:
        Nesting(const nesting_task_ptr& task_) : task(task_)
        {
        }
        nesting_result_ptr getResult()
        {
            return result;
        }
        void runInThread()
        {
            Config::Nfp::INPUT_SCALE = Nfp::calculateInputScale(task);

            GeneticAlgorithm genetic_algorithm(task);

            while (calculating)
            {
                genetic_algorithm.calculatePenalties();
                genetic_algorithm.sort();
                {
                    std::lock_guard<std::mutex> guard(mutex_for_best);
                    best = genetic_algorithm.getBest();
                }
                genetic_algorithm.nextGeneration();
                ++generation_count;
            }
        }
        void run()
        {
            std::thread calculation_thread(&Nesting::runInThread, this);
            calculation_thread.detach();
            std::this_thread::sleep_for(std::chrono::seconds(static_cast<int>(task->time_in_seconds)));
            GeneticAlgorithm::individual_ptr current_best;
            {
                std::lock_guard<std::mutex> guard(mutex_for_best);
                current_best = best;
                calculating = false;
            }
            if (!current_best)
            {
#ifdef _DEBUG
                std::cout << "best is null" << std::endl;
#endif
                throw std::runtime_error("not enough time to calculate nesting");
            }
            fillResult(current_best);
#ifdef _DEBUG
            std::cout << "generation count " << generation_count << std::endl;
            std::cout << "best penalty " << current_best->penalty << std::endl;
#endif
        }
    };
}

nesting_result_ptr Nfp::Optimization::nest(const nesting_task_ptr& task)
{
    Nesting nesting(task);
    nesting.run();
    return nesting.getResult();
}
