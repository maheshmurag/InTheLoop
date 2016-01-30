/*global document, chrome, console, $*/
var themes = { //default theme set, although custom can change
	none: {
		name: "No Theme",
		key: "none"
	},
	mvhs: {
		name: "MVHS",
		key: "mvhs",
		colors: {
			background: "#424242",
			primary: "#7E57C2",
			accent: "#FFD54F",
			background_content: "#FFECB3",
			text: "#FAFAFA",
			text_secondary: "#7E57C2"
		}
	},
	limegrey: {
		name: "Lime Grey",
		key: "limegrey",
		colors: {
			background: "#424242",
			primary: "#607D8B",
			accent: "#CDDC39",
			background_content: "#CFD8DC",
			text: "#FAFAFA",
			text_secondary: "#607D8B"
		}
	},
	firenze: {
		name: "Firenze",
		key: "firenze",
		colors: {
			background: "#B64926",
			primary: "#8E2800",
			accent: "#FFB03B",
			background_content: "#FFF0A5",
			text: "#FAFAFA",
			text_secondary: "#FAFAFA"
		}
	},
	coolgreen: {
		name: "Cool Green",
		key: "firenze",
		colors: {
			background: "#D1DBBD",
			primary: "#3E606F",
			accent: "#91AA9D",
			background_content: "#FCFFF5",
			text: "#FAFAFA",
			text_secondary: "#FAFAFA"
		}
	},
	unsplashrandom: {
		name: "Unsplash - Random Image",
		key: "unsplashrandom",
		colors: {
			background: "url(https://unsplash.it/1960/1080/?random) no-repeat fixed center center/cover",
			primary: "#424242",
			accent: "#E0E0E0",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#424242"
		}
	},
	snowyroad: {
		name: "Snowy Road",
		key: "snowyroad",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/snowyroad.jpg) no-repeat fixed center center/cover",
			primary: "#424242",
			accent: "#E0E0E0",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#424242"
		}
	},
	snowylake: {
		name: "Snowy Lake",
		key: "snowylake",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/snowylake.jpg) no-repeat fixed center center/cover",
			primary: "#424242",
			accent: "#E0E0E0",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#424242"
		}
	},
	rockypeaks: {
		name: "Rocky Peaks",
		key: "rockypeaks",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/rockypeaks.jpg) no-repeat fixed center center/cover",
			primary: "#424242",
			accent: "#E0E0E0",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#424242"
		}
	},
	bluepeaks: {
		name: "Blue Peaks",
		key: "bluepeaks",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/bluepeaks.jpg) no-repeat fixed center center/cover",
			primary: "#3F51B5",
			accent: "#D6DDF7",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#3F51B5"
		}
	},
	abovetheclouds: {
		name: "Above the Clouds",
		key: "abovetheclouds",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/abovetheclouds.jpg) no-repeat fixed center center/cover",
			primary: "#424242",
			accent: "#E0E0E0",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#424242"
		}
	},
	fall: {
		name: "Fall Colors",
		key: "fall",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/fallcolors.jpg) no-repeat fixed center center/cover",
			primary: "#58393E",
			accent: "#D8965A",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#FAFAFA"
		}
	},
	falltwo: {
		name: "Fall Colors Two",
		key: "falltwo",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/fallcolors2.jpg) no-repeat fixed center center/cover",
			primary: "#58393E",
			accent: "#D8965A",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#FAFAFA"
		}
	},
	goldengate: {
		name: "Golden Gate",
		key: "goldengate",
		colors: {
			background: "url(https://mash99.github.io/InTheLoop/bgs/goldengate.jpg) no-repeat fixed center center/cover",
			primary: "#c0362c",
			accent: "#6A4142",
			background_content: "#EEEEEE",
			text: "#FAFAFA",
			text_secondary: "#FAFAFA"
		}
	}
};

var custom_default = {
	name: "Custom Theme",
	key: "custom",
	colors: {
		background: "#000000",
		primary: "#FFFFFF",
		accent: "#FFFFFF",
		background_content: "#FFFFFF",
		text: "#000000",
		text_secondary: "#FFFFFF"
	}
};

var currentTheme = "none";

var dropdown = document.getElementById("theme_select");

function loadThemes(){
	chrome.storage.local.get({current_theme:themes.none, custom_theme:custom_default},function(data){

		//in case we've added more stuff, add saved info to our default custom
		themes.custom = Object.assign(custom_default, data.custom_theme);

		var current = data.current_theme.key;
		console.log('saved current theme key = ' + current);
		if(!themes[current]){
			current = "custom";
			themes.custom.colors = Object.assign(themes.custom.colors, data.current_theme.colors);
		}else{
		}

		for(var theme in themes){
			var option = document.createElement("option");
			option.text = themes[theme].name;
			option.value = theme;
			dropdown.add(option);
		}

		setTheme(current);

		console.log('themes:');
		console.log(themes);
	});
}

//updates data once a theme is selected in the dropdown
function onThemeSelected(){
	setTheme(dropdown.value);
}

function setTheme(themeId){
	currentTheme = themeId;
	dropdown.value = themeId;
	loadTheme(themeId);
	console.log('saving, currentTheme=' + themeId);
	chrome.storage.local.set({current_theme:themes[themeId]}, function(){
		//TODO: add feedback
	});
}

//Loads a theme to the text fields
function loadTheme(themeId){
	document.getElementById("theme_colors").style.display = (themeId == "none")?"none":"block";
	var colors = themes[themeId].colors;
	if(!colors)return;

	document.getElementById("color_primary").value = colors.primary;
	document.getElementById("color_accent").value = colors.accent;
	document.getElementById("color_background").value = colors.background;
	document.getElementById("color_background_content").value = colors.background_content;
	document.getElementById("color_text").value = colors.text;
	document.getElementById("color_text_secondary").value = colors.text_secondary;
}

function saveThemes(){
		var colorData = {};
		//update themes.custom with the current theme
		colorData.primary = document.getElementById("color_primary").value;
		colorData.accent = document.getElementById("color_accent").value;
		colorData.background = document.getElementById("color_background").value;
		colorData.background_content = document.getElementById("color_background_content").value;
		colorData.text = document.getElementById("color_text").value;
		colorData.text_secondary = document.getElementById("color_text_secondary").value;
		//if the data has been changed, set theme to custom
		if(getString(colorData) != getString(themes[currentTheme].colors)){
				themes.custom.colors = colorData;
				setTheme("custom");
				chrome.storage.local.set({custom_theme: themes.custom}, function(){
					//TODO: add notification saying "Saved"
				});
		}
}

function getString(data){
	var str = "";
	str += data.primary + ";" +
		data.accent + ";" +
		data.background + ";" +
		data.background_content + ";" +
		data.text + ";" +
		data.text_secondary + ';';
	return str;
}

  $("span#q1").hover(function () {
    $(this).append("<div class='tooltip'><p>Your school's subdomain (e.g. 'montavista' or 'lynbrook')</p></div>");
  }, function () {
    $("div.tooltip").remove();
  });

  $("span#q2").hover(function () {
    $(this).append("<div class='tooltip'><p>Used to check for grade updates (only stored locally)</p></div>");
  }, function () {
    $("div.tooltip").remove();
  });

var slSubdomain = document.getElementById('sl_subdomain');
slSubdomain.addEventListener("change", function(){
	var subd = slSubdomain.value;
	chrome.storage.local.set({sl_subdomain:subd}, function(){
		chrome.notifications.onClicked.addListener(function (notifId) {
            chrome.tabs.create({
                url: "https://" + subd +".schoolloop.com/portal/student_home"
            });
        });
	});
});

var sl_user = document.getElementById('sl_username');
sl_user.addEventListener("change", function(){
	var userd = sl_user.value;
	chrome.storage.local.set({username:userd}, function(){});
});

var sl_pass = document.getElementById('sl_password');
sl_pass.addEventListener("change", function(){
	var passd = sl_pass.value;
	chrome.storage.local.set({password:passd}, function(){});
});

var notifsEnabled = document.getElementById("enableNotif");
notifsEnabled.addEventListener("change", function(){
    chrome.storage.local.set({notifs:notifsEnabled.checked});
    document.getElementById("resetButton").disabled = !notifsEnabled.checked;
    chrome.storage.local.set({classes: {}});
    chrome.extension.getBackgroundPage().console.log("set notifs: " + notifsEnabled.checked);
});

function loadFields(){
	chrome.storage.local.get(["sl_subdomain", "username", "password", "notifs"], function(data){
		slSubdomain.value = data.sl_subdomain;
        sl_user.value = data.username;
        sl_pass.value = data.password;
        notifsEnabled.checked = data.notifs;
        document.getElementById("resetButton").disabled = !data.notifs;
        if(!data.notifs){
            chrome.storage.local.set({classes: {}});
        }
	});
}

function init(){
	loadThemes();
    loadFields();
}

var resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function(){
    chrome.storage.local.set({classes: {}}); 
    //chrome.storage.local.get('classes', function(data){console.log(data.classes)})
    chrome.extension.getBackgroundPage().alert("Local grade data has been reset!");
});


document.addEventListener('DOMContentLoaded', init);
document.getElementById("save").addEventListener("click", saveThemes);
dropdown.addEventListener("change", onThemeSelected);
