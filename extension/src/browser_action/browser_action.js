function openTab(){

  chrome.tabs.query({
    url: ["*://montavista.schoolloop.com/", "*://montavista.schoolloop.com/portal/student_home*"]
  }, function(tabs){
    console.log(tabs);
    if(tabs.length === 0)createTab();
    else selectTab(tabs[0].id);
  });

}

function createTab(){
  chrome.tabs.create({
    url: "https://montavista.schoolloop.com"
  }, function(){

  });
}

function selectTab(tabNo){
  console.log("selectTab " + tabNo);
  chrome.tabs.update(tabNo, {active:true});
}

document.getElementById("openTab").addEventListener("click", openTab);

document.getElementById("options").addEventListener("click", function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('src/options/options.html'));
  }
});
