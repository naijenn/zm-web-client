/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmChooseFolderDialog(parent, className) {
	ZmDialog.call(this, parent, null, className, ZmMsg.chooseFolder);

	this.setContent(this._contentHtml());
	this._createOverview(ZmChooseFolderDialog._OVERVIEW_ID, this._folderTreeCellId);
};

ZmChooseFolderDialog.prototype = new ZmDialog;
ZmChooseFolderDialog.prototype.constructor = ZmChooseFolderDialog;

ZmChooseFolderDialog._OVERVIEW_ID = "ZmChooseFolderDialog";


// Public Methods

ZmChooseFolderDialog.prototype.toString =
function() {
	return "ZmChooseFolderDialog";
};

/**
* @param 	treeIds			[Array] 	Id's from overview's tree view's
* @param	omit			[Hash]		Id's to omit in tree view
* @param	skipReadOnly	[Boolean] 	Set true if you dont want to show read only folders
* @param	description		[String]	Description of what the user is selecting
*/
ZmChooseFolderDialog.prototype.popup =
function(treeIds, omit, skipReadOnly, description) {
	if (skipReadOnly) {
		for (var j = 0; j < treeIds.length; j++) {
			// remove any addrbooks that are read only
			var folders = this._appCtxt.getTree(treeIds[j]).asList();

			for (var i = 0; i < folders.length; i++) {
				var folder = folders[i];
				if (folder.link && folder.isReadOnly())
					omit[folder.id] = true;
			}
		}
	}

	if (description) {
		var descCell = document.getElementById(this._folderDescCellId);
		descCell.innerHTML = description;
	}

	this._renderOverview(ZmChooseFolderDialog._OVERVIEW_ID, treeIds, omit);

	ZmDialog.prototype.popup.call(this);

	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._treeView[treeId] = this._opc.getTreeView(ZmChooseFolderDialog._OVERVIEW_ID, treeId);
		var tree = this._opc.getTreeData(treeId);
		var ti = treeView.getTreeItemById(tree.root.id);
		ti.setExpanded(true);
		if (this._folder && treeId == this._folder.type)
			treeView.setSelected(tree.root);
	}
};

ZmChooseFolderDialog.prototype.reset =
function() {
	var descCell = document.getElementById(this._folderDescCellId);
	descCell.innerHTML = "";

	this._opc.clearOverview();

	ZmDialog.prototype.reset.call(this);
};

ZmChooseFolderDialog.prototype._contentHtml =
function() {
	this._folderDescCellId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	html[idx++] = "<tr><td class='Label' colspan=2 id='";
	html[idx++] = this._folderDescCellId;
	html[idx++] = "'></td></tr><tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr></table>";

	return html.join("");
};

ZmChooseFolderDialog.prototype._okButtonListener =
function(ev) {
	var tgtFolder = this._opc.getSelected(ZmChooseFolderDialog._OVERVIEW_ID);
	DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
};
