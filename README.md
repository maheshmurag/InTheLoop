 [![Build Status](https://travis-ci.org/mash99/InTheLoop.svg?branch=develop)](https://travis-ci.org/mash99/InTheLoop)
# InTheLoop
A Chrome extension that improves the School Loop interface by letting users enter a sandbox mode in which they can calculate what their grades would be after the teacher inputs or deletes grades.

##Installation
InTheLoop is still in development, but the beta version is available [here](https://chrome.google.com/webstore/detail/in-the-loop-for-school-lo/ppigcngidmooiiafkelbilbojiijffag).
Note: This extension only works for number grades (not for letter grades like "A")

##Privacy
All data is stored locally. Its source code is available at https://github.com/mash99/InTheLoop. The "Reads your browsing history" permission is used by chrome.tabs to open and refresh School Loop.


##Future Features:   
1. Improved user interface 
2. ~~Add a function that displays total # of points per category and overall~~
3. More robust grade calculation (function even with letter grades instead of numbers)
4. ~~Work with point-based grading system~~
5. ~~Add and edit categories~~
6. ~~Final grade calculation~~
7. Handle [this](https://scontent.xx.fbcdn.net/hphotos-xft1/v/t34.0-12/12395361_1647944725464690_391096720_n.jpg?oh=a616ca29147d5ecedfc4a79247d47484&oe=567014EB).
8. Better Chrome Store logos and icon (instead of using School Loop's icon)
9. Make changes to grade trend

##Changelog

0.5 - Way better notifications, better UI for deleting grades/theming.

0.3 - Notifications

0.2.1 - Theming + bug fixes

0.1.2 - Tooltips for # of points per category/total

0.1.1 - Category bug fixes for rounding errors

0.1 - Ability to add new categories and edit old ones + a little styling

0.0.7 - Attempted fix for points-based (no weightage) grade parsing by detecting 
Priorities for future release:    
1. UX/Design - mainly move the row above table header    
2. Bug Fixes - Parsing EC/NaN errors    

##Demo of Grade Calculation:
Adding Grades
![](https://i.gyazo.com/6c424770f10b8598c4439b36c89193b4.gif)

Deleting Grades
![](https://i.gyazo.com/8252613bbe697fef07c8f1bf9a5d9134.gif)

Adding and Editing Categories
![](https://i.gyazo.com/0fdfe0e3ac2ad56c8b86b2599b6720b0.gif)

Note: The icon, "schoolloop.com", and any other School Loop assets used in this extension belong to School Loop, Inc. Any other assets belong to their respective owners.
