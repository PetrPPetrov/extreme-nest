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

TODO for NFP Optimization (NoFitPolygon, Minkowski summ and other parts in C++):
================================================================================
* ~~CalculateFitness~~
* Add support of infinite sheet length
* Add support of non-rectangular sheets
* Add support for pre-nesting
* Add suppurt for defects on sheet
* Add support for arcs
* Add support for protection offset
* Add support for border gap (for sheets)
* ~~Implement simplification for contours and holes (for a faster calculation)~~

Ideas for NFP Optimization (NoFitPolygon, Minkowski sum and other parts in C++):
=================================================================================
* Use something like optimized QTree instead of simplification
* Add "insertion place" parameter for genetic optimization (insertion order, variation index, insertion place as angle):
> Maybe angle of the point on the NFP with respect to the centroid of the NFP. And then you have a variable from 0 to 2pi

TODO for Extreme Nest (PR optimization - now suspended):
========================================================
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

Ideas for optimization (PR optimization - now suspended):
=========================================================
* Introduce QTree for memory size & bandwidth optimization
* Optimize part variation mask creation step - use QTree for that
* Optimize part variation mask creation step - use quantity parameter
* Use boost.polygon's polygon_90 instead of QTree (should take much lesser memory), it could be 100X faster than generic polygon operations. From boost.polygon.polygon_90 documentation:

> The motivation for providing the polygon_90_set_concept is that it is a very common special case of planar geometry which afford the implementation of a variety of optimizations on the general planar geometry algorithms.  Manhattan geometry processing by the polygon_90_set_concept can be 100X faster than arbitrary angle polygon manipulation.  Because the performance benefits are so large and the special case is important enough, the library provides these performance benefits for those application domains that require them.

Ideas for Extreme Nest (PR optimization - now suspended):
=========================================================
* Add support of automation position tolerance calculation (for instance, minimum distance between points)
* Use bitwise level for position x and position y during individual mate and mutation
* Use two gene alleles, simulate dominant and recessive genes

TODO for Deep Nest (NoFitPolygon, Minkowski sum in C++ as Node.js addon, other parts in JavaScript - now suspended):
====================================================================================================================
* Add support for orientations
* Add support for flip flag
* Add support of infinite sheet length
* Add support of non-rectangular sheets
* Add support for pre-nesting
* Add suppurt for defects on sheet
* Add support for arcs
* Add support for protection offset
* Add support for border gap (for sheets)

Generic TODO:
=============
* ~~Run optimization in a thread, wait in the main thread for a specified time, get results and kill the calculation thread~~

Generic Ideas:
==============
* ~~Implement NFP algorithm fully in C++, i.e. as part of Extreme Nest~~
* Use Microsoft Azure or something other for running nesting requests in parallel?
* Implement neural network algorithm for nesting

Nesting errors:
===============

* <a href="./run_area/failed/1.json">#1 Request</a> [ [count figures = 12], [sheet width = 8], [sheet height = 4], [time = 15s] ] - Not enough figures
* <a href="./run_area/failed/2.json">#2 Request</a> [ [count figures = 4], [sheet width = 2], [sheet height = 2], [time = 30s] ] - Not enough figures
