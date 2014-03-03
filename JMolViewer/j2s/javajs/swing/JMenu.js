Clazz.declarePackage ("javajs.swing");
Clazz.load (["javajs.swing.JMenuItem"], "javajs.swing.JMenu", null, function () {
c$ = Clazz.declareType (javajs.swing, "JMenu", javajs.swing.JMenuItem);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, javajs.swing.JMenu, ["mnu", 4]);
});
$_M(c$, "getItemCount", 
function () {
return this.getComponentCount ();
});
$_M(c$, "getItem", 
function (i) {
return this.getComponent (i);
}, "~N");
$_V(c$, "getPopupMenu", 
function () {
return this;
});
$_V(c$, "toHTML", 
function () {
return this.getMenuHTML ();
});
});
