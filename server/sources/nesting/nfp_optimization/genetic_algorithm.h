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
#include "nesting_task.h"
#include "nofit_polygon.h"

namespace Nfp
{
    struct PartVariationInfo
    {
        PartVariation variation;
        polygon_set_ptr polygons;
        rectangle_t bounding_box;
    };
    typedef boost::shared_ptr<PartVariationInfo> part_variation_into_ptr;
    typedef std::vector<part_variation_into_ptr> part_variations_info_t;

    struct PartInfo
    {
        part_ptr part;
        part_variations_info_t variations_info;
        long double area = 0.0;
        size_t index;
    };
    typedef boost::shared_ptr<PartInfo> part_info_ptr;
    typedef std::vector<part_info_ptr> parts_info_t;

    struct SheetInfo
    {
        sheet_ptr sheet;
        polygon_set_ptr polygons;
        long double area = 0.0;
        rectangle_t bounding_box;
    };
    typedef boost::shared_ptr<SheetInfo> sheet_info_ptr;
    typedef std::vector<sheet_info_ptr> sheets_info_t;

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            size_t part_number;
            size_t variation;
            size_t max_variation;
            nfp_point_t placement;
            size_t sheet_number;
            bool placed = false;
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            size_t penalty = 0;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;

    private:
        typedef std::list<individual_ptr> population_t;

        const parts_info_t& parts_info;
        const sheets_info_t& sheets_info;
        long double sum_sheet_area = 0.0;
        population_t population;
        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;

    public:
        void calculatePenalty(individual_ptr individual) const
        {
            if (individual->penalty)
            {
                // If this individual already contains some calculated
                // penalty then use the calculated penalty.
                // This happens for best individual who goes
                // to the next generation without any mutations.
                return;
            }

            for (size_t gene_index = 0; gene_index < individual->genotype.size(); ++gene_index)
            {
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
                Gene& gene = individual->genotype[gene_index];
                gene.placed = false;
                part_info_ptr part_info = parts_info[gene.part_number];
                // Make initial placement of part
                size_t min_local_penalty = 0;
                for (size_t sheet_number = 0; sheet_number < sheets_info.size(); ++sheet_number)
                {
                    const sheet_info_ptr sheet_info = sheets_info[sheet_number];
                    // Very basic check: the selected sheet must have the same
                    // or bigger area than the specified part
                    if (sheet_info->area >= part_info->area)
                    {
                        using namespace boost::polygon;
                        using namespace boost::polygon::operators;

                        const polygon_set_ptr& current_part_geometry = part_info->variations_info[gene.variation]->polygons;
                        const polygon_set_t& inner_nfp = cachedInnerNfp(sheet_info->polygons, current_part_geometry);

                        if (!inner_nfp.empty())
                        {
                            polygon_set_t combined_outer_nfp;

                            for (size_t prev_gene_index = 0; prev_gene_index < gene_index; ++prev_gene_index)
                            {
                                const Gene& prev_gene = individual->genotype[prev_gene_index];
                                if (prev_gene.placed && prev_gene.sheet_number == sheet_number)
                                {
                                    const polygon_set_ptr& variation_geometry = parts_info[prev_gene.part_number]->variations_info[prev_gene.variation]->polygons;
                                    const polygon_set_t& outer_nfp = cachedOuterNfp(variation_geometry, current_part_geometry);

                                    std::vector<polygon_t> outer_nfp_polygons;
                                    outer_nfp.get(outer_nfp_polygons);
                                    for (auto& outer_nfp_polygon : outer_nfp_polygons)
                                    {
                                        // Move outer NFP according the current part placement
                                        move(outer_nfp_polygon, HORIZONTAL, x(prev_gene.placement));
                                        move(outer_nfp_polygon, VERTICAL, y(prev_gene.placement));
                                        combined_outer_nfp += outer_nfp_polygon; // Union of all part NFP
                                    }
                                }
                            }
                            const polygon_set_t final_nfp = inner_nfp - combined_outer_nfp;

                            iterateAllPoints(final_nfp, [this, &min_local_penalty, &gene, sheet_number, sheet_info](const nfp_point_t& point)
                            {
                                if (!g_calculating)
                                {
                                    throw InterruptionException();
                                }
                                size_t penalty_for_used_sheet = static_cast<size_t>(sheet_info->area);
                                const rectangle_t& bounding_box = this->parts_info[gene.part_number]->variations_info[gene.variation]->bounding_box;
                                const size_t max_point_x = x(point) + xh(bounding_box);
                                const size_t size_y = yh(sheet_info->bounding_box);
                                const size_t penalty_for_used_sheet_length = max_point_x * size_y;
                                const size_t penalty_for_used_sheet_height = y(point) + yh(bounding_box);
                                const size_t local_penalty = penalty_for_used_sheet + penalty_for_used_sheet_length + penalty_for_used_sheet_height;

                                if (!gene.placed || local_penalty < min_local_penalty)
                                {
                                    gene.placement = point;
                                    gene.sheet_number = sheet_number;
                                    gene.placed = true;
                                    min_local_penalty = local_penalty;
                                }
                            });
                        }
                    }
                }
                if (!gene.placed)
                {
                    // Could not insert this part, add increase penalty
                    individual->penalty += 5 * static_cast<size_t>(sum_sheet_area);
                    gene.placement = nfp_point_t(0, 0);
                    gene.sheet_number = 0;
                }
                else
                {
                    individual->penalty += min_local_penalty;
                }
            }
        }
        private:
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
        long double calculateSumSheetArea() const
        {
            long double sum_sheet_area = 0.0;
            for (auto sheet_info : sheets_info)
            {
                sum_sheet_area += sheet_info->area;
            }
            return sum_sheet_area;
        }
    public:
        GeneticAlgorithm(const std::vector<part_info_ptr>& parts_info_, const std::vector<sheet_info_ptr>& sheets_info_) :
            parts_info(parts_info_), sheets_info(sheets_info_),
            engine(std::random_device()()), sum_sheet_area(calculateSumSheetArea())
        {
            parts_info_t sorted_parts_info = parts_info; // Perform copy
            std::sort(sorted_parts_info.begin(), sorted_parts_info.end(), [](const part_info_ptr& element_a, const part_info_ptr& element_b)
            {
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
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
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
            }
            population.push_back(adam);

            while (population.size() < Config::GeneticAlgorithm::POPULATION_SIZE)
            {
                individual_ptr new_child = boost::make_shared<Individual>();
                *new_child = *adam;
                mutate(new_child);
                population.push_back(new_child);
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
            }
        }
        void calculatePenalties()
        {
            for (auto individual : population)
            {
                calculatePenalty(individual);
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
            }
        }
        void sort()
        {
            population.sort([](const individual_ptr& a, const individual_ptr& b)
            {
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
                return a->penalty < b->penalty;
            });
        }
        void nextGeneration()
        {
            population_t next_population;
            next_population.push_back(getBest());
            while (next_population.size() < Config::GeneticAlgorithm::POPULATION_SIZE)
            {
                if (!g_calculating)
                {
                    throw InterruptionException();
                }
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
