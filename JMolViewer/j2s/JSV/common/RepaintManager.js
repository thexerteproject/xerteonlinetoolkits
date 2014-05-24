Clazz.declarePackage ("JSV.common");
c$ = Clazz.decorateAsClass (function () {
this.repaintPending = false;
this.viewer = null;
Clazz.instantialize (this, arguments);
}, JSV.common, "RepaintManager");
Clazz.makeConstructor (c$, 
function (viewer) {
this.viewer = viewer;
}, "JSV.common.JSViewer");
$_M(c$, "refresh", 
function () {
if (this.repaintPending) {
return false;
}this.repaintPending = true;
this.viewer.pd ().taintedAll = true;
{
if (typeof Jmol != "undefined" && Jmol._repaint && this.viewer.applet)
Jmol._repaint(this.viewer.applet, false);
this.repaintDone();
}return true;
});
$_M(c$, "repaintDone", 
function () {
this.repaintPending = false;
this.notify ();
});
