//TODO: When extension is loaded, add id attribute to all elements that allows the extension
//to change elements easily using corresponding #id attribute.

//TODO: Write methods that allow for changing elements easily, like setCategory(value, true)
//true indicates whether to animate or not
chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("Hello. This message was sen2t from scripts/inject.js");
            // ----------------------------------------------------------
            $(".page_title").after("<div class='onoffswitch' style='float:right;'><input type='checkbox' name='onoffswitch' value='true' class='onoffswitch-checkbox' id='myonoffswitch'><label class='onoffswitch-label' for='myonoffswitch'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch'></span></label></div>"); //adds the switch after the page title
            $("#myonoffswitch").click(insertTopRow); //sets event handler
            var categories = new Array(); //an array which will hold category objects
            $('h2:contains("Score") + div > table > tbody > tr').each(function (i, tr) { //sets up Categories obj
                if (i != 0) {
                    var catName = $("td:nth-child(1)", tr).text(),
                        catPTmp = $("td:nth-child(2)", tr).text(),
                        catPercent = Number(catPTmp.substring(0, catPTmp.length - 1)) / 100,
                        catSTmp = $("td:nth-child(3)", tr).text().replace(/\s/g, ""),
                        catScore = Number(catSTmp.substring(0, catSTmp.length - 1)) / 100;

                    var tmp = {
                        name: catName,
                        percentage: catPercent,
                        score: catScore,
                        pointsN: 0,
                        pointsD: 0
                    };
                    categories.push(tmp);
                }
            });
            //loop through all tr's in main table, ID the category, add assignment's pointN and pointD to catPointsN, catPointsD and update corresponding array object
            $(".hub_general > .general_body > tr").each(function (i, tr) {
                var asstNameLink = $("td:nth-child(1) > div > a", tr).after("[<a href=\"#\" class = \"del\" id = \"del"+i+"\">X<\a>]");
                console.log("parsing this asst: class = \"del\" id = \"del"+i+"\"");


                var pointN = $("td:nth-child(4)", tr).contents().filter(function () {
                        return this.nodeType == 3;
                    }).text().replace(/\s/g, ""),
                    pointD = Number(pointN.substring(pointN.indexOf("/") + 1, pointN.indexOf("="))),
                    pointN = Number(pointN.substring(0, pointN.indexOf("/")));
                // console.log("fdsafdsafa:"+pointD);
                var cName = $("td:nth-child(1) > div", tr).contents().filter(function () {
                    return this.nodeType == 3;
                }).text().trim();
                //console.log(cName);
                var elementPos = categories.map(function (x) {
                    return x.name;
                }).indexOf(cName);
                if (elementPos >= 0) {
                    categories[elementPos].pointsN += pointN;
                    categories[elementPos].pointsD += pointD;
                }
            });

            $(".del").click(delRow);
            function delRow(event){
                alert("you clicked delete on "+event.target.id);
                var id = event.target.id;
                $(".hub_general > .general_body > tr:eq("+id+")").remove();
            }

            function insertTopRow() { //called on switch click
                var param = false;
                if ($("#myonoffswitch").is(":checked"))
                    param = true;

                console.log("starting parse");

                $test = $('<tr id="inserted"><td class="inserted_two" colspan="5">Category: <select id="categoryDropdown"></select>Assignment:<input type="text" id="aName">&nbsp;Grade:<input type="number"    style="width:40px;" id="aNum">/<input     style="width:40px;" type="number" id="aDen">&nbsp;&nbsp;&nbsp;Category:/<a id="add_grade" id="add_grade" href="#" style="float:right; padding-right:30px;">add grade</a></td></tr>').hide(); //initializes the top row element

                if (param) {
                    $test.show('slow'); //adds the top row element
                    $('.hub_general > .general_body > tr:first').before($test); //adds the top row before the table's first row

                    var dropdown = document.getElementById("categoryDropdown"); //
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

                        var newCatScore = Number((Math.round(((categories[assignmentCategoryIndex].pointsN) / (categories[assignmentCategoryIndex].pointsD) * 100) * 100) / 100).toFixed(2))

                        $("h2:contains('Score') + div > table > tbody > tr:nth-child(" + (assignmentCategoryIndex + 2) + ") td:nth-child(3)").text(newCatScore + "%");
                        //                        console.log(categories[assignmentCategoryIndex].pointsD);
                        var sum = 0,
                            totalWeight = 0;
                        for (var i = 0; i < categories.length; i++) {
                            sum += categories[i].score * categories[i].percentage;
                            totalWeight += categories[i].percentage;
                            console.log(categories[1].score + ":" + categories[i].percentage + ":" + sum)
                        }
                        sum = sum / totalWeight * 100;
                        $("b:nth-of-type(2)").text("" + sum.toFixed(2) + "%");
                        var date = new Date();
                        var dateToday = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().substring(2); //formatted string mm/dd/yy

                        //console.log(assignmentCategory+":"+assignmentName+":"+assignmentPointN+":"+assignmentPointD);

                        //checks the first item's color and sets isHighlighted to the opposite (either "highlighted" or "")
                        var isHighlighted = ($(".hub_general > .general_body > tr:nth-child(2)").attr("class") != "highlight") ? "highlight" : "";

                        $newRow = $("<tr class='"+isHighlighted + "'><td><div class='float_l padding_r5' style='min-width: 105px;'>" + categoryName + "<br><a href='#'>" + assignmentName + "</a></div></td><td style='width:100%;'></td><td>" + dateToday + "<br></td><td nowrap=''><div>Score: " + assignmentPointN + "</div>" + assignmentPointN + " / " + assignmentPointD + " = " + assignmentCalcScore + "%</td><td class='list_text'><div style='width: 125px;'></div></td></tr>");



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
