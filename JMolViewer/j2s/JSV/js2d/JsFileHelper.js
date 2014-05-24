Clazz.declarePackage ("JSV.js2d");
Clazz.load (["JSV.api.JSVFileHelper"], "JSV.js2d.JsFileHelper", ["JU.PT", "JSV.js2d.JsFile"], function () {
c$ = Clazz.decorateAsClass (function () {
this.viewer = null;
Clazz.instantialize (this, arguments);
}, JSV.js2d, "JsFileHelper", null, JSV.api.JSVFileHelper);
Clazz.makeConstructor (c$, 
function () {
});
$_V(c$, "set", 
function (viewer) {
this.viewer = viewer;
return this;
}, "JSV.common.JSViewer");
$_V(c$, "getFile", 
function (fileName, panelOrFrame, isSave) {
var f = null;
fileName = JU.PT.rep (fileName, "=", "_");
{
f = prompt("Enter a file name:", fileName);
}return (f == null ? null :  new JSV.js2d.JsFile (f));
}, "~S,~O,~B");
$_V(c$, "setDirLastExported", 
function (name) {
return name;
}, "~S");
$_V(c$, "setFileChooser", 
function (pdf) {
}, "JSV.common.ExportType");
$_V(c$, "showFileOpenDialog", 
function (panelOrFrame, userData) {
var applet = this.viewer.applet;
{
Jmol._loadFileAsynchronously(this, applet, "", userData);
}return null;
}, "~O,~A");
$_M(c$, "setData", 
function (fileName, data, userInfo) {
if (fileName == null) return;
if (data == null) {
this.viewer.selectedPanel.showMessage (fileName, "File Open Error");
return;
}var script = (userInfo == null ? null : "");
var isAppend = false;
{
isAppend = userInfo[0];
script = userInfo[1];
}this.viewer.si.siOpenDataOrFile ( String.instantialize (data), fileName, null, null, -1, -1, isAppend, null, null);
if (script != null) this.viewer.runScript (script);
}, "~S,~O,~A");
$_V(c$, "getUrlFromDialog", 
function (info, msg) {
{
return prompt(info, msg);
}}, "~S,~S");
});
