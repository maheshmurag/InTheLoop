/*global console, chrome, $, document*/
/* jshint shadow:true */

var getYear = function(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;//Jan is 0
    var yyyy = today.getFullYear();
    if(dd<10)
        dd='0'+dd;
    if(mm<10)
        mm='0'+mm;
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
};

var yearVal = getYear();

var constants = {
    "version": "2",
    "devToken": "599F9C00-92DC-4B5C-9464-7971F01F8370",
    "year": yearVal,
    "devOS": "5"
};

    //"loginURL": "https://montavista.schoolloop.com/mapi/login?version="+constants.version" + "&devToken=" + constants.devToken + "&devOS="+ constants.devOS + "&year=" + constants.year + ""

function saagar(){
    var bString = getBString();
    var obj = {};
    var setObj = function(data){
        obj = JSON.parse(data);
        console.log("1");
        console.log(obj);
    };

    var obj3 = {};
    var setObj3 = function(data){
        obj2 = JSON.parse(data);
        console.log("3");
        console.log(obj2);
    };
    $.ajax({
        type: "GET",
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://montavista.schoolloop.com/mapi/progress_report", 
        data: { 
            studentID: '1376458845274',
            periodID: '1438443835901'
        },
        complete: function(msg)
        {
            //successful if msg.status == 200
            setObj(msg.responseText);
        }
    });
    
    
    
    $.ajax({
        type: "GET",
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://montavista.schoolloop.com/mapi/report_card?studentID=1376458845274",
        complete: function(msg)
        {
            //successful if msg.status == 200
            setObj3(msg.responseText);
        }
    });
}

var getStudentID = function(){
    var obj2 = {};
    var setObj2 = function(data){
        obj2 = JSON.parse(data);
        console.log("2");
        console.log(obj2);
    };
    var username;
    var setUsername = function(user){
        username = user;
    }
    chrome.storage.local.get("username", function(obj){setUsername(obj.username);});
    $.ajax({
        type: "GET",
        beforeSend: function(xhr)
        {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://montavista.schoolloop.com/mapi/login?version="+constants.version + "&devToken=" + constants.devToken + "&devOS="+ constants.devOS + "&year=" + constants.year + "", 
        complete: function(msg)
        {
            //successful if msg.status == 200
            setObj2(msg.responseText);
        }
    });
};

chrome.runtime.onInstalled.addListener(function () {
    var school = "";
    chrome.notifications.onClicked.addListener(function (notifId) {
        chrome.tabs.create({
            url: "chrome://extensions/?options=ppigcngidmooiiafkelbilbojiijffag"
        });
        chrome.notifications.clear("1", function(){});
    });
    var options = {
        type: "basic",
        iconUrl: "icons/notif.png",
        title: "Welcome to In The Loop",
        message: "Click to set up notifications"
    };
    chrome.notifications.create("1", options, function(){});
    //chrome.tabs.create({ url: "http://maheshmurag.com/InTheLoop/" });
    chrome.storage.local.set({
        classes: {}
    });
    chrome.storage.local.set({popupMsg: ""});
    chrome.storage.local.set({notifs: true});
    chrome.storage.local.set({sl_subdomain:"montavista"}, function(){});
    //TODO: create notification about credentials for notifications
    
    
});

var parseGradeChanges = function(subdomain){
    var objToSync;
    $.get("https://" + subdomain + ".schoolloop.com/portal/student_home", function (data) {
        // load response text into a new page element
        var SLPage = document.createElement("html");
        SLPage.innerHTML = data;
        var page = $(SLPage);
        var schoolName = $("#page_title_login", page);
        if (schoolName.length) { //not logged in
            console.log("Grade update notifications won't work unless you're logged in!");
            chrome.browserAction.setBadgeText({text: "ERR"});
            chrome.storage.local.set({popupMsg: "Login to School Loop to enable notifications"});
        } else { //logged in
            chrome.browserAction.setBadgeText({'text': ''});
            chrome.storage.local.set({popupMsg: ""});
            var classArray = [];
            
            if($("tbody > tr > td > ul > li > a:contains('Show Grades')", page).length > 0){
                console.log("Grade update notifications won't work unless you show grades!");
                chrome.browserAction.setBadgeText({text: "ERR"});
                chrome.storage.local.set({popupMsg: "Click 'Show Grades' to enable notifications."});
                return;
                //visit each progress report, add to classArray
//                $("tbody > tr > td.pr_link", page).each(function (i, obj) {
//                    var link = "https://" + subdomain + ".schoolloop.com" + $("a", obj).attr("href");
//                    $.get(link, function(data){
//                        var progressReportPage = document.createElement("html");
//                        progressReportPage.innerHTML = data;
//                        var prPage = $(progressReportPage);
//                        var percent = $("table:first tr:nth-child(2) > td:nth-child(1) b:eq(1)", prPage).text().trim();
//                        percent = percent.substring(0, percent.length-1);
//                        
//                        var percentNum = 0;
//                        if(percent.length !== 0)
//                            percentNum = parseFloat(percent);
//                        if(isNaN(parseFloat(percent)))
//                            percentNum = 0;
//                        var className = $(".label1:first", prPage).text().trim();
//                        className = className.substring(0, className.length-1);
//                        var objToPush = {
//                            name: className,
//                            perc: percentNum
//                        };
//                        classArray.push(objToPush);
//                    });
//                }); 
            }
            else{
                $(".portal_tab_cont.academics_cont .content .ajax_accordion", page).each(function (i, obj) {
                    var className = $("table > tbody > tr > td.course > a", obj).text().trim();
                    var percent = $("table > tbody > tr > td:nth-child(3) > div > div.float_l.percent", obj).text().trim();
                    var percentNum = 0;
                    if (percent.length !== 0)
                        percentNum = parseFloat(percent.substring(0, percent.length - 1));
                    //var linkStr = "http://" + subdomain + ".schoolloop.com" + $("table > tbody > tr > td:nth-child(4) > a", obj).attr('href');
                    var objToPush = {
                        name: className,
                        perc: percentNum
                        //,link: linkStr
                    };
                    classArray.push(objToPush);
                });
            }
            
            var userName = $("span.page_title", page).text().trim();
            var nameMatches = false;
            var setNameMatches = function(data){
                nameMatches = (userName == (""+data).trim());
            };
            chrome.storage.local.get("name", function(data){setNameMatches(data.name);});
            chrome.storage.local.get('classes', function (obj) {
                
                if (Object.keys(obj.classes).length === 0) {
                    objToSync = {};
                    //var linksToSync = {};
                    for (var i = 0; i < classArray.length; i++) {
                        objToSync[classArray[i].name] = classArray[i].perc;
                        //linksToSync[classArray[i].name] = classArray[i].link;
                    }
                    chrome.storage.local.set({
                        classes: objToSync,                        
                        name: userName
                        //,links: linksToSync,
                    });
                    return;
                } else if(nameMatches){
                    //compare each grade and then notify and then set to current
                    var arr = [];
                    for (var i = 0; i < classArray.length; i++) {
                        if (obj.classes[classArray[i].name] != classArray[i].perc) {
                            console.log("Grade Discrepancy for class " + classArray[i].name + ". " +
                                obj.classes[classArray[i].name] + " vs " + classArray[i].perc);
                            arr.push(classArray[i].name);
                        }
                    }
                    if (arr.length > 0) {
                        var s = "";
                        if (arr.length == 1)
                            s = "Your " + arr[0] + " grade has changed!";
                        else if (arr.length == 2)
                            s = "Grades have changed for " + arr[0] + " and " + arr[1] + "!";
                        else {
                            s = "Grades have changed for ";
                            for (i = 0; i < arr.length - 1; i++)
                                s += arr[i] + ", ";
                            s += "and " + arr[arr.length - 1] + "!";
                        }
                        var options = {
                            type: "basic",
                            iconUrl: "icons/notif.png",
                            title: "In The Loop Notification",
                            message: s
                        };
                        chrome.notifications.create("2", options, function(){});
                    }
                    objToSync = {};
                    for (i = 0; i < classArray.length; i++) {
                        objToSync[classArray[i].name] = classArray[i].perc;
                    }
                    chrome.storage.local.set({
                        classes: objToSync
                    });
                }
            });
        }
    });
};

var testChangeGrade = function(){
    chrome.storage.local.get("classes", function(obj){var x = obj.classes; x["HAmLit"] = 88; chrome.storage.local.set({classes: x});});
    checkFunc();
}

var checkFunc = function () {
    var exitFunc = function(){
        console.log("In The Loop notifications are disabled!");
        return;
    };
    chrome.storage.local.get("notifs", function (data) {
        if (!data.notifs) exitFunc();
    });
    
    var setSchool = function(school){
        chrome.notifications.onClicked.addListener(function (notifId) {
            chrome.tabs.create({
                url: "https://" + school +".schoolloop.com/portal/student_home"
            });
            chrome.notifications.clear("2", function(){});
        });
        parseGradeChanges(school);
    };
    chrome.storage.local.get("sl_subdomain",function (data){setSchool(data.sl_subdomain);});    
};

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "NotificationsAlarm") {
        checkFunc();
    }
});

chrome.alarms.create("NotificationsAlarm", {
    delayInMinutes: 1,
    periodInMinutes: 5
});

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {        
        if(request.msg === "logged_in"){
            if(request.shown)
            {            
                chrome.browserAction.setBadgeText({'text': ''});
                chrome.storage.local.set({popupMsg: ""});
            }
            else{
                    chrome.browserAction.setBadgeText({text: "ERR"});
                    chrome.storage.local.set({popupMsg: "Click 'Show Grades' to enable notifications."});
            }
        }
    }
);

function getBString(){
    return "";
}