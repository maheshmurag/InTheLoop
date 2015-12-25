/*global chrome, console*/
chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
    chrome.tabs.executeScript(null, {
        "file": "content_script.js"
    }, function () { // Execute your code
        alert("Toggled In The Loop"); // Notification on Completion
    });
});
