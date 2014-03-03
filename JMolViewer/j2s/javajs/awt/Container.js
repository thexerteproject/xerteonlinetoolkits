Clazz.declarePackage ("javajs.awt");
Clazz.load (["javajs.awt.Component"], "javajs.awt.Container", ["JU.List"], function () {
c$ = Clazz.decorateAsClass (function () {
this.list = null;
this.cList = null;
Clazz.instantialize (this, arguments);
}, javajs.awt, "Container", javajs.awt.Component);
$_M(c$, "getComponent", 
function (i) {
return this.list.get (i);
}, "~N");
$_M(c$, "getComponentCount", 
function () {
return (this.list == null ? 0 : this.list.size ());
});
$_M(c$, "getComponents", 
function () {
if (this.cList == null) {
if (this.list == null) return  new Array (0);
this.cList = this.list.toArray ();
}return this.cList;
});
$_M(c$, "add", 
function (component) {
return this.addComponent (component);
}, "javajs.awt.Component");
$_M(c$, "addComponent", 
function (component) {
if (this.list == null) this.list =  new JU.List ();
this.list.addLast (component);
this.cList = null;
component.parent = this;
return component;
}, "javajs.awt.Component");
$_M(c$, "insertComponent", 
function (component, index) {
if (this.list == null) return this.addComponent (component);
this.list.add (index, component);
this.cList = null;
component.parent = this;
return component;
}, "javajs.awt.Component,~N");
$_M(c$, "remove", 
function (i) {
var c = this.list.remove (i);
c.parent = null;
this.cList = null;
}, "~N");
$_M(c$, "removeAll", 
function () {
if (this.list != null) {
for (var i = this.list.size (); --i >= 0; ) this.list.get (i).parent = null;

this.list.clear ();
}this.cList = null;
});
$_M(c$, "getSubcomponentWidth", 
function () {
return (this.list != null && this.list.size () == 1 ? this.list.get (0).getSubcomponentWidth () : 0);
});
$_M(c$, "getSubcomponentHeight", 
function () {
return (this.list != null && this.list.size () == 1 ? this.list.get (0).getSubcomponentHeight () : 0);
});
});
