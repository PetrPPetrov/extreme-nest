// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <algorithm>
#include <vector>
#include <random>
#include <set>
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
            const size_t max_variation;
            Gene(size_t max_variation_) : max_variation(max_variation_)
            {
            }
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            size_t penalty;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;

    private:
        typedef std::list<individual_ptr> population_t;

        population_t population;
        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;

        void calculatePenalty(individual_ptr individual) const
        {
            // TODO:
        }
        std::vector<individual_ptr> getRandomPair() const
        {
            const size_t max_random = POPULATION_SIZE * POPULATION_SIZE;
            std::vector<individual_ptr> result;
            result.reserve(2);
            while (result.size() < 2)
            {
                size_t index = 0;
                for (auto individual : population)
                {
                    if (result.empty() || *result.begin() != individual)
                    {
                        if (uniform(engine) % max_random < 2 * (POPULATION_SIZE - index))
                        {
                            result.push_back(individual);
                            if (result.size() >= 2)
                            {
                                return result;
                            }
                        }
                    }
                    index++;
                }
            }
            return result; // Just to avoid compilation warning
        }
        population_t mate(const individual_ptr& male, const individual_ptr& female) const
        {
            const size_t genes_count = male->genotype.size();
            const size_t genes_cross_area_size = genes_count * 80 / 10; // 80%
            const size_t genes_cross_area_base = genes_count * 10 / 10; // 10%
            size_t cross_point = (uniform(engine) % genes_cross_area_size + genes_cross_area_base) / 10;

            individual_ptr male_based_child = boost::make_shared<Individual>();
            individual_ptr female_based_child = boost::make_shared<Individual>();
            male_based_child->genotype.reserve(male->genotype.size());
            female_based_child->genotype.reserve(female->genotype.size());
            std::set<part_ptr> male_based_parts;
            std::set<part_ptr> female_based_parts;

            for (size_t i = 0; i < cross_point; ++i)
            {
                const Gene& male_gene = male->genotype[i];
                male_based_child->genotype.push_back(male_gene);
                male_based_parts.insert(male_gene.part);

                const Gene& female_gene = female->genotype[i];
                female_based_child->genotype.push_back(female_gene);
                female_based_parts.insert(female_gene.part);
            }

            for (size_t i = 0; i < female->genotype.size(); ++i)
            {
                const Gene& female_gene = female->genotype[i];
                if (male_based_parts.find(female_gene.part) == male_based_parts.end())
                {
                    male_based_child->genotype.push_back(female_gene);
                    male_based_parts.insert(female_gene.part);
                }
            }
            for (size_t i = 0; i < male->genotype.size(); ++i)
            {
                const Gene& male_gene = male->genotype[i];
                if (female_based_parts.find(male_gene.part) == female_based_parts.end())
                {
                    female_based_child->genotype.push_back(male_gene);
                    female_based_parts.insert(male_gene.part);
                }
            }

            population_t result;
            result.push_back(male_based_child);
            result.push_back(female_based_child);
            return result;
        }
        void mutate(const individual_ptr& individual) const
        {
            for (size_t i = 0; i < individual->genotype.size(); ++i)
            {
                if (uniform(engine) % 100 < MUTATION_RATE)
                {
                    Gene& gene = individual->genotype[i];
                    gene.variation = uniform(engine) % gene.max_variation;
                }
                if (uniform(engine) % 100 < MUTATION_RATE)
                {
                    size_t j = i + 1;
                    if (j >= individual->genotype.size())
                    {
                        j = 0;
                    }
                    std::swap(individual->genotype[i], individual->genotype[j]);
                }
            }
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
