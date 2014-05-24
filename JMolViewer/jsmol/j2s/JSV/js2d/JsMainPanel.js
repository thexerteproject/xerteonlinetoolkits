Clazz.declarePackage ("JSV.js2d");
Clazz.load (["JSV.api.JSVMainPanel"], "JSV.js2d.JsMainPanel", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.selectedPanel = null;
this.currentPanelIndex = 0;
this.title = null;
this.visible = false;
this.focusable = false;
this.enabled = false;
Clazz.instantialize (this, arguments);
}, JSV.js2d, "JsMainPanel", null, JSV.api.JSVMainPanel);
$_V(c$, "getCurrentPanelIndex", 
function () {
return this.currentPanelIndex;
});
$_V(c$, "dispose", 
function () {
});
$_V(c$, "getTitle", 
function () {
return this.title;
});
$_V(c$, "setTitle", 
function (title) {
this.title = title;
}, "~S");
$_V(c$, "setSelectedPanel", 
function (viewer, jsvp, panelNodes) {
if (jsvp !== this.selectedPanel) this.selectedPanel = jsvp;
var i = viewer.selectPanel (jsvp, panelNodes);
if (i >= 0) this.currentPanelIndex = i;
this.visible = true;
}, "JSV.common.JSViewer,JSV.api.JSVPanel,JU.List");
$_M(c$, "getHeight", 
function () {
return (this.selectedPanel == null ? 0 : this.selectedPanel.getHeight ());
});
$_M(c$, "getWidth", 
function () {
return (this.selectedPanel == null ? 0 : this.selectedPanel.getWidth ());
});
$_V(c$, "isEnabled", 
function () {
return this.enabled;
});
$_V(c$, "isFocusable", 
function () {
return this.focusable;
});
$_V(c$, "isVisible", 
function () {
return this.visible;
});
$_V(c$, "setEnabled", 
function (b) {
this.enabled = b;
}, "~B");
$_V(c$, "setFocusable", 
function (b) {
this.focusable = b;
}, "~B");
});
