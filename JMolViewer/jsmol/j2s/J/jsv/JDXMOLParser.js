Clazz.declarePackage ("J.jsv");
Clazz.load (["J.adapter.smarter.JmolJDXMOLParser"], "J.jsv.JDXMOLParser", ["java.util.Hashtable", "JU.BS", "$.List", "$.PT", "$.SB", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.line = null;
this.lastModel = "";
this.thisModelID = null;
this.modelType = null;
this.baseModel = null;
this.vibScale = 0;
this.piUnitsX = null;
this.piUnitsY = null;
this.loader = null;
this.modelIdList = "";
this.peakIndex = null;
this.peakFilePath = null;
Clazz.instantialize (this, arguments);
}, J.jsv, "JDXMOLParser", null, J.adapter.smarter.JmolJDXMOLParser);
Clazz.makeConstructor (c$, 
function () {
});
$_V(c$, "set", 
function (loader, filePath, htParams) {
this.loader = loader;
this.peakFilePath = filePath;
this.peakIndex =  Clazz.newIntArray (1, 0);
if (htParams != null) {
htParams.remove ("modelNumber");
if (htParams.containsKey ("zipSet")) {
this.peakIndex = htParams.get ("peakIndex");
if (this.peakIndex == null) {
this.peakIndex =  Clazz.newIntArray (1, 0);
htParams.put ("peakIndex", this.peakIndex);
}if (!htParams.containsKey ("subFileName")) this.peakFilePath = JU.PT.split (filePath, "|")[0];
}}return this;
}, "J.adapter.smarter.JmolJDXMOLReader,~S,java.util.Map");
$_V(c$, "getAttribute", 
function (line, tag) {
var attr = JU.PT.getQuotedAttribute (line, tag);
return (attr == null ? "" : attr);
}, "~S,~S");
$_V(c$, "getRecord", 
function (key) {
if (this.line == null || this.line.indexOf (key) < 0) return null;
var s = this.line;
while (s.indexOf (">") < 0) s += " " + this.readLine ();

return this.line = s;
}, "~S");
$_V(c$, "readModels", 
function () {
if (!this.findRecord ("Models")) return false;
this.line = "";
this.thisModelID = "";
var isFirst = true;
while (true) {
this.line = this.loader.discardLinesUntilNonBlank ();
if (this.getRecord ("<ModelData") == null) break;
this.getModelData (isFirst);
isFirst = false;
}
return true;
});
$_V(c$, "readPeaks", 
function (isSignals, peakCount) {
try {
if (peakCount >= 0) this.peakIndex = [peakCount];
var offset = (isSignals ? 1 : 0);
var tag1 = (isSignals ? "Signals" : "Peaks");
var tag2 = (isSignals ? "<Signal" : "<PeakData");
if (!this.findRecord (tag1)) return 0;
var file = " file=" + JU.PT.esc (this.peakFilePath.$replace ('\\', '/'));
var model = JU.PT.getQuotedAttribute (this.line, "model");
model = " model=" + JU.PT.esc (model == null ? this.thisModelID : model);
var type = JU.PT.getQuotedAttribute (this.line, "type");
if ("HNMR".equals (type)) type = "1HNMR";
 else if ("CNMR".equals (type)) type = "13CNMR";
type = (type == null ? "" : " type=" + JU.PT.esc (type));
this.piUnitsX = JU.PT.getQuotedAttribute (this.line, "xLabel");
this.piUnitsY = JU.PT.getQuotedAttribute (this.line, "yLabel");
var htSets =  new java.util.Hashtable ();
var list =  new JU.List ();
while (this.readLine () != null && !(this.line = this.line.trim ()).startsWith ("</" + tag1)) {
if (this.line.startsWith (tag2)) {
this.getRecord (tag2);
J.util.Logger.info (this.line);
var title = JU.PT.getQuotedAttribute (this.line, "title");
if (title == null) {
title = (type === "1HNMR" ? "atom%S%: %ATOMS%; integration: %NATOMS%" : "");
title = " title=" + JU.PT.esc (title);
} else {
title = "";
}var stringInfo = "<PeakData " + file + " index=\"%INDEX%\"" + title + type + (JU.PT.getQuotedAttribute (this.line, "model") == null ? model : "") + " " + this.line.substring (tag2.length).trim ();
var atoms = JU.PT.getQuotedAttribute (stringInfo, "atoms");
if (atoms != null) stringInfo = JU.PT.rep (stringInfo, "atoms=\"" + atoms + "\"", "atoms=\"%ATOMS%\"");
var key = (Clazz.floatToInt (JU.PT.parseFloat (JU.PT.getQuotedAttribute (this.line, "xMin")) * 100)) + "_" + (Clazz.floatToInt (JU.PT.parseFloat (JU.PT.getQuotedAttribute (this.line, "xMax")) * 100));
var o = htSets.get (key);
if (o == null) {
o = [stringInfo, (atoms == null ? null :  new JU.BS ())];
htSets.put (key, o);
list.addLast (o);
}var bs = o[1];
if (bs != null) {
atoms = atoms.$replace (',', ' ');
bs.or (JU.BS.unescape ("({" + atoms + "})"));
}}}
var nH = 0;
var n = list.size ();
for (var i = 0; i < n; i++) {
var o = list.get (i);
var stringInfo = o[0];
stringInfo = JU.PT.rep (stringInfo, "%INDEX%", "" + (++this.peakIndex[0]));
var bs = o[1];
if (bs != null) {
var s = "";
for (var j = bs.nextSetBit (0); j >= 0; j = bs.nextSetBit (j + 1)) s += "," + (j + offset);

var na = bs.cardinality ();
nH += na;
stringInfo = JU.PT.rep (stringInfo, "%ATOMS%", s.substring (1));
stringInfo = JU.PT.rep (stringInfo, "%S%", (na == 1 ? "" : "s"));
stringInfo = JU.PT.rep (stringInfo, "%NATOMS%", "" + na);
}J.util.Logger.info ("adding PeakData " + stringInfo);
this.loader.addPeakData (stringInfo);
}
this.loader.setSpectrumPeaks (nH, this.piUnitsX, this.piUnitsY);
return n;
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return 0;
} else {
throw e;
}
}
}, "~B,~N");
$_M(c$, "getModelData", 
($fz = function (isFirst) {
this.lastModel = this.thisModelID;
this.thisModelID = this.getAttribute (this.line, "id");
var key = ";" + this.thisModelID + ";";
if (this.modelIdList.indexOf (key) >= 0) {
this.line = this.loader.discardLinesUntilContains ("</ModelData>");
return;
}this.modelIdList += key;
this.baseModel = this.getAttribute (this.line, "baseModel");
while (this.line.indexOf (">") < 0 && this.line.indexOf ("type") < 0) this.readLine ();

this.modelType = this.getAttribute (this.line, "type").toLowerCase ();
this.vibScale = JU.PT.parseFloat (this.getAttribute (this.line, "vibrationScale"));
if (this.modelType.equals ("xyzvib")) this.modelType = "xyz";
 else if (this.modelType.length == 0) this.modelType = null;
var sb =  new JU.SB ();
while (this.readLine () != null && !this.line.contains ("</ModelData>")) sb.append (this.line).appendC ('\n');

this.loader.processModelData (sb.toString (), this.thisModelID, this.modelType, this.baseModel, this.lastModel, this.vibScale, isFirst);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "findRecord", 
($fz = function (tag) {
if (this.line == null) this.readLine ();
if (this.line.indexOf ("<" + tag) < 0) this.line = this.loader.discardLinesUntilContains2 ("<" + tag, "##");
return (this.line.indexOf ("<" + tag) >= 0);
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "readLine", 
($fz = function () {
return this.line = this.loader.readLine ();
}, $fz.isPrivate = true, $fz));
$_V(c$, "setLine", 
function (s) {
this.line = s;
}, "~S");
});
