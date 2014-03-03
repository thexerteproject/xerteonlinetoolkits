Clazz.declarePackage ("J.i18n");
Clazz.load (null, "J.i18n.Resource", ["java.util.Hashtable", "JU.PT", "J.api.Interface", "J.i18n.GT", "J.util.Logger", "J.viewer.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.resource = null;
this.resourceMap = null;
Clazz.instantialize (this, arguments);
}, J.i18n, "Resource");
Clazz.makeConstructor (c$, 
($fz = function (resource, className) {
if (className == null) this.resourceMap = resource;
 else this.resource = resource;
}, $fz.isPrivate = true, $fz), "~O,~S");
c$.getResource = $_M(c$, "getResource", 
function (className, name) {
var poData = null;
if (J.i18n.GT.viewer.isApplet ()) {
var fname = J.viewer.Viewer.appletIdiomaBase + "/" + name + ".po";
J.util.Logger.info ("Loading language resource " + fname);
poData = J.i18n.GT.viewer.getFileAsString (fname, false);
return J.i18n.Resource.getResourceFromPO (poData);
}className += name + ".Messages_" + name;
var o = J.api.Interface.getInterface (className);
return (o == null ? null :  new J.i18n.Resource (o, className));
}, "~S,~S");
$_M(c$, "getString", 
function (string) {
try {
return (this.resource == null ? this.resourceMap.get (string) : this.resource.getString (string));
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return null;
} else {
throw e;
}
}
}, "~S");
c$.getLanguage = $_M(c$, "getLanguage", 
function () {
var language = null;
{
language = Jmol.featureDetection.getDefaultLanguage().replace(/-/g,'_');
}return language;
});
c$.getResourceFromPO = $_M(c$, "getResourceFromPO", 
function (data) {
if (data == null || data.length == 0) return null;
var map =  new java.util.Hashtable ();
try {
var lines = JU.PT.split (data, "\n");
var mode = 0;
var msgstr = "";
var msgid = "";
for (var i = 0; i < lines.length; i++) {
var line = lines[i];
if (line.length <= 2) {
if (mode == 2 && msgstr.length != 0 && msgid.length != 0) map.put (msgid, msgstr);
mode = 0;
} else if (line.indexOf ("msgid") == 0) {
mode = 1;
msgid = J.i18n.Resource.fix (line);
} else if (line.indexOf ("msgstr") == 0) {
mode = 2;
msgstr = J.i18n.Resource.fix (line);
} else if (mode == 1) {
msgid += J.i18n.Resource.fix (line);
} else if (mode == 2) {
msgstr += J.i18n.Resource.fix (line);
}}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
J.util.Logger.info (map.size () + " translations loaded");
return (map.size () == 0 ? null :  new J.i18n.Resource (map, null));
}, "~S");
c$.fix = $_M(c$, "fix", 
function (line) {
return JU.PT.rep (line.substring (line.indexOf ("\"") + 1, line.lastIndexOf ("\"")), "\\n", "\n");
}, "~S");
});
