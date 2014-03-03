Clazz.declarePackage ("javajs.swing");
Clazz.load (["javajs.swing.AbstractButton"], "javajs.swing.JPopupMenu", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.tainted = true;
Clazz.instantialize (this, arguments);
}, javajs.swing, "JPopupMenu", javajs.swing.AbstractButton);
Clazz.makeConstructor (c$, 
function (name) {
Clazz.superConstructor (this, javajs.swing.JPopupMenu, ["mnu"]);
this.name = name;
}, "~S");
$_M(c$, "setInvoker", 
function (applet) {
this.applet = applet;
{
SwingController.setMenu(this);
}}, "~O");
$_M(c$, "show", 
function (applet, x, y) {
{
if (applet != null)
this.tainted = true;
SwingController.showMenu(this, x, y);
}}, "javajs.awt.Component,~N,~N");
$_M(c$, "disposeMenu", 
function () {
{
SwingController.disposeMenu(this);
}});
$_V(c$, "toHTML", 
function () {
return this.getMenuHTML ();
});
{
{
SwingController.setDraggable(javajs.swing.JPopupMenu);
}}});
