// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

#include <vector>
#include "pr_optimization/cell_space.h"

namespace Pr
{
    struct PartVariationInfo
    {
        PartVariation variation;
        polygons_t polygons;
        box_t bounding_box;
        cell_box_t cell_box;
        point_t zero_position_inside_cell_box;
        cell_space_ptr cell_space;
    };
    typedef boost::shared_ptr<PartVariationInfo> part_variation_into_ptr;
    typedef std::vector<part_variation_into_ptr> part_variations_info_t;

    struct PartInfo
    {
        part_ptr part;
        part_variations_info_t variations_info;
    };
    typedef boost::shared_ptr<PartInfo> part_info_ptr;

    struct SheetInfo
    {
        sheet_ptr sheet;
        polygons_t polygons;
        box_t bounding_box;
        cell_box_t cell_box;
        point_t zero_position_inside_cell_box;
        cell_space_ptr cell_space;
    };
    typedef boost::shared_ptr<SheetInfo> sheet_info_ptr;

    class GeneticAlgorithm
    {
    public:
        struct Gene
        {
            size_t sheet_number;
            cell_t position;
            size_t variation;
            const size_t max_sheet_number;
            const size_t max_variation;
            Gene(size_t max_sheet_number_, size_t max_variation_) : max_sheet_number(max_sheet_number_), max_variation(max_variation_)
            {
            }
        };
        struct Individual
        {
            std::vector<Gene> genotype;
            size_t penalty = 0;
        };
        typedef boost::shared_ptr<Individual> individual_ptr;
    private:
        typedef std::list<individual_ptr> population_t;

        population_t population;
        std::vector<part_info_ptr> parts_info;
        std::vector<sheet_info_ptr> sheets_info;
        const size_t sum_sheet_area;

        mutable std::mt19937 engine;
        mutable std::uniform_int_distribution<size_t> uniform;

        individual_ptr randomIndividual() const
        {
            individual_ptr result = boost::make_shared<Individual>();
            result->genotype.reserve(parts_info.size());
            for (auto part_info : parts_info)
            {
                Gene new_gene(sheets_info.size(), part_info->variations_info.size());
                new_gene.sheet_number = uniform(engine) % new_gene.max_sheet_number;
                new_gene.position.x(uniform(engine) % sheets_info[new_gene.sheet_number]->cell_space->getSize().x());
                new_gene.position.y(uniform(engine) % sheets_info[new_gene.sheet_number]->cell_space->getSize().y());
                new_gene.variation = uniform(engine) % part_info->variations_info.size();
                result->genotype.push_back(new_gene);
            }
            return result;
        }
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
            size_t overlapped_cell_count = 0;
            std::vector<CellSpace> sheet_images;
            sheet_images.reserve(sheets_info.size());
            for (auto sheet_info : sheets_info)
            {
                sheet_images.push_back(*sheet_info->cell_space); // Perform copy
            }
            size_t part_index = 0;
            for (auto gene : individual->genotype)
            {
                const size_t sheet_number = gene.sheet_number;
                const cell_t position = gene.position;
                const CellSpace& part_variation_mask = *parts_info[part_index]->variations_info[gene.variation]->cell_space;
                overlapped_cell_count += sheet_images[sheet_number].merge(position, part_variation_mask);
                part_index++;
            }
            size_t total_penalty = 0;
            for (size_t i = 0; i < sheet_images.size(); ++i)
            {
                const CellSpace& sheet_image = sheet_images[i];
                const CellSpace& original_sheet_image = *sheets_info[i]->cell_space;
                size_t max_point_x = 0;
                size_t max_point_y = 0;
                for (int x = 0; x < sheet_image.getSize().x(); ++x)
                {
                    for (int y = 0; y < sheet_image.getSize().y(); ++y)
                    {
                        const cell_t point(x, y);
                        if (sheet_image.getCell(point) && !original_sheet_image.getCell(point))
                        {
                            if (x > max_point_x)
                            {
                                max_point_x = x;
                            }
                            if (y > max_point_y)
                            {
                                max_point_y = y;
                            }
                        }
                    }
                }
                const size_t size_y = original_sheet_image.getSize().y();
                // We need that penalty for overlapping should be bigger than any other penalties
                // As we use the sheet area for the used sheet count penalty
                // It could be so big as the sum of all sheets area
                // So, we should use 2 coefficient to guarantee that overlapping penalty is always bigger
                const size_t penalty_for_overlap = overlapped_cell_count * 5 * sum_sheet_area;
                const size_t penalty_for_used_sheet = sheet_image.getArea();
                const size_t penalty_for_used_sheet_length = max_point_x * size_y;
                const size_t penalty_for_used_sheet_height = max_point_y;

                const size_t sheet_penalty =
                    penalty_for_overlap + // This penalty is just to avoid part overlapping
                    penalty_for_used_sheet + // This penalty is to minimize the used sheet count (weighted according the area of each sheet)
                    penalty_for_used_sheet_length + // This penalty is to minimize the used area on each sheet
                    penalty_for_used_sheet_height; // This penalty (minimal contribution) is to minimize maximum vertical offset on the used part of the sheet

                total_penalty += sheet_penalty;
            }
            individual->penalty = total_penalty;
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
            const size_t genes_count = parts_info.size();
            const size_t genes_cross_area_size = genes_count * 80 / 10; // 80%
            const size_t genes_cross_area_base = genes_count * 10 / 10; // 10%
            size_t cross_point = (uniform(engine) % genes_cross_area_size + genes_cross_area_base) / 10;
            population_t result;
            individual_ptr child1 = boost::make_shared<Individual>();
            child1->genotype.reserve(genes_count);
            individual_ptr child2 = boost::make_shared<Individual>();
            child2->genotype.reserve(genes_count);
            for (size_t i = 0; i < genes_count; ++i)
            {
                if (i < cross_point)
                {
                    child1->genotype.push_back(male->genotype[i]);
                    child2->genotype.push_back(female->genotype[i]);
                }
                else
                {
                    child1->genotype.push_back(female->genotype[i]);
                    child2->genotype.push_back(male->genotype[i]);
                }
            }
            result.push_back(child1);
            result.push_back(child2);
            return result;
        }
        void mutate(const individual_ptr& individual) const
        {
            for (auto& gene : individual->genotype)
            {
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
                {
                    gene.sheet_number = uniform(engine) % sheets_info.size();
                    gene.position.x(gene.position.x() % sheets_info[gene.sheet_number]->cell_space->getSize().x());
                    gene.position.y(gene.position.y() % sheets_info[gene.sheet_number]->cell_space->getSize().y());
                }
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
                {
                    gene.position.x(uniform(engine) % sheets_info[gene.sheet_number]->cell_space->getSize().x());
                }
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
                {
                    gene.position.y(uniform(engine) % sheets_info[gene.sheet_number]->cell_space->getSize().y());
                }
                if (uniform(engine) % 100 < Config::GeneticAlgorithm::MUTATION_RATE)
                {
                    gene.variation = uniform(engine) % gene.max_variation;
                }
            }
        }
        size_t calculateSumSheetArea() const
        {
            size_t sum_sheet_area = 0;
            for (auto sheet_info : sheets_info)
            {
                const size_t sheet_area = sheet_info->cell_space->getSize().x() * sheet_info->cell_space->getSize().y();
                sum_sheet_area += sheet_area;
            }
            return sum_sheet_area;
        }
    public:
        GeneticAlgorithm(const std::vector<part_info_ptr>& parts_info_, const std::vector<sheet_info_ptr>& sheets_info_) :
            parts_info(parts_info_), sheets_info(sheets_info_),
            engine(std::random_device()()), sum_sheet_area(calculateSumSheetArea())
        {
            for (size_t i = 0; i < Config::GeneticAlgorithm::POPULATION_SIZE; ++i)
            {
                population.push_back(randomIndividual());
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
