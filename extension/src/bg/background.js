/*global console, chrome, $, document*/
/* jshint shadow:true */
/* jshint loopfunc:true */

//TODO: Set correct version number
var ITLversion = "V0.3.1";
var grades = [];

var getYear = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //Jan is 0
    var yyyy = today.getFullYear();
    if (dd < 10)
        dd = '0' + dd;
    if (mm < 10)
        mm = '0' + mm;
    var today = dd + '/' + mm + '/' + yyyy;
    return today;
};
var yearVal = getYear();
var constants = {
    "version": "2",
    "devToken": "599F9C00-92DC-4B5C-9464-7971F01F8370",
    "year": yearVal,
    "devOS": "5"
};

var setStudentID = function (bString, subdomain) {
    function set(data) {
        var studentID = JSON.parse(data).students[0].studentID;
        setPeriodIDs(bString, studentID, subdomain);
    }
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://" + subdomain + ".schoolloop.com/mapi/login?version=" + constants.version + "&devToken=" + constants.devToken + "&devOS=" + constants.devOS + "&year=" + constants.year + "",
        complete: function (msg) {
            //successful if msg.status == 200
            set(msg.responseText);
        }
    });
};
var setPeriodIDs = function (bString, studentID, subdomain) {
    function set(data) {
        data = JSON.parse(data);
        var periodIDs = [];
        for (var i = 0; i < data.length; i++)
            periodIDs.push({
                courseName: data[i].courseName,
                periodID: data[i].periodID
            });
        gradesFromIDs(bString, periodIDs, 0, subdomain, studentID);
    }
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://" + subdomain + ".schoolloop.com/mapi/report_card?studentID=" + studentID,
        complete: function (msg) {
            //successful if msg.status == 200
            set(msg.responseText);
        }
    });
};
var gradesFromIDs = function (bString, periodIDs, i, subdomain, studentID) {
    if (i >= periodIDs.length) {
        checkForChanges();
        return;
    }
    $.ajax({
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + bString);
        },
        url: "https://" + subdomain + ".schoolloop.com/mapi/progress_report",
        data: {
            studentID: studentID,
            periodID: periodIDs[i].periodID
        },
        complete: function (msg) {
            //            console.log("line 86")
            var data = JSON.parse(msg.responseText);
            var objP = {};
            objP.name = periodIDs[i].courseName + "";
            objP.perc = parseFloat(data[0].score) * 100;
            grades.push(objP);
            gradesFromIDs(bString, periodIDs, i + 1, subdomain, studentID);
        }
    });
};

function isEmpty(map) {
    for (var key in map) {
        if (map.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

var checkForChanges = function () {
    //NOTE: Loops through grades object, and creates notifications for discrepancies
    chrome.storage.local.get("classes", function (obj) {
        var classes = obj.classes;
        if (isEmpty(classes)) { //Object.keys(classes).length === 0) {
            var objToSync = {};
            for (var i = 0; i < grades.length; i++) {
                objToSync[grades[i].name] = grades[i].perc;
            }
            chrome.storage.local.set({
                classes: objToSync
            });
            return;
        } else {
            var arr = [];
            for (var i = 0; i < grades.length; i++) {
                if (obj.classes[grades[i].name] != grades[i].perc) {
                    console.log("Grade Discrepancy for class " + grades[i].name + ". " +
                        obj.classes[grades[i].name] + " vs " + grades[i].perc);
                    arr.push(grades[i].name);
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
                chrome.storage.local.get("sl_subdomain", function (data) {
                    createNotification("2", "In The Loop Notification", s, "https://" + data.sl_subdomain + ".schoolloop.com/portal/student_home", function () {});
                });
            }
            var objToSync = {};
            for (i = 0; i < grades.length; i++) {
                objToSync[grades[i].name] = grades[i].perc;
            }
            chrome.storage.local.set({
                classes: objToSync
            });
        }
    });
};

/**
 * Creates a notification
 * @param {number}   id       ID of notif
 * @param {string}   title    Header
 * @param {string}   message  Inner text
 * @param {string}   url      URL
 * @param {function} callback function to call afterwards
 */
function createNotification(id, title, message, url, callback) {
    var options = {
        type: "basic",
        iconUrl: "icons/notif.png",
        title: title,
        message: message
    };

    chrome.notifications.create(id, options, function (createdId) {
        var handler = function (id) {
            if (id == createdId) {
                chrome.tabs.create({
                    url: url
                });
                chrome.notifications.clear(id);
                chrome.notifications.onClicked.removeListener(handler);
            }
        };
        chrome.notifications.onClicked.addListener(handler);
        if (typeof callback == "function") callback();
    });
}

chrome.runtime.onInstalled.addListener(function () {
    createNotification("1", "Welcome to In The Loop " + ITLversion, "Click to set up notifications", "chrome://extensions/?options=ppigcngidmooiiafkelbilbojiijffag", function () {});
    //chrome.tabs.create({ url: "http://maheshmurag.com/InTheLoop/" });
    chrome.storage.local.set({
        classes: {},
        username: "",
        password: "",
        popupMsg: "",
        notifs: true,
        sl_subdomain: "montavista"
    });
});

//TODO: remove in production
var testChangeGrade = function (callCheck) {
    chrome.storage.local.get("classes", function (obj) {
        var x = obj.classes;
        x.HAmLit = 88;
        chrome.storage.local.set({
            classes: x
        });
    });
    if (callCheck) checkFunc();
};

var checkFunc = function () {
    var exitFunc = function () {
        console.log("In The Loop notifications are disabled!");
        return;
    };
    chrome.storage.local.get("notifs", function (data) {
        if (!data.notifs) exitFunc();
    });

    chrome.storage.local.get(["sl_subdomain", "username", "password"], function (obj) {
        if (obj.username == "" || obj.password == "" || obj.sl_subdomain == "") {
            badgeError("ERR", "Incorrect username, password, or school's subdomain.");
        } else {
            grades = [];
            parseGradeChanges(obj.username, obj.password, obj.sl_subdomain);
        }
    });
};

function parseGradeChanges(username, password, subdomain) {
    /* jshint ignore:start */ //in order to avoid "btoa" is undefined
    var bCred = btoa(username + ":" + password);
    setStudentID(bCred, subdomain); //calls setPeriodIDs which calls gradesFromIDs
    /* jshint ignore:end */
}

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "NotificationsAlarm") {
        checkFunc();
    }
});

chrome.alarms.create("NotificationsAlarm", {
    delayInMinutes: 1,
    periodInMinutes: 5
});

//TODO: remove in production
function printGrades() {
    chrome.storage.local.get("classes", function (obj) {
        console.log(obj.classes);
    });
}

function badgeError(badge, popup) {
    chrome.browserAction.setBadgeText({
        'text': badge
    });
    chrome.storage.local.set({
        popupMsg: popup
    });
}

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "logged_in") {
            if (request.shown) {
                badgeError("", "");
            } else {
                badgeError("ERR", "Click 'Show Grades' to enable notifications.");
            }
        }
    }
);