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

Imported nestings:
===============

* albano - Was not visualized(huge size)

* blaz - Little suboptimal nesting

<p align="center">
    <img alt="blaz" src="./run_area/imported_nesting/blaz.png" width="960"/>
</p>

* dagli - Little suboptimal nesting(sometimes server crashed)

<p align="center">
    <img alt="dagli" src="./run_area/imported_nesting/dagli.png" width="960"/>
</p>

* dighe1 - Little suboptimal nesting(sometimes server crashed)

<p align="center">
    <img alt="dighe1" src="./run_area/imported_nesting/dighe1.png" width="960"/>
</p>

* dighe2 - Large suboptimal nesting

<p align="center">
    <img alt="dighe2" src="./run_area/imported_nesting/dighe2.png" width="960"/>
</p>

* fu - Little suboptimal nesting

<p align="center">
    <img alt="fu" src="./run_area/imported_nesting/fu.png" width="960"/>
</p>

* han - Large suboptimal nesting

<p align="center">
    <img alt="han" src="./run_area/imported_nesting/han.png" width="960"/>
</p>

* jackobs1 - Little suboptimal nesting

<p align="center">
    <img alt="jackobs1" src="./run_area/imported_nesting/jackobs1.png" width="960"/>
</p>

* jackobs2 - Little suboptimal nesting

<p align="center">
    <img alt="jackobs2" src="./run_area/imported_nesting/jackobs2.png" width="960"/>
</p>

* mao - Was not visualized(huge size)

* marques - Little suboptimal nesting

<p align="center">
    <img alt="marques" src="./run_area/imported_nesting/marques.png" width="960"/>
</p>

* poly1a - Little suboptimal nesting

<p align="center">
    <img alt="poly1a" src="./run_area/imported_nesting/poly1a.png" width="960"/>
</p>

* poly2b - Large suboptimal nesting

<p align="center">
    <img alt="poly2b" src="./run_area/imported_nesting/poly2b.png" width="960"/>
</p>

* poly3b - Large suboptimal nesting

<p align="center">
    <img alt="poly3b" src="./run_area/imported_nesting/poly3b.png" width="960"/>
</p>

* poly4b - Large suboptimal nesting

<p align="center">
    <img alt="poly4b" src="./run_area/imported_nesting/poly4b.png" width="960"/>
</p>

* poly5b - Large suboptimal nesting

<p align="center">
    <img alt="poly5b" src="./run_area/imported_nesting/poly5b.png" width="960"/>
</p>

* shapes0 - Little suboptimal nesting

<p align="center">
    <img alt="shapes0-gold-response" src="./run_area/imported_nesting/shapes0-gold-response.png" width="960"/>
</p>

<p align="center">
    <img alt="shapes0-server-response" src="./run_area/imported_nesting/shapes0-server-response.png" width="960"/>
</p>

* shapes1 - Success

<p align="center">
    <img alt="shapes1" src="./run_area/imported_nesting/shapes1.png" width="960"/>
</p>

* shirts - Little suboptimal nesting(sometimes server crashed)

<p align="center">
    <img alt="shirts" src="./run_area/imported_nesting/shirts.png" width="960"/>
</p>

* swim - Was not visualized(huge size)

* trousers - Little suboptimal nesting

<p align="center">
    <img alt="trousers" src="./run_area/imported_nesting/trousers.png" width="960"/>
</p>
