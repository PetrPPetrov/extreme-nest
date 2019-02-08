Pre Requireristics
==================

To build Extreme-Nest RESTfull server to need to install:
* Microsoft Visual Studio 2017 (or Microsoft Visual Studio 2015)
* CMake build system, version 3.2 or higher (for Extreme-Nest C++ module)
* Python 2.x interpreter (for node-gyp, used by Deep-Nest Minkowski C++ addon)

First, you need to run 'npm install' from this folder.

After that, you can start server by using 'npm run start' command.

For debugging purposes you can use 'npm run debug' command.

TODO for Extreme Nest:
======================
* ~~Add support for orientations~~
* ~~Add support for flip flag~~
* Add support of infinite sheet length
* Add support of non-rectangular sheets
* Add support for pre-nesting
* Add support for defects on sheet
* Add support for arcs
* Add support for protection offset
* Add support for border gap (for sheets)

Ideas for Extreme Nest:
=======================
* Add support of automation position tolerance calculation (for instance, minimum distance between points)
* Use bitwise level for position x and position y during individual mate and mutation
* Implement NFP algorithm fully in C++, i.e. as part of Extreme Nest
* Implement neural network algorithm for nesting

TODO for Deep Nest:
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
