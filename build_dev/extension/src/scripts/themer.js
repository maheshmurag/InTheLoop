// CONSTANTS FOR DEFAULTS
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
}

var currentTheme = "none";
//END DEFAULT CONSTANTS

var sheet = (function() {
	// Create the <style> tag
	var style = document.createElement("style");
	// WebKit hack :(
	style.appendChild(document.createTextNode(""));
	// Add the <style> element to the page
	document.head.appendChild(style);
	return style.sheet;
})();

function addCSSRule(sheet, selector, rules, index) {
	if ("insertRule" in sheet) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	} else if ("addRule" in sheet) {
		sheet.addRule(selector, rules, index);
	}
}

/*
CYAN DARK THEME
var background = "#424242";
var primary_color = "#009688";
var accent_color = "#B0BEC5";
var content_background = "#B0BEC5";
var text_light = "#FAFAFA";
*/


var moveBtns = document.getElementById("employee");
document.getElementById("page_title").appendChild(moveBtns);

// Use default value color = 'red' and likesColor = true.
chrome.storage.sync.get({ themes:themes, current_theme:currentTheme }, function(data) {

	themes = data.themes;
	currentTheme = data.current_theme;

	var colors = themes[currentTheme].colors;

	background = colors.background;
	primary_color = colors.primary;
	accent_color = colors.accent;
	content_background = colors.background_content;
	text_light = colors.text;

	//TODO: MAKE THIS JQUERY

	if (currentTheme != "none") {

		//login:
		/*
		addCSSRule(sheet, "#page_title_login", "color: " + accent_color + ";", 0);
		addCSSRule(sheet, "#container_footer_login a", "color: " + text_light + ";", 0);
		addCSSRule(sheet, "#container_footer_login", "background: " + background + "; color: " + text_light + ";", 0);
		addCSSRule(sheet, ".round-left", "background: " + content_background + ";", 0);
		addCSSRule(sheet, ".round-right", "background: " + content_background + ";", 0);
		*/

		//body:
		addCSSRule(sheet, "body", "background: " + background + ";", 0); //body background

		//Header:
		addCSSRule(sheet, "#container_header_links", "background: " + primary_color + ";", 0); //sets header background
		document.getElementById("container_header_nav").parentNode.style.background = "none"; //top strip of content main page

		addCSSRule(sheet, ".header_icons a", "background-color: " + accent_color + ";", 0);
		addCSSRule(sheet, ".header_icons a:hover", "background-color: " + primary_color + "; color:" + text_light + ";", 0);

		addCSSRule(sheet, ".fixedHeader a:hover", "background-color: " + accent_color + ";color: " + primary_color + ";", 0);

		//"Class Site", "Groups" buttons
		addCSSRule(sheet, ".nav_employee a.trigger:focus, .nav_employee a.trigger:hover", "background: " + accent_color + "; color:" + primary_color + ";", 0);
		addCSSRule(sheet, ".nav_employee a.trigger", "background: " + primary_color + "; color:" + text_light + ";", 0);

		//page title
		addCSSRule(sheet, ".page_title", "color: " + primary_color + ";", 0);

		addCSSRule(sheet, "#container_page, #container_content", "background: " + content_background + ";", 0);

		addCSSRule(sheet, "#container_footer a", "color: " + text_light + ";", 0);
		addCSSRule(sheet, "#container_footer", "background: " + background + "; color: " + text_light + ";", 0);

	}

});
