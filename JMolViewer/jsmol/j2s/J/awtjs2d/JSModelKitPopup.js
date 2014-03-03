Clazz.declarePackage ("J.awtjs2d");
Clazz.load (["J.popup.JmolGenericPopup"], "J.awtjs2d.JSModelKitPopup", ["J.i18n.GT", "J.modelkit.ModelKitPopupResourceBundle", "J.popup.JSSwingPopupHelper", "J.util.Elements"], function () {
c$ = Clazz.declareType (J.awtjs2d, "JSModelKitPopup", J.popup.JmolGenericPopup);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, J.awtjs2d.JSModelKitPopup, []);
this.helper =  new J.popup.JSSwingPopupHelper (this);
});
$_V(c$, "jpiInitialize", 
function (viewer, menu) {
this.updateMode = -1;
var doTranslate = J.i18n.GT.setDoTranslate (true);
var bundle =  new J.modelkit.ModelKitPopupResourceBundle (null, null);
this.initialize (viewer, bundle, bundle.getMenuName ());
J.i18n.GT.setDoTranslate (doTranslate);
}, "javajs.api.PlatformViewer,~S");
$_V(c$, "menuShowPopup", 
function (popup, x, y) {
try {
(popup).show (this.isTainted ? this.viewer.getApplet () : null, x, y);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
this.isTainted = false;
}, "javajs.api.SC,~N,~N");
$_V(c$, "menuClickCallback", 
function (source, script) {
if (script.equals ("clearQ")) {
for (var item, $item = this.htCheckbox.values ().iterator (); $item.hasNext () && ((item = $item.next ()) || true);) {
if (item.getActionCommand ().indexOf (":??") < 0) continue;
this.menuSetLabel (item, "??");
item.setActionCommand ("_??P!:");
item.setSelected (false);
}
this.viewer.evalStringQuiet ("set picking assignAtom_C");
return;
}this.processClickCallback (source, script);
}, "javajs.api.SC,~S");
$_V(c$, "menuSetCheckBoxOption", 
function (item, name, what) {
var element = J.i18n.GT._ ("Element?");
{
element = prompt(element, "");
}if (element == null || J.util.Elements.elementNumberFromSymbol (element, true) == 0) return null;
this.updateButton (item, element, "assignAtom_" + element + "P!:??");
return "set picking assignAtom_" + element;
}, "javajs.api.SC,~S,~S");
$_V(c$, "getImageIcon", 
function (fileName) {
return "J/modelkit/images/" + fileName;
}, "~S");
$_V(c$, "menuFocusCallback", 
function (name, actionCommand, b) {
}, "~S,~S,~B");
});
