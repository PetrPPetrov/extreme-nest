Pre Requireristics
==================
* You need to install MongoDB. Direct link is https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-4.0.6-signed.msi
* You need to run 'npm install' for database-server folder
* You need to run database server by using 'npm run startDatabaseServer' from database-server folder
* Now you open in a web-browser pre-built version of testing system web-page, go to test-client/build folder and open index.html.
* Use the test system

Or you can build testing system web-page:
* You need to run 'npm install' from this folder
* You need to run 'npm run buildTestClient' from this folder
* Go to test-client/build and open index.html in a web-browser

TODO list:
==========
* ~~Do not run nesting automatically after new test generation, instead of this add new button 'Run nesting' under 'Visualize test' button and horizontal separator.~~
* ~~Generate colors for visualization randomly, but they should be different from each other~~
* ~~Visualize server response by using the same colors as for gold response visualization~~
* ~~Rename 'Tests' page to 'Create' (just rename link for this "page")~~

Ideas:
======
* Add small buttons 'Test passed' and 'Test failed' (or just small buttons with icons, need to think about their design)
* Add 'import' block to 'Create' page. User selects an input file in some format (format like from https://paginas.fe.up.pt/~esicup/datasets?page=2 page), and a new test is created, without gold response.
* Add feature to rename test
  
