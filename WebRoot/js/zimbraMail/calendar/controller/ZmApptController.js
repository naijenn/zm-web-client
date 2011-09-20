/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */


/**
 * Creates a new appointment controller to manage read-only appointment viewing.
 * @constructor
 * @class
 *
 * @author Vince Bellows
 *
 * @param {DwtComposite}	container	the containing element
 * @param {ZmCalendarApp}	app		    the handle to the calendar application
 *
 * @extends		ZmListController
 */
ZmApptController = function(container, app) {
    ZmCalItemComposeController.call(this, container, app);
};

ZmApptController.DEFAULT_TAB_TEXT = ZmMsg.message;


ZmApptController.prototype = new ZmCalItemComposeController;
ZmApptController.prototype.constructor = ZmApptController;

ZmApptController.prototype.toString =
function() {
	return "ZmApptController";
};
ZmApptController.viewToTab = {};

ZmApptController.prototype._createComposeView =
function() {
	// override
    return new ZmApptView(this._container,  DwtControl.ABSOLUTE_STYLE, this);
};

ZmApptController.prototype._createToolBar =
function() {

	var buttons = [ ZmOperation.SEND_INVITE, ZmOperation.SAVE, ZmOperation.CANCEL, ZmOperation.SEP,
                    ZmOperation.TAG_MENU
                    ];
    var secondaryButtons = [ZmOperation.EDIT, ZmOperation.DUPLICATE_APPT, ZmOperation.SEP,
                            ZmOperation.REPLY, ZmOperation.REPLY_ALL, ZmOperation.FORWARD_APPT, ZmOperation.PROPOSE_NEW_TIME, ZmOperation.DELETE, ZmOperation.SEP,
                            ZmOperation.SHOW_ORIG
                            ];
    if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		buttons.push(ZmOperation.PRINT);
	}

	this._toolbar = new ZmButtonToolBar({parent:this._container, buttons:buttons, context:this.viewId, controller:this, secondaryButtons:secondaryButtons});
	this._toolbar.addSelectionListener(ZmOperation.SAVE, new AjxListener(this, this._saveListener));
	this._toolbar.addSelectionListener(ZmOperation.CANCEL, new AjxListener(this, this._cancelListener));
	this._toolbar.addSelectionListener(ZmOperation.REPLY, new AjxListener(this, this._replyListener));
	this._toolbar.addSelectionListener(ZmOperation.REPLY_ALL, new AjxListener(this, this._replyAllListener));
	this._toolbar.addSelectionListener(ZmOperation.FORWARD_APPT, new AjxListener(this, this._forwardListener));
	this._toolbar.addSelectionListener(ZmOperation.EDIT, new AjxListener(this, this._editListener));
	this._toolbar.addSelectionListener(ZmOperation.PROPOSE_NEW_TIME, new AjxListener(this, this._proposeTimeListener));
	this._toolbar.addSelectionListener(ZmOperation.DELETE, new AjxListener(this, this._deleteListener));
	this._toolbar.addSelectionListener(ZmOperation.DUPLICATE_APPT, new AjxListener(this, this._duplicateApptListener));
	this._toolbar.addSelectionListener(ZmOperation.SHOW_ORIG, new AjxListener(this, this._showOrigListener));

	if (appCtxt.get(ZmSetting.PRINT_ENABLED)) {
		this._toolbar.addSelectionListener(ZmOperation.PRINT, new AjxListener(this, this._printListener));
	}

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.setVisible(false);


    var tagButton = this._toolbar.getButton(ZmOperation.TAG_MENU);
	if (tagButton) {
		tagButton.noMenuBar = true;
		this._setupTagMenu(this._toolbar);
	}
	// change default button style to toggle for spell check button
	var spellCheckButton = this._toolbar.getButton(ZmOperation.SPELL_CHECK);
	if (spellCheckButton) {
		spellCheckButton.setAlign(DwtLabel.IMAGE_LEFT | DwtButton.TOGGLE_STYLE);
	}

};

ZmApptController.prototype._initToolbar =
function(mode) {
    ZmCalItemComposeController.prototype._initToolbar.call(this, mode);
    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    saveButton.setEnabled(false);
};

ZmApptController.prototype._deleteListener =
function(ev) {
	var op = this.getMode();
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }

    if (calItem.isRecurring()) {
        var mode = (op == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
            ? ZmCalItem.MODE_DELETE_INSTANCE
            : ZmCalItem.MODE_DELETE_SERIES;
        this._app.getCalController()._promptDeleteAppt(calItem, mode);
    }
    else {
        this._app.getCalController()._deleteAppointment(calItem);
    }
};

ZmApptController.prototype._editListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._composeView.edit(ev);
};

ZmApptController.prototype._replyListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._app.getCalController()._replyAppointment(calItem, false);
};

ZmApptController.prototype._replyAllListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    this._app.getCalController()._replyAppointment(calItem, true);
};

ZmApptController.prototype._saveListener =
function(ev) {
    if(!this.isDirty() || !this.getOpValue()) {
        return;
    }
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.getData(ZmOperation.KEY_ID) : null;
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
    var saveCallback = new AjxCallback(this, this._handleSaveResponse);
    var calViewCtrl = this._app.getCalController();
    var respCallback = new AjxCallback(calViewCtrl, calViewCtrl._handleResponseHandleApptRespondAction, [calItem, this.getOpValue(), op, saveCallback]);
	calItem.getDetails(null, respCallback, this._errorCallback);

    //this._app.getCalController()._replyAppointment(calItem, true);
};

ZmApptController.prototype._duplicateApptListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var appt = this.getCalItem();
	var isException = (appt.isRecurring() && op == ZmOperation.VIEW_APPT_INSTANCE);
    var calViewCtrl = this._app.getCalController();
	calViewCtrl.duplicateAppt(appt, {isException: isException});
};

ZmApptController.prototype._showOrigListener =
function(ev) {
	var appt = this.getCalItem();
    var calViewCtrl = this._app.getCalController();
	if (appt)
		calViewCtrl._showApptSource(appt);
};

ZmApptController.prototype._handleSaveResponse =
function(result, value) {
    this.getCurrentView().setOrigPtst(value);
};

ZmApptController.prototype._forwardListener =
function(ev) {
	var op = this.getMode();
    var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }

    var mode = ZmCalItem.MODE_FORWARD;
    if (calItem.isRecurring()) {
		mode = (op == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
			? ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			: ZmCalItem.MODE_FORWARD_SERIES;
	}

    this._app.getCalController()._forwardAppointment(calItem, mode);
};

ZmApptController.prototype._printListener =
function() {
	var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }
	var url = ["/h/printappointments?id=", calItem.invId, "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)]; //bug:53493
    if (appCtxt.isOffline) {
        url.push("&zd=true", "&acct=", this._composeView.getApptEditView().getCalendarAccount().name);
    }
	window.open(appContextPath + url.join(""), "_blank");
};

ZmApptController.prototype._tagButtonListener =
function(ev) {
	var toolbar = this.getCurrentToolbar();
	if (ev.item.parent == toolbar) {
		this._setTagMenu(toolbar);
	}
};

ZmApptController.prototype._setupTagMenu =
function(parent) {
	if (!parent) return;
	var tagMenu = parent.getTagMenu();
	if (tagMenu) {
		tagMenu.addSelectionListener(new AjxListener(this, this._tagListener));
	}
	if (parent instanceof ZmButtonToolBar) {
		var tagButton = parent.getOp(ZmOperation.TAG_MENU);
		if (tagButton) {
			tagButton.addDropDownSelectionListener(new AjxListener(this, this._tagButtonListener));
		}
	}
};

ZmApptController.prototype._proposeTimeListener =
function(ev) {
	var op = this.getMode();

	var calItem = this.getCalItem();
    if(!calItem) {
        return;
    }

	var mode = ZmCalItem.MODE_EDIT;
	if (calItem.isRecurring()) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE
			: ZmCalItem.MODE_EDIT_SERIES;
	}

	var appt = calItem;
	var clone = ZmAppt.quickClone(appt);
	clone.setProposeTimeMode(true);
	clone.getDetails(mode, new AjxCallback(this, this._proposeTimeContinue, [clone, mode]));
};

ZmApptController.prototype._proposeTimeContinue =
function(appt, mode) {
	appt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(appt);
};

ZmApptController.prototype._doTag =
function(items, tag, doTag) {

	var list = this._getTaggableItems(items);

	if (doTag) {
		if (list.length > 0 && list.length == items.length) {
			// there are items to tag, and all are taggable
			ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
		} else {
			var msg;
			var dlg = appCtxt.getMsgDialog();
			if (list.length > 0 && list.length < items.length) {
				// there are taggable and nontaggable items
				var listener = new AjxListener(this, this._handleDoTag, [dlg, list, tag, doTag]);
				dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
				msg = ZmMsg.tagReadonly;
			} else if (list.length == 0) {
				// no taggable items
				msg = ZmMsg.nothingToTag;
			}
			dlg.setMessage(msg);
			dlg.popup();
		}
	} else if (list.length > 0) {
		ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
	}
};

ZmApptController.prototype._doRemoveAllTags =
function(items) {
	var list = this._getTaggableItems(items);
	ZmBaseController.prototype._doRemoveAllTags.call(this, list);
};

ZmApptController.prototype._handleDoTag =
function(dlg, list, tag, doTag) {
	dlg.popdown();
	ZmBaseController.prototype._doTag.call(this, list, tag, doTag);
};

ZmApptController.prototype._getTaggableItems =
function(items) {
	var calItem = this.getCalItem();
    items = [];
    items.push(calItem);
	return items;
};

ZmApptController.prototype.getItems =
function() {
	return this._getTaggableItems([]);
};

ZmApptController.prototype._getViewType =
function() {
	return appCtxt.getAppViewMgr().getCurrentViewId();
};

ZmApptController.prototype.getCalItem =
function() {
    var ci = this._composeView ? this._composeView._calItem : null;
    return ci;
};

ZmApptController.prototype.getOpValue =
function() {
    var s = this._composeView ? this._composeView.getOpValue() : null;
    return s;
};

ZmApptController.prototype.isDirty =
function() {
    var dirty = this._composeView ? this._composeView.isDirty() : false;
    return dirty;
};

ZmApptController.prototype.getMode =
function() {
    var m = this._composeView ? this._composeView._mode : null;
    return m;
};

ZmApptController.prototype.getCurrentView =
function() {
	return this._composeView;
};

ZmApptController.prototype.getCurrentViewId =
function() {
	return this._viewId;
};

ZmApptController.prototype.getCurrentToolbar =
function() {
	return this._toolbar;
};

ZmApptController.prototype.getScheduleAssistant =
function() {
    return this._smartScheduler;
};

ZmApptController.prototype.setSchedulerPanelContent =
function() {
    var scheduler = this.getScheduleAssistant();
    if (scheduler) {
		var components = {};
		components[ZmAppViewMgr.C_TREE] = scheduler;
        appCtxt.getAppViewMgr().setViewComponents(this._viewId, components, true);
        this._schedulerRendered = true;
    }
};

ZmApptController.prototype._postShowCallback =
function() {
	ZmCalItemComposeController.prototype._postShowCallback.call(this);
    this._app.setOverviewPanelContent();
};
