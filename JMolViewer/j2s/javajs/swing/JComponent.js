Clazz.declarePackage ("javajs.swing");
Clazz.load (["javajs.awt.Container"], "javajs.swing.JComponent", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.autoScrolls = false;
this.actionCommand = null;
this.actionListener = null;
Clazz.instantialize (this, arguments);
}, javajs.swing, "JComponent", javajs.awt.Container);
$_M(c$, "setAutoscrolls", 
function (b) {
this.autoScrolls = b;
}, "~B");
$_M(c$, "addActionListener", 
function (listener) {
this.actionListener = listener;
}, "~O");
$_M(c$, "getActionCommand", 
function () {
return this.actionCommand;
});
$_M(c$, "setActionCommand", 
function (actionCommand) {
this.actionCommand = actionCommand;
}, "~S");
});
