Clazz.declarePackage ("J.adapter.readers.more");
Clazz.load (["J.adapter.readers.molxyz.MolReader", "J.adapter.smarter.JmolJDXMOLReader", "JU.List"], "J.adapter.readers.more.JcampdxReader", ["java.lang.Float", "JU.BS", "J.adapter.smarter.SmarterJmolAdapter", "J.api.Interface", "J.io.JmolBinary", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.selectedModel = 0;
this.mpr = null;
this.peakData = null;
this.allTypes = null;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.more, "JcampdxReader", J.adapter.readers.molxyz.MolReader, J.adapter.smarter.JmolJDXMOLReader);
Clazz.prepareFields (c$, function () {
this.peakData =  new JU.List ();
});
$_V(c$, "initializeReader", 
function () {
this.viewer.setBooleanProperty ("_JSpecView".toLowerCase (), true);
if (this.isTrajectory) {
J.util.Logger.warn ("TRAJECTORY keyword ignored");
this.isTrajectory = false;
}if (this.reverseModels) {
J.util.Logger.warn ("REVERSE keyword ignored");
this.reverseModels = false;
}this.selectedModel = this.desiredModelNumber;
this.desiredModelNumber = -2147483648;
if (!this.checkFilterKey ("NOSYNC")) this.addJmolScript ("sync on");
});
$_V(c$, "checkLine", 
function () {
var i = this.line.indexOf ("=");
if (i < 0 || !this.line.startsWith ("##")) return true;
var label = this.line.substring (0, i).trim ();
var pt = "##$MODELS ##$PEAKS  ##$SIGNALS".indexOf (label);
if (pt < 0) return true;
if (this.mpr == null) this.mpr = (J.api.Interface.getOptionInterface ("jsv.JDXMOLParser")).set (this, this.filePath, this.htParams);
this.mpr.setLine (this.line.substring (i + 1));
switch (pt) {
case 0:
this.mpr.readModels ();
break;
case 10:
case 20:
this.mpr.readPeaks (pt == 20, -1);
break;
}
return true;
});
$_V(c$, "finalizeReader", 
function () {
if (this.mpr != null) this.processPeakData ();
this.finalizeReaderMR ();
});
$_V(c$, "processModelData", 
function (data, id, type, base, last, vibScale, isFirst) {
var model0 = this.atomSetCollection.currentAtomSetIndex;
var model = null;
while (true) {
var ret = J.adapter.smarter.SmarterJmolAdapter.staticGetAtomSetCollectionReader (this.filePath, type, J.io.JmolBinary.getBR (data), this.htParams);
if (Clazz.instanceOf (ret, String)) {
J.util.Logger.warn ("" + ret);
break;
}ret = J.adapter.smarter.SmarterJmolAdapter.staticGetAtomSetCollection (ret);
if (Clazz.instanceOf (ret, String)) {
J.util.Logger.warn ("" + ret);
break;
}model = ret;
var baseModel = base;
if (baseModel.length == 0) baseModel = last;
if (baseModel.length != 0) {
var ibase = this.findModelById (baseModel);
if (ibase >= 0) {
this.atomSetCollection.setAtomSetAuxiliaryInfoForSet ("jdxModelID", baseModel, ibase);
for (var i = model.atomSetCount; --i >= 0; ) model.setAtomSetAuxiliaryInfoForSet ("jdxBaseModel", baseModel, i);

if (model.bondCount == 0) this.setBonding (model, ibase);
}}if (!Float.isNaN (vibScale)) {
J.util.Logger.info ("jdx applying vibrationScale of " + vibScale + " to " + model.atomCount + " atoms");
var atoms = model.atoms;
for (var i = model.atomCount; --i >= 0; ) atoms[i].scaleVector (vibScale);

}J.util.Logger.info ("jdx model=" + id + " type=" + model.fileTypeName);
this.atomSetCollection.appendAtomSetCollection (-1, model);
break;
}
this.updateModelIDs (id, model0, isFirst);
}, "~S,~S,~S,~S,~S,~N,~B");
$_M(c$, "setBonding", 
($fz = function (a, ibase) {
var n0 = this.atomSetCollection.getAtomSetAtomCount (ibase);
var n = a.atomCount;
if (n % n0 != 0) {
J.util.Logger.warn ("atom count in secondary model (" + n + ") is not a multiple of " + n0 + " -- bonding ignored");
return;
}var bonds = this.atomSetCollection.bonds;
var b0 = 0;
for (var i = 0; i < ibase; i++) b0 += this.atomSetCollection.getAtomSetBondCount (i);

var b1 = b0 + this.atomSetCollection.getAtomSetBondCount (ibase);
var ii0 = this.atomSetCollection.getAtomSetAtomIndex (ibase);
var nModels = a.atomSetCount;
for (var j = 0; j < nModels; j++) {
var i0 = a.getAtomSetAtomIndex (j) - ii0;
if (a.getAtomSetAtomCount (j) != n0) {
J.util.Logger.warn ("atom set atom count in secondary model (" + a.getAtomSetAtomCount (j) + ") is not equal to " + n0 + " -- bonding ignored");
return;
}for (var i = b0; i < b1; i++) a.addNewBondWithOrder (bonds[i].atomIndex1 + i0, bonds[i].atomIndex2 + i0, bonds[i].order);

}
}, $fz.isPrivate = true, $fz), "J.adapter.smarter.AtomSetCollection,~N");
$_M(c$, "updateModelIDs", 
($fz = function (id, model0, isFirst) {
var n = this.atomSetCollection.atomSetCount;
if (isFirst && n == model0 + 2) {
this.atomSetCollection.setAtomSetAuxiliaryInfo ("modelID", id);
return;
}for (var pt = 0, i = model0; ++i < n; ) this.atomSetCollection.setAtomSetAuxiliaryInfoForSet ("modelID", id + "." + (++pt), i);

}, $fz.isPrivate = true, $fz), "~S,~N,~B");
$_V(c$, "addPeakData", 
function (info) {
this.peakData.addLast (info);
}, "~S");
$_M(c$, "processPeakData", 
($fz = function () {
var n = this.peakData.size ();
if (n == 0) return;
var bsModels =  new JU.BS ();
var havePeaks = (n > 0);
for (var p = 0; p < n; p++) {
this.line = this.peakData.get (p);
var type = this.mpr.getAttribute (this.line, "type");
var id = this.mpr.getAttribute (this.line, "model");
var i = this.findModelById (id);
if (i < 0) {
J.util.Logger.warn ("cannot find model " + id + " required for " + this.line);
continue;
}this.addType (i, type);
var title = type + ": " + this.mpr.getAttribute (this.line, "title");
var key = "jdxAtomSelect_" + this.mpr.getAttribute (this.line, "type");
bsModels.set (i);
var s;
if (this.mpr.getAttribute (this.line, "atoms").length != 0) {
this.processPeakSelectAtom (i, key, this.line);
s = type + ": ";
} else if (this.processPeakSelectModel (i, title)) {
s = "model: ";
} else {
s = "ignored: ";
}J.util.Logger.info (s + this.line);
}
n = this.atomSetCollection.atomSetCount;
for (var i = n; --i >= 0; ) {
var id = this.atomSetCollection.getAtomSetAuxiliaryInfoValue (i, "modelID");
if (havePeaks && !bsModels.get (i) && id.indexOf (".") >= 0) {
this.atomSetCollection.removeAtomSet (i);
n--;
}}
if (this.selectedModel == -2147483648) {
if (this.allTypes != null) this.appendLoadNote (this.allTypes);
} else {
if (this.selectedModel == 0) this.selectedModel = n - 1;
for (var i = this.atomSetCollection.atomSetCount; --i >= 0; ) if (i + 1 != this.selectedModel) this.atomSetCollection.removeAtomSet (i);

if (n > 0) this.appendLoadNote (this.atomSetCollection.getAtomSetAuxiliaryInfoValue (0, "name"));
}for (var i = this.atomSetCollection.atomSetCount; --i >= 0; ) this.atomSetCollection.setAtomSetNumber (i, i + 1);

this.atomSetCollection.centralize ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "findModelById", 
($fz = function (modelID) {
for (var i = this.atomSetCollection.atomSetCount; --i >= 0; ) {
var id = this.atomSetCollection.getAtomSetAuxiliaryInfoValue (i, "modelID");
if (modelID.equals (id)) return i;
}
return -1;
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "addType", 
($fz = function (imodel, type) {
var types = this.addType (this.atomSetCollection.getAtomSetAuxiliaryInfoValue (imodel, "spectrumTypes"), type);
if (types == null) return;
this.atomSetCollection.setAtomSetAuxiliaryInfoForSet ("spectrumTypes", types, imodel);
var s = this.addType (this.allTypes, type);
if (s != null) this.allTypes = s;
}, $fz.isPrivate = true, $fz), "~N,~S");
$_M(c$, "addType", 
($fz = function (types, type) {
if (types != null && types.contains (type)) return null;
if (types == null) types = "";
 else types += ",";
return types + type;
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "processPeakSelectAtom", 
($fz = function (i, key, data) {
var peaks = this.atomSetCollection.getAtomSetAuxiliaryInfoValue (i, key);
if (peaks == null) this.atomSetCollection.setAtomSetAuxiliaryInfoForSet (key, peaks =  new JU.List (), i);
peaks.addLast (data);
}, $fz.isPrivate = true, $fz), "~N,~S,~S");
$_M(c$, "processPeakSelectModel", 
($fz = function (i, title) {
if (this.atomSetCollection.getAtomSetAuxiliaryInfoValue (i, "jdxModelSelect") != null) return false;
this.atomSetCollection.setAtomSetAuxiliaryInfoForSet ("name", title, i);
this.atomSetCollection.setAtomSetAuxiliaryInfoForSet ("jdxModelSelect", this.line, i);
return true;
}, $fz.isPrivate = true, $fz), "~N,~S");
$_V(c$, "setSpectrumPeaks", 
function (nH, piUnitsX, piUnitsY) {
}, "~N,~S,~S");
});
