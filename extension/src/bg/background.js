/*global console, chrome, $, document*/
/* jshint shadow:true */
//chrome.browserAction.onClicked.addListener(function (tab) {
//    checkFunc();
//});

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({
        classes: {}
    });
    chrome.storage.local.set({popupMsg: ""});
    chrome.storage.local.set({sl_subdomain:"montavista"}, function(){});
    
    var school = "";
    chrome.storage.local.get("sl_subdomain",function (data){school = data.sl_subdomain;});
    chrome.notifications.onClicked.addListener(function (notifId) {
        chrome.tabs.create({
            url: "https://" + school +".schoolloop.com/portal/student_home"
        });
    });
   
});

//var attemptLogin = function(){
//    
//    
//      $.ajax({
//          url: "https://montavista.schoolloop.com/portal/student_home",
//          type: "GET",
//          dataType: "html",
//          success: function () {
//              $.ajax({
//                  url: "https://montavista.schoolloop.com/portal/login?etarget=login_form",
//                  type: "POST",
//                  data: {
//                      login_name: "",
//                      password: ""
//                  },
//                  dataType: "json",
//                  success: function (data) {
//                      console.log("Success: ");
//                      console.log(data);
////                      $.ajax({
////                          url: "https://montavista.schoolloop.com/portal/student_home",
////                          type: "GET",
////                          dataType: "html",
////                          success: function(data){
////                              console.log("line 48")
////                              console.log(data)
////                          }
////                      });
//                  }
//              });
//          }
//      })
//    
//}

var checkFunc = function () {
    var objToSync;
    chrome.storage.local.get('classes', function (obj) {
        console.log("BEG:");
        console.log(obj);
    });
    $.get("https://montavista.schoolloop.com/portal/student_home", function (data) {
        // load response text into a new page element
        var SLPage = document.createElement("html");
        SLPage.innerHTML = data;
        var page = $(SLPage);
        var schoolName = $("#page_title_login", page);
        if (schoolName.length) { //not logged in
            console.log("Grade update notifications won't work unless you're logged in!");
//            $("input[name='login_name']", page).val("");
//            $("input[name='password']", page).val("");
//            $("a.btn-action-highlight-lg").trigger("click");
//            console.log("attempted login line 63")
            chrome.browserAction.setBadgeText({text: "ERR"});
            chrome.storage.local.set({popupMsg: "Login to School Loop to enable notifications"});
        } else { //logged in
            chrome.browserAction.setBadgeText({'text': ''});
            chrome.storage.local.set({popupMsg: ""});
            console.log("Logged in!");
            var classArray = [];

            $(".portal_tab_cont.academics_cont .content .ajax_accordion", page).each(function (i, obj) {
                var className = $("table > tbody > tr > td.course > a", obj).text().trim();
                var percent = $("table > tbody > tr > td:nth-child(3) > div > div.float_l.percent", obj).text().trim();
                var percentNum = 0;
                if (percent.length !== 0)
                    percentNum = parseFloat(percent.substring(0, percent.length - 1));
                var linkStr = "http://montavista.schoolloop.com" + $("table > tbody > tr > td:nth-child(4) > a", obj).attr('href');
                var objToPush = {
                    name: className,
                    perc: percentNum,
                    link: linkStr
                };
                classArray.push(objToPush);
            });
            //get grades current
            chrome.storage.local.get('classes', function (obj) {
                if (Object.keys(obj.classes).length === 0) {
                    objToSync = {};
                    var linksToSync = {};
                    console.log("classes is empty");
                    for (var i = 0; i < classArray.length; i++) {
                        objToSync[classArray[i].name] = classArray[i].perc;
                        linksToSync[classArray[i].name] = classArray[i].link;
                    }
                    console.table(classArray);
                    chrome.storage.local.set({
                        classes: objToSync,
                        links: linksToSync
                    });
                    chrome.storage.local.get('classes', function (obj) {
                        console.log("END:");
                        console.log(obj);
                    });
                    return;
                } else {
                    //compare each grade and then notify and then set to current
                    console.log("Previous data retrieved!");
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
                            iconUrl: "src/bg/notif.png",
                            title: "In The Loop Notification",
                            message: s
                        };
                        chrome.notifications.create("", options, console.log("notification created!"));

                    }
                    objToSync = {};
                    for (i = 0; i < classArray.length; i++) {
                        objToSync[classArray[i].name] = classArray[i].perc;
                    }
                    chrome.storage.local.set({
                        classes: objToSync
                    });
                    chrome.storage.local.get('classes', function (obj) {
                        console.log("END:");
                        console.log(obj);
                    });
                }
            });
        }
    });
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
        //  	chrome.pageAction.show(sender.tab.id);
        sendResponse();
    });
