chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            var categories = new Array();
            var overallP = $("b:nth-of-type(2)").text() + "";
            $('h2:contains("Score") + div > table > tbody > tr').each(function (i, tr) {
                if (i != 0) {
                    var catName = $("td:nth-child(1)", tr).text(),
                        catPTmp = $("td:nth-child(2)", tr).text(),
                        catPercent = num(catPTmp.substring(0, catPTmp.length - 1)) / 100,
                        catSTmp = $("td:nth-child(3)", tr).text().replace(/\s/g, ""),
                        catScore = num(catSTmp.substring(0, catSTmp.length - 1)) / 100;
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
            var scoresToLetters = [];
            var a1, lttr, pcntg;
            //reads through grade Scale div,
            $('h2:contains("Scale") + div * tr').each(function (i, tr) {
                $("td", tr).each(function () {
                    a1 = $(this).text();
                    lttr = a1.substring(0, a1.indexOf("=")).trim();
                    pcntg = num(a1.substring(a1.indexOf("=") + 1, a1.indexOf("%")).trim());
                    var pair = {
                        letter: lttr,
                        percent: pcntg
                    }
                    scoresToLetters.push(pair);
                });
            });

            function compare(a, b) {
                if (a.percent > b.percent)
                    return -1;
                if (a.percent < b.percent)
                    return 1;
                return 0;
            }
            scoresToLetters.sort(compare);

            //loop through all tr's in main table, ID the category, add asst's pointN and pointD to catPointsN, catPointsD and update corresponding array object
            var entries = new Array();
            $(".hub_general > .general_body > tr").each(function (i, tr) {
                var asstNameLink = $("td:nth-child(1) > div > a", tr);
                var nameText = asstNameLink.text();
                asstNameLink.after("[<a href=\"javascript:void(0);\" class = \"del\" id = \"del" + (i + 1) + "\">X</a>]");
                var pointN = $("td:nth-child(4)", tr).contents().filter(function () {
                        return this.nodeType == 3;
                    }).text().replace(/\s/g, ""),
                    pointD = num(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("="))),
                    pointN = num(pointN.substring(0, pointN.indexOf("/")));

                var cName = $("td:nth-child(1) > div", tr).contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim().replace("[", "").replace("]", "").trim();

                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);
                if (elementPos >= 0) {
                    categories[elementPos].pointsN += pointN;
                    categories[elementPos].pointsD += pointD;
                }
                var obj = {
                    name: nameText,
                    pointValN: pointN,
                    pointValD: pointD,
                    categoryName: cName,
                    categoryIndex: elementPos
                };
                entries.push(obj);
            });

            $(".edit").click(editRow);

            function editRow(event) {
                var id = event.target.id;
                var td = $("#" + id).parent();
                $("#" + id + "t").blur(
                    function () {
                        $(this).attr('contentEditable', false);
                    });
                $("#" + id + "t").attr('contentEditable', true);
            }

            function num(param) {
                return Number(param);
            }
            $(".del").click(delRow);

            function delRow(event) {
                var id = event.target.id;
                var caller = $("#" + id);
                sharedDelFunction(caller);
            }

            function sharedDelFunction(caller) {
                var cName = caller.parent().contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim().replace("[", "").replace("]", "").trim();
                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);
                var tr = caller.parent().parent().parent()
                var pointN = tr.find("td:nth-child(4)", tr).contents().filter(function () {
                        return this.nodeType == 3;
                    }).text().replace(/\s/g, ""),
                    pointD = num(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("="))),
                    pointN = num(pointN.substring(0, pointN.indexOf("/")));
                categories[elementPos].pointsN -= pointN;
                categories[elementPos].pointsD -= pointD;
                if (categories[elementPos].pointsD == 0) {
                    categories[elementPos].score = "-";
                    setCategoryPercentageStr(elementPos, categories[elementPos].score)
                } else {
                    categories[elementPos].score = categories[elementPos].pointsN / categories[elementPos].pointsD;
                    setCategoryPercentage(elementPos, categories[elementPos].score * 100, true)
                }
                recalculateOverallPercentage();
                caller.parent().parent().parent().remove();
            }
            insertTopRow();

            function setCategoryPercentageStr(index, newStr) {
                $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)").text(newStr);
            }

            function setCategoryPercentage(index, newScore, animate) {
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
                        step: function () {
                            origElement.text((this.val).toFixed(2) + "%");
                        }
                    });
                }
            }

            function setOverallPercentage(value, animate) {
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

            function recalculateOverallPercentage() {
                var sum = 0,
                    totalWeight = 0;
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].score != "-") {
                        sum += categories[i].score * categories[i].percentage;
                        totalWeight += categories[i].percentage;
                    }
                }
                if (totalWeight == 0) {
                    setOverallPercentageStr("-");
                } else {
                    sum = sum / totalWeight * 100;
                    sum = sum.toFixed(2);
                    setOverallPercentage(sum, true)
                }
            }
            $(document).on('click', "a.deldel", function (e) {
                var caller = $(this);
                sharedDelFunction(caller);
            });

            function insertTopRow() {
                var param = false;
                if ($("#myonoffswitch").is(":checked"))
                    param = true;

                $test = $('<tr id="inserted"><td align="center" class="inserted_two" colspan="1">Category: <select id="categoryDropdown"></select></td><td colspan="2" align="center" >Assignment:<input type="text" id="aName">&nbsp;<td style="vertical-align:middle;" colspan="2"><div style="float: left; ">Grade:<input type="number"    style="width:40px;" id="aNum">/<input     style="width:40px;" type="number" id="aDen"></div><a style="float:right;" id="add_grade" id="add_grade" href="#" style="float:right; padding-right:30px;">add grade</a></td></td></tr>').hide(); //initializes the top row element

                $test.show('slow'); //adds the top row element
                $('.hub_general > .general_body > tr:first').before($test); //adds the top row before the table's first row

                var dropdown = document.getElementById("categoryDropdown");

                for (var i = 0; i < categories.length; i++) {
                    var opt = categories[i].name;
                    var el = document.createElement("option");
                    el.textContent = opt;
                    el.value = opt;
                    if (i == 0)
                        el.selected = true;
                    dropdown.appendChild(el);
                }

                $("#add_grade").click(addGrades);

                function addGrades() {
                    var ACI = $('#categoryDropdown')[0].selectedIndex,
                        asstName = document.getElementById('aName').value,
                        asstPointN = num(num(document.getElementById('aNum').value).toFixed(2)),
                        asstPointD = num(num(document.getElementById('aDen').value).toFixed(1)), //tofixed adds trailing zeroes
                        asstCalcScore = (Math.round((asstPointN / asstPointD * 100) * 100) / 100).toFixed(2),
                        categoryName = categories[ACI].name;
                    categories[ACI].pointsN += asstPointN;
                    categories[ACI].pointsD += asstPointD;
                    categories[ACI].score = (categories[ACI].pointsN) / (categories[ACI].pointsD);
                    var newCatScore = num((Math.round(((categories[ACI].pointsN) / (categories[ACI].pointsD) * 100) * 100) / 100).toFixed(2));
                    setCategoryPercentage(ACI, newCatScore, true);
                    var date = new Date();
                    var dateToday = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().substring(2); //formatted string mm/dd/yy
                    //checks the first item's color and sets isHighlighted to the opposite (either "highlighted" or "")
                    var isHighlighted = ($(".hub_general > .general_body > tr:nth-child(2)").attr("class") != "highlight") ? "highlight" : "";
                    recalculateOverallPercentage();
                    $newRow = $("<tr class='" + isHighlighted + "'><td><div class='float_l padding_r5' style='min-width: 105px;'>" + categoryName + "<br><a href='#'>" + asstName + "[<a href=\"javascript:void(0);\" class = \"deldel\">X</a>] </a></div></td><td style='width:100%;'></td><td>" + dateToday + "<br></td><td nowrap=''><div>Score: " + asstPointN + "</div>" + asstPointN + " / " + asstPointD + " = " + asstCalcScore + "%</td><td class='list_text'><div style='width: 125px;'></div></td></tr>");
                    $("#inserted").after($newRow);
                    return false;
                };
            }
        }
    }, 10);
});
