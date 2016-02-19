/*global define, chrome, $, console, document, window*/
function openTab() {
    
//    chrome.tabs.query({
//        url: ["*://*.schoolloop.com/", "*://*.schoolloop.com/portal/student_home*"]
//    }, function (tabs) {
//        //console.log(tabs);
//        if (tabs.length === 0) createTab();
//        else selectTab(tabs[0].id);
//    });

}
//
//function createTab() {
//    chrome.storage.local.get("sl_subdomain", function (data) {
//        chrome.tabs.create({
//            url: "https://" + data.sl_subdomain + ".schoolloop.com"
//        }, function () {});
//    });
//}
//
//function selectTab(tabNo) {
//    console.log("selectTab " + tabNo);
//    chrome.tabs.update(tabNo, {
//        active: true
//    });
//}

var sandboxEnabled = document.getElementById("sandbox");
sandboxEnabled.addEventListener("change", function () {
    console.log('checked? ' + sandboxEnabled.checked);
    chrome.storage.local.set({
        sandbox_enabled: sandboxEnabled.checked
    }, function () {
        //TODO: Feedback
    });
});

function loadSandboxEnabled() {
    chrome.storage.local.get({
        sandbox_enabled: true
    }, function (data) {
        sandboxEnabled.checked = data.sandbox_enabled;
    });
}

function init() {
    loadSandboxEnabled();
}

var pOnClick = function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('src/options/options.html'));
    }
    //    chrome.storage.local.get("sl_subdomain", function(data){
    //        chrome.tabs.create({ url: "https://"+data.sl_subdomain+".schoolloop.com/portal/login" });
    //    });
};

chrome.storage.local.get('popupMsg', function (data) {
    var errorDiv = document.getElementById('errors');
    var errorP = document.getElementById('errorsP');
    if (data.popupMsg === "")
        errorDiv.style.display = "none";
    else {
        errorDiv.style.display = "block";
        errorP.innerHTML = data.popupMsg;
        errorP.addEventListener("click", pOnClick);
    }
    //    chrome.extension.getBackgroundPage().console.log(data.popupMsg + " : line 48");
});

init();

//document.getElementById("openTab").addEventListener("click", openTab);

document.getElementById("options").addEventListener("click", function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('src/options/options.html'));
    }
});