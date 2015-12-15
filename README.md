# InTheLoop
A Chrome extension that improves the School Loop interface by letting users enter a sandbox mode in which they can calculate what their grades would be after the teacher inputs or deletes grades.

##Installation
InTheLoop is still in development, but the beta version is available [here](https://chrome.google.com/webstore/detail/in-the-loop-for-school-lo/ppigcngidmooiiafkelbilbojiijffag).
Note: This extension only works for number grades (not for letter grades like "A")

##Future Features:   
1. Improved user interface 
2. Add a function that displays total # of points per category and overall
3. More robust grade calculation (function even with letter grades instead of numbers)
4. ~~Work with point-based grading system~~
5. Add and edit categories
6. Final grade calculation
7. Handle [this](https://scontent.xx.fbcdn.net/hphotos-xft1/v/t34.0-12/12395361_1647944725464690_391096720_n.jpg?oh=a616ca29147d5ecedfc4a79247d47484&oe=567014EB).
8. Count and store table length then highlight classes when row length changes (i.e. a basic notifications system).
9. Better Chrome Store logos and icon (instead of using School Loop's icon)

##Changelog
0.0.7 - Attempted fix for points-based (no weightage) grade parsing by detecting 
Priorities for future release:  
1. UX/Design - mainly move the row above table header
2. Bug Fixes - Parsing EC/NaN errors
3. Notifications system - Highlight classes which have new grade entries (and/or display notification by re-parsing every 5 minutes)

##Demo of Grade Calculation:
Adding Grades
![](https://i.gyazo.com/3df6057e276cac0228153a3cf29a81fa.gif)

Deleting Grades
![](https://i.gyazo.com/c58a324298bf87404d153c2f85afb485.gif)

Note: The icon, "schoolloop.com", and any other School Loop assets used in this extension belong to School Loop, Inc. Any other assets belong to their respective owners.
