Clazz.declarePackage ("J.popup");
Clazz.load (["J.popup.PopupHelper"], "J.popup.JSSwingPopupHelper", ["javajs.swing.ButtonGroup", "$.JCheckBoxMenuItem", "$.JMenu", "$.JMenuItem", "$.JPopupMenu", "$.JRadioButtonMenuItem"], function () {
c$ = Clazz.decorateAsClass (function () {
this.popup = null;
this.buttonGroup = null;
Clazz.instantialize (this, arguments);
}, J.popup, "JSSwingPopupHelper", null, J.popup.PopupHelper);
Clazz.makeConstructor (c$, 
function (popup) {
this.popup = popup;
}, "javajs.api.GenericMenuInterface");
$_V(c$, "menuCreatePopup", 
function (name, applet) {
var j =  new javajs.swing.JPopupMenu (name);
j.setInvoker (applet);
return j;
}, "~S,~O");
$_V(c$, "getMenu", 
function (name) {
return  new javajs.swing.JMenu ();
}, "~S");
$_V(c$, "getMenuItem", 
function (name) {
return  new javajs.swing.JMenuItem (name);
}, "~S");
$_V(c$, "getRadio", 
function (name) {
return  new javajs.swing.JRadioButtonMenuItem ();
}, "~S");
$_V(c$, "getCheckBox", 
function (name) {
return  new javajs.swing.JCheckBoxMenuItem ();
}, "~S");
$_V(c$, "menuAddButtonGroup", 
function (item) {
if (item == null) {
this.buttonGroup = null;
return;
}if (this.buttonGroup == null) this.buttonGroup =  new javajs.swing.ButtonGroup ();
this.buttonGroup.add (item);
}, "javajs.api.SC");
$_V(c$, "getItemType", 
function (m) {
return (m).btnType;
}, "javajs.api.SC");
$_V(c$, "menuInsertSubMenu", 
function (menu, subMenu, index) {
(subMenu).setParent (menu);
}, "javajs.api.SC,javajs.api.SC,~N");
$_V(c$, "getSwingComponent", 
function (component) {
return component;
}, "~O");
$_V(c$, "menuClearListeners", 
function (menu) {
if (menu != null) (menu).disposeMenu ();
}, "javajs.api.SC");
$_M(c$, "itemStateChanged", 
function (e) {
this.popup.menuCheckBoxCallback (e.getSource ());
}, "javajs.awt.event.ItemEvent");
$_M(c$, "actionPerformed", 
function (e) {
this.popup.menuClickCallback (e.getSource (), e.getActionCommand ());
}, "javajs.awt.event.ActionEvent");
$_V(c$, "getButtonGroup", 
function () {
return this.buttonGroup;
});
});
