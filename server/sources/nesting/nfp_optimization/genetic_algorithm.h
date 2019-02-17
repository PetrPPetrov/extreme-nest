// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <list>
#include <random>
#include "config.h"
#include "nesting_task.h"

namespace Nfp
{
    using namespace GeneticAlgorithm;

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            part_ptr part;
            size_t variation;
        };
        struct Individual
        {
            std::list<Gene> genotype; // We need to use std::list for quick re-ordering
            size_t penalty;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;

    private:
        typedef std::list<individual_ptr> population_t;

        population_t population;
        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;


        individual_ptr randomIndividual() const
        {
            individual_ptr result = boost::make_shared<Individual>();
            // TODO:
            return result;
        }
        void calculatePenalty(individual_ptr individual) const
        {
            // TODO:
        }
        std::vector<individual_ptr> getRandomPair() const
        {
            // TODO: Extract this method to a common part
            const size_t max_random = POPULATION_SIZE * POPULATION_SIZE;
            std::vector<individual_ptr> result;
            result.reserve(2);
            while (result.size() < 2)
            {
                size_t index = 0;
                for (auto individual : population)
                {
                    if (!result.empty() && *result.begin() == individual)
                    {
                        continue;
                    }
                    if (uniform(engine) % max_random < 2 * (POPULATION_SIZE - index))
                    {
                        result.push_back(individual);
                        if (result.size() >= 2)
                        {
                            return result;
                        }
                    }
                    index++;
                }
            }
            return result; // Just to avoid compilation warning
        }
        population_t mate(const individual_ptr& male, const individual_ptr& female) const
        {
            population_t result;
            // TODO:
            return result;
        }
        void mutate(const individual_ptr& individual) const
        {
        }

    public:
        GeneticAlgorithm() :
            engine(std::random_device()())
        {
            // TODO: Generate Adam and the initial popolation
        }
        void calculatePenalties()
        {
            for (auto individual : population)
            {
                calculatePenalty(individual);
            }
        }
        void sort()
        {
            population.sort([](const individual_ptr& a, const individual_ptr& b)
            {
                return a->penalty < b->penalty;
            });
        }
        void nextGeneration()
        {
            // TODO: Extract to a common part
            population_t next_population;
            next_population.push_back(getBest());
            while (next_population.size() < POPULATION_SIZE)
            {
                auto pair = getRandomPair();
                population_t children = mate(pair[0], pair[1]);
                for (auto child : children)
                {
                    if (next_population.size() < POPULATION_SIZE)
                    {
                        mutate(child);
                        next_population.push_back(child);
                    }
                    else
                    {
                        break;
                    }
                }
            }
            population = next_population;
        }
        individual_ptr getBest() const
        {
            return *population.begin();
        }
    };
}
