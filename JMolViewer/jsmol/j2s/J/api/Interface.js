Clazz.declarePackage ("J.api");
Clazz.load (null, "J.api.Interface", ["J.util.Logger"], function () {
c$ = Clazz.declareType (J.api, "Interface");
c$.getInterface = $_M(c$, "getInterface", 
function (name) {
try {
var x = Class.forName (name);
return (x == null ? null : x.newInstance ());
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
J.util.Logger.error ("Interface.java Error creating instance for " + name + ": \n" + e);
return null;
} else {
throw e;
}
}
}, "~S");
c$.getOptionInterface = $_M(c$, "getOptionInterface", 
function (name) {
return J.api.Interface.getInterface ("J." + name);
}, "~S");
c$.getSymmetry = $_M(c$, "getSymmetry", 
function () {
return J.api.Interface.getInterface ("J.symmetry.Symmetry");
});
});
