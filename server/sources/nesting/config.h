// Copyright (c) 2019 by
// GkmSoft (individual entrepreneur Petr Petrovich Petrov)
// This file is part of Extreme Nest project.
// This software is intellectual property of GkmSoft.

#pragma once

namespace Config
{
    namespace Generic
    {
        static double ROTATION_ANGLE_STEP = 0.1;
        namespace Simplification
        {
            static bool RUN = true;
            static double TOLERANCE = 0.1;
            static bool HIGHEST_QUALITY = false;
        }
    }

    namespace GeneticAlgorithm
    {
        static size_t POPULATION_SIZE = 100;
        static size_t MUTATION_RATE = 10;
    }

    namespace Pr
    {
        static double POSITION_STEP = 0.1;
    }

    namespace Nfp
    {
        static double INPUT_SCALE = 100.0;
    }
}
