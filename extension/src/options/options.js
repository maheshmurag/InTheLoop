var themes = { //default theme set, although custom can change
	none: {
		name: "No Theme",
		colors: {
			background: "#000000",
			primary: "#FFFFFF",
			accent: "#FFFFFF",
			background_content: "#FFFFFF",
			text: "#000000"
		}
	},
	custom: {
		name: "Custom Theme",
		colors: {
			background: "#000000",
			primary: "#FFFFFF",
			accent: "#FFFFFF",
			background_content: "#FFFFFF",
			text: "#000000"
		}
	},
	mvhs: {
		name: "MVHS",
		colors: {
			background: "#424242",
			primary: "#7E57C2",
			accent: "#FFD54F",
			background_content: "#FFECB3",
			text: "#FAFAFA"
		}
	}
};

var currentTheme = "none";

var dropdown = document.getElementById("theme_select");

function loadThemes(){

	chrome.storage.sync.get({themes:themes, current_theme:currentTheme},function(data){

		//load all themes to dropdown entries
		for(var item in data.themes){
			var option = document.createElement("option");
			option.text = data.themes[item].name;
			option.value = item;
			dropdown.add(option);
		}
		themes = data.themes;
		//set current dropdown value to current theme
		selectTheme(data.current_theme);
	});
}

function selectTheme(theme){
	currentTheme = theme;
	dropdown.value = currentTheme;
	themeSelected();
}

//updates data once a theme is selected in the dropdown
function themeSelected(){
	var themeColorsDiv = document.getElementById("theme_colors");
	currentTheme = dropdown.value;
	if(currentTheme == "none"){
		themeColorsDiv.style.display = "none";
	}else{
		themeColorsDiv.style.display = "block";
	}
	loadTheme(themes[currentTheme]);
	saveThemes();
}

//Loads a theme to the text fields
function loadTheme(data){
	document.getElementById("color_primary").value = data.colors.primary;
	document.getElementById("color_accent").value = data.colors.accent;
	document.getElementById("color_background").value = data.colors.background;
	document.getElementById("color_background_content").value = data.colors.background_content;
	document.getElementById("color_text").value = data.colors.text;
}

function saveThemes(){
		var colorData = {};
		//update themes.custom with the current theme
		colorData.primary = document.getElementById("color_primary").value;
		colorData.accent = document.getElementById("color_accent").value;
		colorData.background = document.getElementById("color_background").value;
		colorData.background_content = document.getElementById("color_background_content").value;
		colorData.text = document.getElementById("color_text").value;
		//if the data has been changed, set theme to custom
		if(getString(colorData) != getString(themes[currentTheme].colors)){
				themes.custom.colors = colorData;
				selectTheme("custom");
				console.log(themes);
		}
		chrome.storage.sync.set({themes:themes, current_theme:currentTheme}, function(){
			//TODO: add notification saying "Saved"
		});

}

function getString(data){
	var str = "";
	str += data.primary + ";" +
		data.accent + ";" +
		data.background + ";" +
		data.background_content + ";" +
		data.text + ";";
	return str;
}

document.addEventListener('DOMContentLoaded', loadThemes);
document.getElementById("save").addEventListener("click", saveThemes);
dropdown.addEventListener("change", themeSelected);
