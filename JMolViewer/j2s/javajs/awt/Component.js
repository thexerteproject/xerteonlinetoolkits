Clazz.declarePackage ("javajs.awt");
Clazz.load (null, "javajs.awt.Component", ["JU.CU"], function () {
c$ = Clazz.decorateAsClass (function () {
this.visible = false;
this.enabled = true;
this.text = null;
this.name = null;
this.width = 0;
this.height = 0;
this.id = null;
this.parent = null;
this.mouseListener = null;
this.bgcolor = null;
this.minWidth = 30;
this.minHeight = 30;
this.renderWidth = 0;
this.renderHeight = 0;
Clazz.instantialize (this, arguments);
}, javajs.awt, "Component");
$_M(c$, "setParent", 
function (p) {
this.parent = p;
}, "~O");
Clazz.makeConstructor (c$, 
function (type) {
this.id = javajs.awt.Component.newID (type);
if (type == null) return;
{
SwingController.register(this, type);
}}, "~S");
c$.newID = $_M(c$, "newID", 
function (type) {
return type + ("" + Math.random ()).substring (3, 10);
}, "~S");
$_M(c$, "setBackground", 
function (color) {
this.bgcolor = color;
}, "javajs.api.GenericColor");
$_M(c$, "setText", 
function (text) {
this.text = text;
{
SwingController.setText(this);
}}, "~S");
$_M(c$, "setName", 
function (name) {
this.name = name;
}, "~S");
$_M(c$, "getName", 
function () {
return this.name;
});
$_M(c$, "getParent", 
function () {
return this.parent;
});
$_M(c$, "setPreferredSize", 
function (dimension) {
this.width = dimension.width;
this.height = dimension.height;
}, "javajs.awt.Dimension");
$_M(c$, "addMouseListener", 
function (listener) {
this.mouseListener = listener;
}, "~O");
$_M(c$, "getText", 
function () {
return this.text;
});
$_M(c$, "isEnabled", 
function () {
return this.enabled;
});
$_M(c$, "setEnabled", 
function (enabled) {
this.enabled = enabled;
{
SwingController.setEnabled(this);
}}, "~B");
$_M(c$, "isVisible", 
function () {
return this.visible;
});
$_M(c$, "setVisible", 
function (visible) {
this.visible = visible;
{
SwingController.setVisible(this);
}}, "~B");
$_M(c$, "getHeight", 
function () {
return this.height;
});
$_M(c$, "getWidth", 
function () {
return this.width;
});
$_M(c$, "setMinimumSize", 
function (d) {
this.minWidth = d.width;
this.minHeight = d.height;
}, "javajs.awt.Dimension");
$_M(c$, "getSubcomponentWidth", 
function () {
return this.width;
});
$_M(c$, "getSubcomponentHeight", 
function () {
return this.height;
});
$_M(c$, "getCSSstyle", 
function (defaultPercentW, defaultPercentH) {
var width = (this.renderWidth > 0 ? this.renderWidth : this.getSubcomponentWidth ());
var height = (this.renderHeight > 0 ? this.renderHeight : this.getSubcomponentHeight ());
return (width > 0 ? "width:" + width + "px;" : defaultPercentW > 0 ? "width:" + defaultPercentW + "%;" : "") + (height > 0 ? "height:" + height + "px;" : defaultPercentH > 0 ? "height:" + defaultPercentH + "%;" : "") + (this.bgcolor == null ? "" : "background-color:" + JU.CU.toCSSString (this.bgcolor) + ";");
}, "~N,~N");
$_M(c$, "repaint", 
function () {
});
});
