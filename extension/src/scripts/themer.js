chrome.runtime.sendMessage({msg: "logged_in"}, function(response) {});

var currentTheme = {
	name: "No Theme",
	key: "none"
};
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

var moveBtns = document.getElementById("employee");
document.getElementById("page_title").appendChild(moveBtns);

chrome.storage.sync.get({current_theme:currentTheme}, function(data) {
	console.log('data: ');
	console.log(data);

	console.log('current_theme: ');
	console.log(data.current_theme);

	var colors = data.current_theme.colors;

	if (colors) {
		background = colors.background;
		primary_color = colors.primary;
		accent_color = colors.accent;
		content_background = colors.background_content;
		text = colors.text;
		text_secondary = colors.text_secondary;

		//login:
		/*
		addCSSRule(sheet, "#page_title_login", "color: " + accent_color + ";", 0);
		addCSSRule(sheet, "#container_footer_login a", "color: " + text_light + ";", 0);
		addCSSRule(sheet, "#container_footer_login", "background: " + background + "; color: " + text_light + ";", 0);
		addCSSRule(sheet, ".round-left", "background: " + content_background + ";", 0);
		addCSSRule(sheet, ".round-right", "background: " + content_background + ";", 0);
		*/

		//body:
		//addCSSRule(sheet, "body", "background: " + background + ";", 0); //body background
		console.log('background: ' + background);
		$('body').css({'background':background});

		//Header
		$('#container_header_links').css({'background': primary_color}); //sets header background
		$('#container_header_nav').parent().css({'background':'none'}); //top strip of content main page

		$('.header_icons a').css({'background-color':accent_color, 'color':text_secondary});
		$('.header_icons a').hover(function(){
			$(this).css({'background-color':primary_color, 'color':text});
		}, function(){
			$(this).css({'background-color':accent_color, 'color':text_secondary});
		});

		// addCSSRule(sheet, ".header_icons a", "background-color: " + accent_color + ";", 0);
		addCSSRule(sheet, ".header_icons a:hover", "background-color: " + primary_color + "; color:" + text + ";", 0);

		addCSSRule(sheet, ".fixedHeader a:hover", "background-color: " + accent_color + ";color: " + primary_color + ";", 0);

		//"Class Site", "Groups" buttons
		addCSSRule(sheet, ".nav_employee a.trigger:focus, .nav_employee a.trigger:hover", "background: " + accent_color + "; color:" + primary_color + ";", 0);
		addCSSRule(sheet, ".nav_employee a.trigger", "background: " + primary_color + "; color:" + text + ";", 0);

		//page title
		$(".page_title").css({"color":primary_color});

		$("#container_page, #container_content").css({'background':content_background});

		$("#container_footer a").css({"color":text});
		$("#container_footer").css({"background":"none", "color":text});

	}

});
