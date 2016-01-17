/*global chrome, setInterval, document, clearInterval, $, jQuery, alert, console*/

// GLOBAL VARS
var entries = [];
var categories = [];
var scoresToLetters = [];

var failed = false;
var overallP = $("b:nth-of-type(2)").text() + "";
var pointageSystem = false;
var rowCount = 0;

$( document ).ready(function(){
    chrome.storage.local.get({sandbox_enabled:true}, function(data){
        if(data.sandbox_enabled)runGrades();
    });
});

function runGrades(){
    console.log('Running In The Loop grade magic');
    checkIfPointageSystem();
    parseCategories();
    parseScale();
    parseGradeEntries();
    if (entries.length !== 0 && categories.length !== 0 && !failed) {
        if (!pointageSystem) {
            insertAddCatButton();
            makeCategoriesEditable();
            readdTooltips();
        }
        if (!failed) {
            addDelButton();
            insertTopRow();
            repopulateDropdown();
            $(".edit").click(editRow);
            $(".del").click(delRow);
            $(document).on('click', "a.deldel", function (e) {
                var caller = $(this);
                sharedDelFunction(caller);
            });
        }
    } else {
        console.log("In The Loop failed to start! (Line 457); e.length = " + entries.length + "; c.length = " + categories.length);
    }
}

function setOverallPercentage (value, animate) {
    for (var i = 0; i < scoresToLetters.length; i++) {
        if (value >= scoresToLetters[i].percent) {
            $("b:nth-of-type(1)").text("" + scoresToLetters[i].letter);
            break;
        }
    }
    if (animate) {
        var origElement = $("b:nth-of-type(2)");
        var origScore = origElement.text() + "";
        overallP = value + "%";
        origScore = num(origScore.substring(0, origScore.indexOf("%")));
        jQuery({
            val: origScore
        }).animate({
            val: value
        }, {
            duration: 500,
            easing: 'swing',
            step: function () {
                origElement.text(this.val.toFixed(2) + "%");
            }
        });
    } else {
        $("b:nth-of-type(2)").text("" + value + "%");
    }
}
function setOverallPercentageStr(newStr) {
    $("b:nth-of-type(2)").text("" + newStr);
    $("b:nth-of-type(1)").text(newStr);
}
function recalculateOverallPercentage () {
    var sum = 0,
        totalWeight = 0;
    if (pointageSystem) {
        var nnn = 0;
        var ddd = 0;
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].score != "-") {
                nnn += categories[i].pointsN;
                ddd += categories[i].pointsD;
            }
        }
        sum = (nnn / ddd) * 100;
        sum = sum.toFixed(2);
        setOverallPercentage(sum, true);
    } else {
        for (var j = 0; j < categories.length; j++) {
            if (categories[j].score != "-") {
                sum += categories[j].score * categories[j].percentage;
                totalWeight += categories[j].percentage;
            }
        }
        if (totalWeight === 0) {
            setOverallPercentageStr("-");
        } else if (totalWeight !== 0) {
            sum = sum / totalWeight * 100;
            sum = sum.toFixed(2);
            setOverallPercentage(sum, true);
        }
    }
}
function num (param) {
    return Number(param);
}
function repopulateDropdown () {
    $("#categoryDropdown").empty();
    var dropdown = document.getElementById("categoryDropdown");
    for (var i = 0; i < categories.length; i++) {
        var opt = categories[i].name;
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        if (i === 0)
            el.selected = true;
        dropdown.appendChild(el);
    }
}
function showDelButton (event) {
    var caller = $(this);
    var s = $("td:nth-child(1) > div > a:nth-of-type(1)", caller);
    s.show();
}
function hideDelButton (event) {
    var caller = $(this);
    var s = $("td:nth-child(1) > div > a:nth-of-type(1)", caller);
    s.hide();
}
function addDelButton () {
    $(".hub_general > .general_body > tr").each(function (i, tr) {
        var asstNameLink = $("td:nth-child(1) > div > a", tr);
        asstNameLink.after("[<a href=\"javascript:void(0);\" class = \"del\" id = \"del" + (i + 1) + "\">X</a>]");
    });
}
function checkIfPointageSystem () {
    try {
        pointageSystem = $('h2:contains("Score per Category") + div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text().indexOf("Score") > -1;
        rowCount = $('h2:contains("Score") + div > table > tbody > tr').length - 1;
    } catch (err) {
        console.log("In The Loop failed to process pointage system");
        failed = true;
    }
    console.log("pointageSystem is " + pointageSystem);
}
function readdTooltips () {
    try {
        if (pointageSystem)
            return;
        var pN = 0,
            pD = 0;
        for (var i = 0; i < categories.length; i++) {
            pN += categories[i].pointsN;
            pD += categories[i].pointsD;
        }
        var sumStr = pN + " / " + pD;
        $('h2:contains("Score per Category") + div > table > tbody > tr:nth-child(1) > td:nth-child(3)').html('<div class="tip" data-tip="' + sumStr + '">Score</div>');
        $('h2:contains("Score per Category") + div > table > tbody > tr').each(function (i, tr) {
            if (i > 0) {
                var x = $("td:nth-child(3)", tr);
                var xxy = x.text();
                var xx = categories[i - 1].pointsN + " / " + categories[i - 1].pointsD;
                x.empty().append('<div class="tip" data-tip="' + xx + '">' + xxy + '</div>');
            }
        });
        $('.tip').tipr({
            'speed': 350,
            'mode': 'top'
        });
    } catch (err) {
        console.log("In The Loop failed to insert tooltips");
        failed = true;
    }
}
function parseCategories () {
    categories = [];
    try {
        $('h2:contains("Score per Category") + div > table > tbody > tr').each(function (i, tr) {
            if (i > 0) {
                var catName, catPTmp, catPercent, catSTmp, catScore;
                var tempCat = $("td:nth-child(1)", tr).children();
                var tempCatWeight = $("td:nth-child(2)", tr).children();
                if (tempCat.length === 1) {
                    catName = tempCat.first().val();
                } else {
                    catName = $("td:nth-child(1)", tr).text();
                }
                if (tempCatWeight.length === 1) {
                    catPTmp = tempCatWeight.first().val();
                    catPercent = num(catPTmp) / 100;
                } else {
                    catPTmp = $("td:nth-child(2)", tr).text();
                    catPercent = num(catPTmp.substring(0, catPTmp.length - 1)) / 100;
                }
                if (!pointageSystem) {
                    catSTmp = $("td:nth-child(3)", tr).text().replace(/\s/g, "");
                    catScore = num(catSTmp.substring(0, catSTmp.length - 1)) / 100;
                } else {
                    catPercent = (100 / rowCount) / 100;
                    catSTmp = $("td:nth-child(2)", tr).text().replace(/\s/g, "");
                    catScore = num(catSTmp.substring(0, catSTmp.length - 1)) / 100;
                }
                var tmp = {
                    name: catName,
                    percentage: catPercent, //category weightage
                    score: catScore,
                    pointsN: 0,
                    pointsD: 0
                };
                categories.push(tmp);
            }
        });
        readdTooltips();
    } catch (err) {
        console.log("In The Loop failed to process categories");
        failed = true;
    }
}
function parseGradeEntries () {
    entries = [];
    try {
        $(".hub_general > .general_body > tr").each(function (i, tr) {
            var asstNameLink = $("td:nth-child(1) > div > a", tr);
            var nameText = asstNameLink.text();
            var pointN = $("td:nth-child(4)", tr).contents().filter(function () {
                return this.nodeType == 3;
            }).text().replace(/\s/g, "");
            if (!(pointN.indexOf("/") < 0 || pointN.indexOf("=") < 0)) {
                var asstPointD = num(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("=")));
                var asstPointN = num(pointN.substring(0, pointN.indexOf("/")));
                if(isNaN(asstPointD) || isNaN(asstPointN)){
                    console.log("In The Loop failed to process grade entries (NaN 237)");
                    failed = true;
                    return;
                }
                var cName = $("td:nth-child(1) > div", tr).contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim().replace("[", "").replace("]", "").trim();

                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);
                if (elementPos >= 0) {
                    categories[elementPos].pointsN += asstPointN;
                    categories[elementPos].pointsD += asstPointD;
                    var obj = {
                        name: nameText,
                        pointValN: asstPointN,
                        pointValD: asstPointD,
                        categoryName: cName,
                        categoryIndex: elementPos
                    };
                    entries.push(obj);
                }
                else{
                    console.log("In The Loop failed to process grade entries (261)");
                    failed = true;
                    return;
                }
            }
        });
    } catch (err) {
        console.log("In The Loop failed to process grade entries");
        failed = true;
    }
}
function newCatChanged () {
    parseCategories();
    parseGradeEntries();
    repopulateDropdown();
    recalculateOverallPercentage();
    readdTooltips();
}
function makeCategoriesEditable () {
    if (pointageSystem) return;
    try {
        $('h2:contains("Score per Category") + div > table > tbody > tr').each(function (i, tr) {
            if (i > 0) {
                var percentStr = $("td:nth-child(2)", tr).text();
                var percent = num(percentStr.substring(0, percentStr.length - 1));
                $("td:nth-child(2)", tr).replaceWith("<td nowrap style='max-width:1px'><input min='0' class='addedCatWeight' value=" + percent + " style='max-width:65%;' type='number'></input>%</td>");
                $(".addedCatWeight").change(newCatChanged);
            }
        });
    } catch (err) {
        console.log("In The Loop failed to make categories editable");
        failed = true;
    }
}
function addCategory () {
    try {
        var trToAdd = $("<tr style='display: none;'><td><input placeholder='Category Name' type='text' style='max-width:75%' class='addedCat' min='0'></input></td><td nowrap style='max-width:1px'><input min='0' class='addedCatWeight' value='0' style='max-width:65%;' type='number'></input>%</td><td style='max-width:1px' nowrap>-</td></tr>");
        $("h2:contains('Score') + div > table > tbody > tr:last").after(trToAdd);
        trToAdd.fadeIn();
        $(".addedCat").change(newCatChanged);
        $(".addedCatWeight").change(newCatChanged);
        newCatChanged();
    } catch (err) {
        console.log("In The Loop failed to process grade entries");
        failed = true;
    }
}
function insertAddCatButton () {
    if (!pointageSystem) {
        try {
            var st = 'Category: <section style="display:inline;" class="flat"><button class="addCat">Add Category</button></section>';
            $("h2:contains('Score') + div > table > tbody > tr:first > td:nth-child(1)").html(st);
            $(".addCat").click(addCategory);

        } catch (err) {
            console.log("In The Loop failed to insert the 'Add Category' button");
            failed = true;
        }
    }
}
function parseScale () {
    var a1, lttr, pcntg;
    try {
        $('h2:contains("Scale") + div * tr').each(function (i, tr) {
            $("td", tr).each(function () {
                a1 = $(this).text();
                lttr = a1.substring(0, a1.indexOf("=")).trim();
                pcntg = num(a1.substring(a1.indexOf("=") + 1, a1.indexOf("%")).trim());
                var pair = {
                    letter: lttr,
                    percent: pcntg
                };
                scoresToLetters.push(pair);
            });
        });
        var compare = function (a, b) {
            if (a.percent > b.percent)
                return -1;
            if (a.percent < b.percent)
                return 1;
            return 0;
        };
        scoresToLetters.sort(compare);
    } catch (err) {
        console.log("In The Loop failed to process grade entries");
        failed = true;
    }
}
function setCategoryPercentageStr (index, newStr) {
    try {
        $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)").text(newStr);
        readdTooltips();
    } catch (err) {
        console.log("In The Loop failed to set the category percentage");
        failed = true;
    }
}
function round (value) {
    return Math.ceil(value * 100) / 100;
}
function setCategoryPercentage (index, newScore, animate) {

    try {
        if (!animate) {
            $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)").text(newScore + "%");
        } else {
            var origElement = $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)");
            var origScore = origElement.text() + "";
            origScore = num(origScore.substring(0, origScore.indexOf("%")));
            jQuery({
                val: origScore
            }).animate({
                val: newScore
            }, {
                duration: 500,
                easing: 'swing',
                progress: function () {
                    var t = round(this.val);
                    origElement.text(t + "%");
                },
                complete: function () {
                    readdTooltips();
                }
            });
        }
    } catch (err) {
        console.log("In The Loop failed to set the category percentage");
        failed = true;
    }
}
function sharedDelFunction (caller) {
    try {
        var cName = caller.parent().contents().filter(function () {
            return this.nodeType == 3;
        }).text().trim().replace("[", "").replace("]", "").trim();
        var elementPos = categories.map(function (x) {
            return x.name;
        }).indexOf(cName);
        var tr = caller.parent().parent().parent();
        var pointNstr = tr.find("td:nth-child(4)", tr).contents().filter(function () {
            return this.nodeType == 3;
        }).text().replace(/\s/g, "");
        var pointD = num(pointNstr.substring(pointNstr.indexOf("/") + 1, pointNstr.indexOf("=")));
        var pointN = num(pointNstr.substring(0, pointNstr.indexOf("/")));
        categories[elementPos].pointsN -= pointN;
        categories[elementPos].pointsD -= pointD;
        if (categories[elementPos].pointsD === 0) {
            categories[elementPos].score = "-";
            setCategoryPercentageStr(elementPos, categories[elementPos].score);
        } else {
            categories[elementPos].score = categories[elementPos].pointsN / categories[elementPos].pointsD;
            setCategoryPercentage(elementPos, categories[elementPos].score * 100, true);
        }
        recalculateOverallPercentage();
        caller.parent().parent().parent().fadeOut(300, function () {
            $(this).remove();
        });
    } catch (err) {
        console.log("In The Loop failed to delete the grade entry");
        failed = true;
    }
}
function delRow (event) {
    var id = event.target.id;
    var caller = $("#" + id);
    sharedDelFunction(caller);
}
function editRow (event) {
    var id = event.target.id;
    var td = $("#" + id).parent();
    $("#" + id + "t").blur(
        function () {
            $(this).attr('contentEditable', false);
        });
    $("#" + id + "t").attr('contentEditable', true);
}
function insertTopRow () {
    try {
        var param = false;
        if ($("#myonoffswitch").is(":checked"))
            param = true;

        var test = $('<tr id="inserted"><td align="center" class="inserted_two" colspan="1">Category: <select id="categoryDropdown"></select></td><td colspan="2" align="center" >Assignment:<input type="text" id="aName">&nbsp;<td style="vertical-align:middle;" colspan="2"><div style="float: left; ">Grade:<input type="number"    style="width:40px;" id="aNum">/<input     style="width:40px;" type="number" id="aDen"></div><section style="display:inline; padding-right:30px; float:right;" class="flat"><button id="add_grade">Add Grade</button></section></td></td></tr>').hide(); //initializes the top row element

        test.show('slow'); //adds the top row element
        $('.hub_general > .general_body > tr:first').before(test); //adds top row before the table's first row
        var addGrades = function () {
            try {
                var ACI = $('#categoryDropdown')[0].selectedIndex,
                    asstName = document.getElementById('aName').value,
                    asstPointN = num(num(document.getElementById('aNum').value).toFixed(2)),
                    asstPointD = num(num(document.getElementById('aDen').value).toFixed(1)), //tofixed adds trailing zeroes
                    asstCalcScore = (Math.round((asstPointN / asstPointD * 100) * 100) / 100).toFixed(2),
                    categoryName = categories[ACI].name;
                categories[ACI].pointsN += asstPointN;
                categories[ACI].pointsD += asstPointD;
                categories[ACI].score = (categories[ACI].pointsN) / (categories[ACI].pointsD);
                var newCatScore = num((Math.round(((categories[ACI].pointsN) / (categories[ACI].pointsD) * 100.0) * 100.0) / 100.0).toFixed(2));
                setCategoryPercentage(ACI, newCatScore, true);
                var date = new Date();
                var dateToday = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().substring(2); //formatted string mm/dd/yy
                //checks the first item's color and sets isHighlighted to the opposite (either "highlighted" or "")
                var isHighlighted = ($(".hub_general > .general_body > tr:nth-child(2)").attr("class") != "highlight") ? "highlight" : "";
                recalculateOverallPercentage();
                var newRow = $("<tr style='display:none;' class='" + isHighlighted + "'><td><div class='float_l padding_r5' style='min-width: 105px;'>" + categoryName + "<br><a href='#'>" + asstName + "[<a href=\"javascript:void(0);\" class = \"deldel\">X</a>] </a></div></td><td style='width:100%;'></td><td>" + dateToday + "<br></td><td nowrap=''><div>Score: " + asstPointN + "</div>" + asstPointN + " / " + asstPointD + " = " + asstCalcScore + "%</td><td class='list_text'><div style='width: 125px;'></div></td></tr>");
                $("#inserted").after(newRow);
                newRow.fadeIn();

                return false;
            } catch (err) {
                console.log("In The Loop failed to complete addGrades method");
                failed = true;
            }
        };
        $("#add_grade").click(addGrades);
    } catch (err) {
        console.log("In The Loop failed to complete the insertTopRow method");
        failed = true;
    }
}
