Clazz.declarePackage ("J.awtjs2d");
Clazz.load (["J.popup.JmolGenericPopup"], "J.awtjs2d.JmolJSPopup", ["J.i18n.GT", "J.popup.JSSwingPopupHelper", "$.MainPopupResourceBundle"], function () {
c$ = Clazz.declareType (J.awtjs2d, "JmolJSPopup", J.popup.JmolGenericPopup);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, J.awtjs2d.JmolJSPopup, []);
this.helper =  new J.popup.JSSwingPopupHelper (this);
});
$_V(c$, "jpiInitialize", 
function (viewer, menu) {
var doTranslate = J.i18n.GT.setDoTranslate (true);
var bundle =  new J.popup.MainPopupResourceBundle (this.strMenuStructure = menu, this.menuText);
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
$_V(c$, "menuSetCheckBoxOption", 
function (item, name, what) {
return null;
}, "javajs.api.SC,~S,~S");
$_V(c$, "getImageIcon", 
function (fileName) {
return null;
}, "~S");
$_V(c$, "menuFocusCallback", 
function (name, actionCommand, b) {
}, "~S,~S,~B");
});
