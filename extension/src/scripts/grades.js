//TODO: When extension is loaded, add id attribute to all elements that allows the extension
//to change elements easily using corresponding #id attribute.

//TODO: Write methods that allow for changing elements easily, like setCategory(value, true)
//true indicates whether to animate or not
chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            $(".page_title").after("<div class='onoffswitch' style='float:right;'><input type='checkbox' name='onoffswitch' value='true' class='onoffswitch-checkbox' id='myonoffswitch'><label class='onoffswitch-label' for='myonoffswitch'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch'></span></label></div>"); //adds the switch after the page title
            $("#myonoffswitch").click(insertTopRow);
            var categories = new Array();
            var overallP = $("b:nth-of-type(2)").text() + "";

            $('h2:contains("Score") + div > table > tbody > tr').each(function (i, tr) {
                if (i != 0) {
                    var catName = $("td:nth-child(1)", tr).text(),
                        catPTmp = $("td:nth-child(2)", tr).text(),
                        catPercent = Number(catPTmp.substring(0, catPTmp.length - 1)) / 100,
                        catSTmp = $("td:nth-child(3)", tr).text().replace(/\s/g, ""),
                        catScore = Number(catSTmp.substring(0, catSTmp.length - 1)) / 100;

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
            var a1, lttr,pcntg;
            $('h2:contains("Scale") + div * tr').each(function (i, tr){
                $("td",tr).each(function (){
                    a1 = $(this).text();
                    lttr = a1.substring(0, a1.indexOf("=")).trim();
                    pcntg = Number(a1.substring(a1.indexOf("=")+1,a1.indexOf("%")).trim());
                    var pair = {
                        letter: lttr,
                        percent: pcntg
                    }
                    scoresToLetters.push(pair);
                });
            });
            function compare(a,b) {
                if (a.percent > b.percent)
                    return -1;
                if (a.percent < b.percent)
                    return 1;
                return 0;
            }
            scoresToLetters.sort(compare);

            //loop through all tr's in main table, ID the category, add assignment's pointN and pointD to catPointsN, catPointsD and update corresponding array object
            $(".hub_general > .general_body > tr").each(function (i, tr) {
                var asstNameLink = $("td:nth-child(1) > div > a", tr).after("[<a href=\"javascript:void(0);\" class = \"del\" id = \"del" + (i + 1) + "\">X<\a>]");

                var pointN = $("td:nth-child(4)", tr).contents().filter(function () {
                        return this.nodeType == 3;
                    }).text().replace(/\s/g, ""),
                    pointD = Number(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("="))),
                    pointN = Number(pointN.substring(0, pointN.indexOf("/")));

                var cName = $("td:nth-child(1) > div", tr).contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim().replace("[", "").trim();

                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);
                if (elementPos >= 0) {
                    categories[elementPos].pointsN += pointN;
                    categories[elementPos].pointsD += pointD;
                }
            });

            $(".del").click(delRow);

            function delRow(event) {
                var id = event.target.id;
                var cName = $("#" + id).parent().contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim().replace("[", "").trim();

                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);

                var tr = $("#" + id).parent().parent().parent()

                var pointN = tr.find("td:nth-child(4)", tr).contents().filter(function () {
                        return this.nodeType == 3;
                    }).text().replace(/\s/g, ""),
                    pointD = Number(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("="))),
                    pointN = Number(pointN.substring(0, pointN.indexOf("/")));
                console.log("-----------------------------------------------------------")
                console.log("old overall %:" + overallP)
                console.log("old cat score: " + categories[elementPos].pointsN + "/" + categories[elementPos].pointsD + " = " + categories[elementPos].score)
                categories[elementPos].pointsN -= pointN;
                categories[elementPos].pointsD -= pointD;
                if (categories[elementPos].pointsD == 0) {
                    //handle if denom is 0
                    //need to remove category % from the considered categories

                    categories[elementPos].score = "-";
                    setCategoryPercentageStr(elementPos, categories[elementPos].score)
                } else {
                    categories[elementPos].score = categories[elementPos].pointsN / categories[elementPos].pointsD;
                    setCategoryPercentage(elementPos, categories[elementPos].score * 100, true)
                }
                recalculateOverallPercentage();
                console.log("removing asst: " + pointN + "/" + pointD)
                console.log("new cat score: " + categories[elementPos].pointsN + "/" + categories[elementPos].pointsD + " = " + categories[elementPos].score)
                console.log("removing from category: " + categories[elementPos].name)
                console.log("new overall %:" + overallP)
                console.log("-----------------------------------------------------------")



                $("#" + id).parent().parent().parent().remove();
            }

            function setCategoryPercentageStr(index, newStr) {
                $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)").text(newStr);

            }

            function setCategoryPercentage(index, newScore, animate) {
                if (!animate) {
                    $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)").text(newScore + "%");
                } else {
                    var origElement = $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (index + 2) + ") td:nth-child(3)");
                    var origScore = origElement.text() + "";
                    origScore = Number(origScore.substring(0, origScore.indexOf("%")));
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

            /*            function setCategoryPercentageStr(catName, newScore, animate) {
                            if (!animate) {
                                $("h2:contains('Score') + div > table > tbody > tr:contains(" + catName + ") td:nth-child(3)").text(newScore + "%");
                            } else {
                                var origElement = $("h2:contains('Score') + div > table > tbody > tr:contains(" + catName + ") td:nth-child(3)");
                                var origScore = origElement.text() + "";
                                origScore = Number(origScore.substring(0, origScore.indexOf("%")));
                                jQuery({
                                    val: origScore
                                }).animate({
                                    val: newScore
                                }, {
                                    duration: 500,
                                    easing: 'swing',
                                    step: function () {
                                        origElement.text(Math.ceil(this.val) + "%");
                                    }
                                });
                            }
                        }*/

            function setOverallPercentage(value, animate) {
                for(var i = 0; i < scoresToLetters.length;i++){
                    if(value >= scoresToLetters[i].percent){
                        $("b:nth-of-type(1)").text("" + scoresToLetters[i].letter);
                        break;
                    }
                }

                if (animate) {
                    var origElement = $("b:nth-of-type(2)");
                    var origScore = origElement.text() + "";
                    overallP = value + "%";
                    origScore = Number(origScore.substring(0, origScore.indexOf("%")));
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

            function setOverallPercentageStr(newStr){
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

            function insertTopRow() {
                var param = false;
                if ($("#myonoffswitch").is(":checked"))
                    param = true;

                $test = $('<tr id="inserted"><td class="inserted_two" colspan="5">Category: <select id="categoryDropdown"></select>Assignment:<input type="text" id="aName">&nbsp;Grade:<input type="number"    style="width:40px;" id="aNum">/<input     style="width:40px;" type="number" id="aDen">&nbsp;&nbsp;&nbsp;<a id="add_grade" id="add_grade" href="#" style="float:right; padding-right:30px;">add grade</a></td></tr>').hide(); //initializes the top row element

                if (param) {
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


                    $("#add_grade").click(function () {
                        var assignmentCategoryIndex = $('#categoryDropdown')[0].selectedIndex, //document.getElementById('aCat').options[e.selectedIndex].text,
                            assignmentName = document.getElementById('aName').value,
                            assignmentPointN = Number(Number(document.getElementById('aNum').value).toFixed(2)),
                            assignmentPointD = Number(Number(document.getElementById('aDen').value).toFixed(1)), //tofixed adds trailing zeroes
                            assignmentCalcScore = (Math.round((assignmentPointN / assignmentPointD * 100) * 100) / 100).toFixed(2),
                            categoryName = categories[assignmentCategoryIndex].name;
                        categories[assignmentCategoryIndex].pointsN += assignmentPointN;
                        categories[assignmentCategoryIndex].pointsD += assignmentPointD;
                        categories[assignmentCategoryIndex].score = (categories[assignmentCategoryIndex].pointsN) / (categories[assignmentCategoryIndex].pointsD);
                        //                        categories[categoryName].pointsN += assignmentPointN;
                        //                        categories[categoryName].pointsD += assignmentPointD;

                        var newCatScore = Number((Math.round(((categories[assignmentCategoryIndex].pointsN) / (categories[assignmentCategoryIndex].pointsD) * 100) * 100) / 100).toFixed(2));
                        setCategoryPercentage(assignmentCategoryIndex, newCatScore, true);

                        var date = new Date();
                        var dateToday = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().substring(2); //formatted string mm/dd/yy

                        //checks the first item's color and sets isHighlighted to the opposite (either "highlighted" or "")
                        var isHighlighted = ($(".hub_general > .general_body > tr:nth-child(2)").attr("class") != "highlight") ? "highlight" : "";
                        recalculateOverallPercentage();
                        $newRow = $("<tr class='" + isHighlighted + "'><td><div class='float_l padding_r5' style='min-width: 105px;'>" + categoryName + "<br><a href='#'>" + assignmentName + "</a></div></td><td style='width:100%;'></td><td>" + dateToday + "<br></td><td nowrap=''><div>Score: " + assignmentPointN + "</div>" + assignmentPointN + " / " + assignmentPointD + " = " + assignmentCalcScore + "%</td><td class='list_text'><div style='width: 125px;'></div></td></tr>");

                        $("#inserted").after($newRow);
                        return false;
                    });
                } else {
                    $('.inserted_two').fadeOut(800, function () {
                        $('.inserted').remove();
                    });
                }
            }
        }
    }, 10);
});
