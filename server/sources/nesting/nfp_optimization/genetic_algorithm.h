// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <algorithm>
#include <vector>
#include <random>
#include <set>
#include <boost/geometry/algorithms/area.hpp>
#include "config.h"
#include "common.h"
#include "nesting_task.h"

namespace Nfp
{
    struct PartVariationInfo
    {
        PartVariation variation;
        polygons_t polygons;
    };
    typedef boost::shared_ptr<PartVariationInfo> part_variation_into_ptr;
    typedef std::vector<part_variation_into_ptr> part_variations_info_t;

    struct PartInfo
    {
        part_ptr part;
        part_variations_info_t variations_info;
        double area = 0.0;
        size_t index;
    };
    typedef boost::shared_ptr<PartInfo> part_info_ptr;

    inline part_info_ptr calculatePartInfo(const part_ptr& part)
    {
        part_info_ptr result = boost::make_shared<PartInfo>();
        result->part = part;
        result->variations_info.reserve(part->variations.size());
        for (auto variation : part->variations)
        {
            part_variation_into_ptr variation_info = boost::make_shared<PartVariationInfo>();
            variation_info->variation = variation;
            geometry_ptr actual_variation_geometry = variation.calculateActualGeometry();
            toPolygons(*actual_variation_geometry, variation_info->polygons);
            result->variations_info.push_back(variation_info);
        }
        for (auto& polygon : result->variations_info[0]->polygons)
        {
            result->area += boost::geometry::area(*polygon);
        }
        return result;
    }

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            size_t part_number;
            size_t variation;
            size_t max_variation;
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            size_t penalty;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;

    private:
        typedef std::list<individual_ptr> population_t;
        typedef std::vector<part_info_ptr> parts_info_t;

        parts_info_t parts_info;
        population_t population;
        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;

        void calculatePenalty(individual_ptr individual) const
        {
            // TODO:
        }
        std::vector<individual_ptr> getRandomPair() const
        {
            const size_t max_random = Config::GeneticAlgorithm::POPULATION_SIZE * Config::GeneticAlgorithm::POPULATION_SIZE;
            std::vector<individual_ptr> result;
            result.reserve(2);
            while (result.size() < 2)
            {
                size_t index = 0;
                for (auto individual : population)
                {
                    if (result.empty() || *result.begin() != individual)
                    {
                        if (uniform(engine) % max_random < 2 * (Config::GeneticAlgorithm::POPULATION_SIZE - index))
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
            std::set<size_t> male_based_parts;
            std::set<size_t> female_based_parts;

            for (size_t i = 0; i < cross_point; ++i)
            {
                const Gene& male_gene = male->genotype[i];
                male_based_child->genotype.push_back(male_gene);
                male_based_parts.insert(male_gene.part_number);

                const Gene& female_gene = female->genotype[i];
                female_based_child->genotype.push_back(female_gene);
                female_based_parts.insert(female_gene.part_number);
            }

            for (size_t i = 0; i < female->genotype.size(); ++i)
            {
                const Gene& female_gene = female->genotype[i];
                if (male_based_parts.find(female_gene.part_number) == male_based_parts.end())
                {
                    male_based_child->genotype.push_back(female_gene);
                    male_based_parts.insert(female_gene.part_number);
                }
            }
            for (size_t i = 0; i < male->genotype.size(); ++i)
            {
                const Gene& male_gene = male->genotype[i];
                if (female_based_parts.find(male_gene.part_number) == female_based_parts.end())
                {
                    female_based_child->genotype.push_back(male_gene);
                    female_based_parts.insert(male_gene.part_number);
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
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
                {
                    Gene& gene = individual->genotype[i];
                    gene.variation = uniform(engine) % gene.max_variation;
                }
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
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
        GeneticAlgorithm(const nesting_task_ptr& nesting_task) :
            engine(std::random_device()())
        {
            parts_info.reserve(nesting_task->parts.size());
            size_t index = 0;
            for (auto part : nesting_task->parts)
            {
                parts_info.push_back(calculatePartInfo(part));
                parts_info.back()->index = index++;
            }
            parts_info_t sorted_parts_info = parts_info; // Perform copy
            std::sort(sorted_parts_info.begin(), sorted_parts_info.end(), [](const part_info_ptr& element_a, const part_info_ptr& element_b)
            {
                return element_a->area > element_b->area;
            });

            individual_ptr adam = boost::make_shared<Individual>();
            for (auto& part_info : sorted_parts_info)
            {
                Gene new_gene;
                new_gene.part_number = part_info->index;
                new_gene.max_variation = part_info->variations_info.size();
                new_gene.variation = uniform(engine) % new_gene.max_variation;
                adam->genotype.push_back(new_gene);
            }
            population.push_back(adam);

            while (population.size() < Config::GeneticAlgorithm::POPULATION_SIZE)
            {
                individual_ptr new_child = boost::make_shared<Individual>();
                *new_child = *adam;
                mutate(new_child);
                population.push_back(new_child);
            }
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
            population_t next_population;
            next_population.push_back(getBest());
            while (next_population.size() < Config::GeneticAlgorithm::POPULATION_SIZE)
            {
                auto pair = getRandomPair();
                population_t children = mate(pair[0], pair[1]);
                for (auto child : children)
                {
                    if (next_population.size() < Config::GeneticAlgorithm::POPULATION_SIZE)
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
