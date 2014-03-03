Clazz.declarePackage ("JSV.js2d");
Clazz.load (["JSV.api.JSVPanel"], "JSV.js2d.JsPanel", ["javajs.awt.Font", "JSV.common.JSViewer", "$.PanelData", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.apiPlatform = null;
this.pd = null;
this.mouse = null;
this.viewer = null;
this.name = null;
this.bgcolor = null;
Clazz.instantialize (this, arguments);
}, JSV.js2d, "JsPanel", null, JSV.api.JSVPanel);
$_V(c$, "finalize", 
function () {
J.util.Logger.info ("JSVPanel " + this + " finalized");
});
$_V(c$, "getApiPlatform", 
function () {
return this.apiPlatform;
});
$_V(c$, "getPanelData", 
function () {
return this.pd;
});
c$.getEmptyPanel = $_M(c$, "getEmptyPanel", 
function (viewer) {
var p =  new JSV.js2d.JsPanel (viewer, false);
p.pd = null;
return p;
}, "JSV.common.JSViewer");
c$.getPanelMany = $_M(c$, "getPanelMany", 
function (viewer, spectra, startIndex, endIndex) {
var p =  new JSV.js2d.JsPanel (viewer, true);
p.pd.initMany (spectra, startIndex, endIndex);
return p;
}, "JSV.common.JSViewer,JU.List,~N,~N");
Clazz.makeConstructor (c$, 
($fz = function (viewer, withPd) {
this.viewer = viewer;
this.pd = (withPd ?  new JSV.common.PanelData (this, viewer) : null);
this.apiPlatform = viewer.apiPlatform;
this.mouse = this.apiPlatform.getMouseManager (0, this);
}, $fz.isPrivate = true, $fz), "JSV.common.JSViewer,~B");
$_V(c$, "getTitle", 
function () {
return this.pd.getTitle ();
});
$_V(c$, "dispose", 
function () {
if (this.pd != null) this.pd.dispose ();
this.pd = null;
this.mouse.dispose ();
this.mouse = null;
});
$_V(c$, "setTitle", 
function (title) {
this.pd.title = title;
this.name = title;
}, "~S");
$_M(c$, "setColorOrFont", 
function (ds, st) {
this.pd.setColorOrFont (ds, st);
}, "JSV.common.ColorParameters,JSV.common.ScriptToken");
$_V(c$, "setBackgroundColor", 
function (color) {
this.bgcolor = color;
}, "javajs.api.GenericColor");
$_V(c$, "getInput", 
function (message, title, sval) {
var ret = null;
{
ret = prompt(message, sval);
}this.getFocusNow (true);
return ret;
}, "~S,~S,~S");
$_V(c$, "showMessage", 
function (msg, title) {
J.util.Logger.info (msg);
{
this.viewer.applet._showStatus(msg, title);
}this.getFocusNow (true);
}, "~S,~S");
$_V(c$, "getFocusNow", 
function (asThread) {
if (this.pd != null) this.pd.dialogsToFront (null);
}, "~B");
$_V(c$, "getFontFaceID", 
function (name) {
return javajs.awt.Font.getFontFaceID ("SansSerif");
}, "~S");
$_V(c$, "doRepaint", 
function (andTaintAll) {
if (this.pd == null) return;
this.pd.taintedAll = new Boolean (this.pd.taintedAll | andTaintAll).valueOf ();
if (!this.pd.isPrinting) this.viewer.requestRepaint ();
}, "~B");
$_M(c$, "paintComponent", 
function (context) {
var contextFront = null;
var contextRear = null;
{
contextFront = context.canvas.frontLayer.getContext("2d");
contextRear = context;
}if (this.viewer == null) return;
if (this.pd == null) {
if (this.bgcolor == null) this.bgcolor = this.viewer.g2d.getColor1 (-1);
this.viewer.g2d.fillBackground (context, this.bgcolor);
this.viewer.g2d.fillBackground (contextRear, this.bgcolor);
this.viewer.g2d.fillBackground (contextFront, this.bgcolor);
return;
}if (this.pd.graphSets == null || this.pd.isPrinting) return;
this.pd.g2d = this.pd.g2d0;
this.pd.drawGraph (context, contextFront, contextRear, this.getWidth (), this.getHeight (), false);
this.viewer.repaintDone ();
}, "~O");
$_V(c$, "printPanel", 
function (pl, os, title) {
pl.title = title;
pl.date = this.apiPlatform.getDateFormat (true);
this.pd.setPrint (pl, "Helvetica");
try {
(JSV.common.JSViewer.getInterface ("JSV.common.PDFWriter")).createPdfDocument (this, pl, os);
} catch (ex) {
if (Clazz.exceptionOf (ex, Exception)) {
this.showMessage (ex.toString (), "creating PDF");
} else {
throw ex;
}
} finally {
this.pd.setPrint (null, null);
}
}, "JSV.common.PrintLayout,java.io.OutputStream,~S");
$_V(c$, "saveImage", 
function (type, file) {
return null;
}, "~S,javajs.api.GenericFileInterface");
$_V(c$, "hasFocus", 
function () {
return false;
});
$_V(c$, "repaint", 
function () {
});
$_V(c$, "setToolTipText", 
function (s) {
}, "~S");
$_V(c$, "getHeight", 
function () {
return this.viewer.getHeight ();
});
$_V(c$, "getWidth", 
function () {
return this.viewer.getWidth ();
});
$_V(c$, "isEnabled", 
function () {
return false;
});
$_V(c$, "isFocusable", 
function () {
return false;
});
$_V(c$, "isVisible", 
function () {
return false;
});
$_V(c$, "setEnabled", 
function (b) {
}, "~B");
$_V(c$, "setFocusable", 
function (b) {
}, "~B");
$_V(c$, "toString", 
function () {
return (this.pd == null ? "<closed>" : "" + this.pd.getSpectrumAt (0));
});
$_V(c$, "processMouseEvent", 
function (id, x, y, modifiers, time) {
return this.mouse != null && this.mouse.processEvent (id, x, y, modifiers, time);
}, "~N,~N,~N,~N,~N");
$_V(c$, "processTwoPointGesture", 
function (touches) {
if (this.mouse != null) this.mouse.processTwoPointGesture (touches);
}, "~A");
$_V(c$, "showMenu", 
function (x, y) {
this.viewer.showMenu (x, y);
}, "~N,~N");
});
