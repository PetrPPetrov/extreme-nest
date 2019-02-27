Pre Requireristics
==================

To build Extreme-Nest RESTfull server to need to install:
* Microsoft Visual Studio 2017 (or Microsoft Visual Studio 2015)
* CMake build system, version 3.2 or higher (for Extreme-Nest C++ module)
* Python 2.x interpreter (for node-gyp, used by Deep-Nest Minkowski C++ addon)
* boost 1.60.0 library or higher, you can download a pre-built binaries from:
    * 64-bit for Visual Studio 2017 https://sourceforge.net/projects/boost/files/boost-binaries/1.69.0/boost_1_69_0-msvc-14.1-64.exe/download
    * 64-bit for Visual Studio 2015 https://sourceforge.net/projects/boost/files/boost-binaries/1.69.0/boost_1_69_0-msvc-14.0-64.exe/download

First, you need to run 'npm install' from this folder.

After that, you can start server by using 'npm run start' command.

For debugging purposes you can use 'npm run debug' command.

TODO for Extreme Nest:
======================
* ~~Add support for orientations~~
* ~~Add support for flip flag~~
* ~~Add support of multiple sheets~~
* Add support for protection offset (it is hard to estimate the required time for now)
* Add support for border gap for sheets (it is hard to estimate the required time for now)
* Add support for arcs (should not take too much time, maybe 1-2 days)
* Add support of infinite sheet length (should not take too much time, maybe 1-2 days; I think that "infinite" sheet will be finite sheet which it slightly bigger that length of all parts in their maximum orientation)
* Add support of non-rectangular sheets (should not take too much time, maybe 1-2 days)
* Add support for pre-nesting (should not take too much time, maybe 1-2 days)
* Add support for defects on sheet (should not take too much time, maybe 1-2 days)
* Add configuration file or command line options (should not take too much time, maybe 1-2 days)

Ideas for optimization for Extreme Nest:
========================================
* Introduce QTree for memory size & bandwidth optimization
* Optimize part variation mask creation step - use QTree for that
* Optimize part variation mask creation step - use quantity parameter

Ideas for Extreme Nest:
=======================
* Add support of automation position tolerance calculation (for instance, minimum distance between points)
* Use bitwise level for position x and position y during individual mate and mutation
* Use two gene alleles, simulate dominant and recessive genes
* Implement NFP algorithm fully in C++, i.e. as part of Extreme Nest
* Implement neural network algorithm for nesting

TODO for NFP Optimization (NoFitPolygon, Minkowski summ and other parts in C++):
================================================================================
* CalculateFitness
* Implement simplification for contours and holes (for a faster calculation)

Ideas for NFP Optimization (NoFitPolygon, Minkowski summ and other parts in C++):
=================================================================================
* Use something like optimized QTree instead of simplification
* Add "insertion place" parameter for genetic optimization (insertion order, variation index, insertion place)

TODO for Deep Nest (NoFitPolygon, Minkowski summ in C++ as Node.js addon, other parts in JavaScript):
===================
* Add support for orientations
* Add support for flip flag
* Add support of infinite sheet length
* Add support of non-rectangular sheets
* Add support for pre-nesting
* Add suppurt for defects on sheet
* Add support for arcs
* Add support for protection offset
* Add support for border gap (for sheets)
