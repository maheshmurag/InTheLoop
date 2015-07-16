/*
 *
 *  * Copyright (c) 2004-2014, School Loop, Inc. All Rights Reserved.
 *
 */



var sl = new Object();

sl.slAjaxScope = null;
sl.slReturnURL = null;

sl.initSLAjax = function(ajaxScope, returnURL) {
    sl.slAjaxScope = ajaxScope;
    sl.slReturnURL = returnURL;
}

sl.getAjaxScope = function() {
    return sl.slAjaxScope;
}

sl.getReturnURL = function() {
    return sl.slReturnURL;
}

sl.supportsColorInput = function() {
    var i = document.createElement("input");
    i.setAttribute("type", "color");
    var result = i.type !== "text";
    return result;
}

sl.submit_event = function(event, form) {
    var target;
    if (form) {
        target = jQuery("#" + form);
    }
    else {
        target = jQuery("form:first");
    }
    jQuery("#event_override", target).val(event);
    target.submit();
    return false;
}


sl.addAjaxScope = function (variables) {
    variables['ajax_scope'] = sl.getAjaxScope();
};

sl.addAjaxScopeToURL = function(url) {
    var result = url;
    var ajaxScope = sl.getAjaxScope();
    if ( ajaxScope == null )
    {
        result = url + "&legaxy_ajax=true";
    }
    else
    {
        result = url + "&ajax_scope=" + ajaxScope;
    }
    return result;
}

sl.findDataInParent = function (startElement, dataLabel) {
    var result = jQuery(startElement).data(dataLabel);
    if (result == null) {
        jQuery(startElement).parents().each(function (index) {
            result = jQuery(this).data(dataLabel);
            if ( dataLabel == "selectableModule" )
            {
                sl.log("selectableModule id:" + jQuery(this).attr("id") + "found:" + (result==true));
            }
            return(result == null);
        });
    }
    return result;
};

sl.findDataInChild = function (startElement, dataLabel) {
    var result = jQuery(startElement).data(dataLabel);
    if (result == null) {
        jQuery(startElement).find().each(function (index) {
            result = jQuery(this).data(dataLabel);
            return(result == null);
        });
    }
    return result;
};

sl.refresh = function (refreshURL, refreshArea, variables, success) {
    if (variables == null) {
        variables = {};
    }
    if (refreshURL.indexOf("mod=") == -1) {
        variables["mod"] = refreshArea;
    }
    if (success == null) {
        success = function (data) {
            jQuery("#" + refreshArea).replaceWith(data);
        }
    }
    sl.addAjaxScope(variables);
    jQuery.ajax({
        type: "GET",
        async: false,
        url: refreshURL,
        data: variables,
        success: success
    });
};

sl.postAndRefresh = function (postURL, variables, refreshURL, refreshArea) {
    sl.addAjaxScope(variables);
    jQuery.ajax({
        type: "POST",
        async: false,
        url: postURL,
        data: variables,
        success: function (data) {
            sl.refresh(refreshURL, refreshArea);
        }
    });
};

sl.getAndRefresh = function (getURL, variables, refreshURL, refreshArea) {
    sl.addAjaxScope(variables);
    jQuery.ajax({
        type: "GET",
        async: false,
        url: getURL,
        data: variables,
        success: function (data) {
            sl.refresh(refreshURL, refreshArea);
        }
    });
};

sl.ajaxSubmit = function (event, form, options) {
    var target;
    if (form) {
        target = jQuery("#" + form);
    }
    else {
        target = jQuery("form:first");
    }
    if (options == null) {
        options = {};
    }
    options["async"] = false;
    jQuery("#event_override", target).val(event);
    jQuery("#ajax_scope", sl.getAjaxScope());
    if ("ajaxSubmit" in jQuery(target)) {
        jQuery(target).ajaxSubmit(options);
    }
    else {
        var postData = jQuery(target).serializeArray();
        var formURL = jQuery(target).attr("action");
        options["url"] = formURL;
        options["type"] = "POST";
        options["async"] = false;
        options["data"] = postData;
        jQuery.ajax(options);
    }
    return target;
}

sl.log = function (m1, m2, m3, m4, m5, m6) {
    if (!window.console) {
        console = { log: function(){}};
    }
    console.log(m1, ((m2) ? m2 : ""), ((m3) ? m3 : ""), ((m4) ? m4 : ""), ((m5) ? m5 : ""), ((m6) ? m6 : ""));
}

sl.initCKEditor = function (id, config, styleSheet, toolbar, width, height) {

    if ((toolbar == null) || (toolbar.length == 0)) {
        toolbar = "GenericContent";
    }
    if ((width == null) || (width.length == 0)) {
        width = "98%";
    }
    if ((height == null) || (height.length == 0)) {
        height = "100px";
    }

    var dragOptions = {
        dropAreaID: id,
        uploadFileURL:"/locker2/uploadImageFile?d=x"

    }
    new UploadDragFile(dragOptions);


    var autoheight = parseInt(height, 10);
    options = {
        customConfig: config,
        stylesCombo_stylesSet: styleSheet,
        toolbar: toolbar,
        startupFocus: false,
        height: height,
        autoGrow_minHeight: autoheight,
        width: width
    }

    jQuery("#" + id).ckeditor(options);

    CKEDITOR.on('dialogDefinition', function (ev) {
        // Take the dialog name and its definition from the event data.
        var dialogName = ev.data.name;
        var dialogDefinition = ev.data.definition;
        if (dialogName == 'link') {
            dialogDefinition.removeContents('advanced');
        }

        if (dialogName == 'table') {
            var infoTab = dialogDefinition.getContents('info');
            txtBorder = infoTab.get( 'txtBorder' );
            txtBorder['default'] = 1;
            txtWidth = infoTab.get( 'txtWidth' );
            txtWidth['default'] = "100%";
            txtCellSpace = infoTab.get( 'txtCellSpace' );
            txtCellSpace['default'] = "0";
            txtCellPad = infoTab.get( 'txtCellPad' );
            txtCellPad['default'] = 10;
        }
    })
}

sl.alert = function(message) {
    vex.dialog.alert({
        contentClassName: 'vex-alert',
        message:message,
        buttons: [
            jQuery.extend({}, vex.dialog.buttons.YES, {
                text: 'OK',
                click: function ($vexContent) {
                    vex.close($vexContent.data().vex.id);
                }
            })

        ]

    });
}


sl.combineInputs = function (targetInput, source1Input, source2Input) {
    var source1Value = jQuery(source1Input).attr('value');
    var source2Value = jQuery(source2Input).attr('value');
    jQuery(targetInput).attr('value', source1Value + " " + source2Value);
}

sl.showHidden = function(el,time,focus){ //time is added to wait for ckeditor load when relevant
    if (!(time > 0)) {
        time = 0
    }
    window.setTimeout(function(){
        var off = el.offset();
        var t = off.top;
        var h = el.height();
        var docH = jQuery(window).height();
        var currentScroll = jQuery(window).scrollTop()
        var bottomHidden = (t + h) - (docH + currentScroll);
        if (bottomHidden > 0){
            jQuery('html, body').animate({ scrollTop: currentScroll + bottomHidden +10 }, 700);
        }
        if (focus){
            el.find("input:first").focus().select();
        }
    },time, 'easeInOutCubic');
}

jQuery(document).on("ready", function () {

    sl.log("global on ready")
    if ( "vex" in window )
    {
        vex.defaultOptions.className = 'vex-theme-os';
    }
    sl.deleteDialog = jQuery("#dialog-confirm").dialog({
        resizable: false,
        height: 240,
        modal: true,
        autoOpen: false,
        buttons: [
            {
                text: "Cancel",
                id: "jsCancel",
                click: function () {
                }
            },
            {
                text: "Delete",
                id: "jsConfirm",
                click: function () {
                }
            }
        ]
    });


    sl.saveConfirmDialog = jQuery("#save-continue-dialog").dialog({
        resizable: false,
        height: 240,
        modal: true,
        autoOpen: false,
        open: function () {
            jQuery('#jsSaveContBtn').focus();
        }
    });

    sl.publishConfirmDialog = jQuery("#publish-continue-dialog").dialog({
        resizable: false,
        height: 240,
        modal: true,
        autoOpen: false,
        open: function () {
            jQuery('#jsPublishContBtn').focus();
        }
    });



    sl.longActionStatusDialog = jQuery("#long_action_status").dialog({
        resizable: false,
        height: 200,
        width:350,
        modal: true,
        autoOpen: false,
        dialogClass:"jsRemoveTitle"
    });

    /* **** open initial page popup if one on page *** */
    jQuery("#jsPageloadPopup").click();
})

sl.confirmDelete = function (el) {
    confirmDeferred = new jQuery.Deferred();
    if (el && jQuery(el).attr("jsWarningText")) {
        messageText = jQuery(el).attr("jsWarningText")
    }
    else {
        messageText = "Are you sure you want to confirm this action?"
    }
    jQuery("#jsDeleteConfirmText").text(messageText)
    sl.deleteDialog.dialog("open");
    jQuery("#jsCancel").click(function () {
        sl.deleteDialog.dialog("close");
        confirmDeferred.resolve('Cancel')
    })
    jQuery("#jsConfirm").click(function () {
        sl.deleteDialog.dialog("close");
        confirmDeferred.resolve('Confirm');
    })
    return confirmDeferred.promise()
}
/* ***** Put this function in delete handler to call confirm delete ***
 sl.confirmDelete(ev.target).then(function (action)
 {
 if (action == "Cancel")
 {
 return;
 }
 else
 {
 moduleData.deleteDocument();
 }
 });


 *** and put this attribute on the button
 jsWarningText="Are you sure you want to delete this document"

 */


sl.confirmSave = function (exitMessage) {
    confirmDeferred = new jQuery.Deferred();
    if (exitMessage == "publish"){
        sl.publishConfirmDialog.dialog("open")
        jQuery(".jsPublishContBtn").click(function () {
            sl.publishConfirmDialog.dialog("close");
            confirmDeferred.resolve('PublishContinue')
        });
        jQuery(".jsNoActionBtn").click(function () {
            sl.publishConfirmDialog.dialog("close");
            confirmDeferred.resolve('NoAction');
        })
    }
    else {
        sl.saveConfirmDialog.dialog("open")
        jQuery(".jsSaveContBtn").click(function () {
            sl.saveConfirmDialog.dialog("close");
            confirmDeferred.resolve('SaveContinue')
        })
        jQuery(".jsNoActionBtn").click(function () {
            sl.saveConfirmDialog.dialog("close");
            confirmDeferred.resolve('NoAction');
        })
    }
    return confirmDeferred.promise()
}

sl.startLongAction = function(holder, button)
{
    if ( holder.longActionMonitor == null )
    {
        holder.longActionMonitor = new LongActionMonitor(holder, "/pf4/support/longActionMonitor", 100, 500, button);
    }
}

sl.stopLongAction = function(holder)
{
    holder.longActionMonitor.stop();
}

sl.longActionStatusOpen = function () {
    sl.longActionStatusDialog.dialog("open");
}

sl.longActionStatusClose = function () {
    sl.longActionStatusDialog.dialog("close");
}

sl.resizeIframe = function(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}



/*  *** Horizontal scroll handler for fixedHeader *** */
jQuery("body").ready(function(){
    if (jQuery(".fixedHeader").length > 0){
            var leftInit = jQuery(".fixedHeader").offset().left;
            jQuery(window).scroll(function(event) {
                var x = 0 - jQuery(this).scrollLeft();
                jQuery(".fixedHeader")
                    .offset({
                        left: x + leftInit
                    })
            });
    }
})