Clazz.declarePackage ("J.adapter.smarter");
Clazz.load (["java.util.Hashtable"], "J.adapter.smarter.AtomSetCollection", ["java.lang.Boolean", "$.Float", "java.util.Collections", "$.Properties", "JU.AU", "$.BS", "$.List", "$.P3", "$.V3", "J.adapter.smarter.Atom", "$.Bond", "$.SmarterJmolAdapter", "J.api.Interface", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.reader = null;
this.bsAtoms = null;
this.fileTypeName = null;
this.collectionName = null;
this.atomSetCollectionAuxiliaryInfo = null;
this.atoms = null;
this.atomCount = 0;
this.bonds = null;
this.bondCount = 0;
this.structures = null;
this.structureCount = 0;
this.atomSetCount = 0;
this.currentAtomSetIndex = -1;
this.atomSetNumbers = null;
this.atomSetAtomIndexes = null;
this.atomSetAtomCounts = null;
this.atomSetBondCounts = null;
this.atomSetAuxiliaryInfo = null;
this.errorMessage = null;
this.coordinatesAreFractional = false;
this.isTrajectory = false;
this.trajectoryStepCount = 0;
this.trajectorySteps = null;
this.vibrationSteps = null;
this.trajectoryNames = null;
this.doFixPeriodic = false;
this.allowMultiple = false;
this.readerList = null;
this.bsStructuredModels = null;
this.haveAnisou = false;
this.baseSymmetryAtomCount = 0;
this.checkLatticeOnly = false;
this.xtalSymmetry = null;
this.bondIndex0 = 0;
this.checkSpecial = true;
this.atomSymbolicMap = null;
this.haveMappedSerials = false;
this.haveUnitCell = false;
Clazz.instantialize (this, arguments);
}, J.adapter.smarter, "AtomSetCollection");
Clazz.prepareFields (c$, function () {
this.atomSetCollectionAuxiliaryInfo =  new java.util.Hashtable ();
this.atoms =  new Array (256);
this.bonds =  new Array (256);
this.structures =  new Array (16);
this.atomSetNumbers =  Clazz.newIntArray (16, 0);
this.atomSetAtomIndexes =  Clazz.newIntArray (16, 0);
this.atomSetAtomCounts =  Clazz.newIntArray (16, 0);
this.atomSetBondCounts =  Clazz.newIntArray (16, 0);
this.atomSetAuxiliaryInfo =  new Array (16);
this.atomSymbolicMap =  new java.util.Hashtable ();
});
$_M(c$, "setCollectionName", 
function (collectionName) {
if (collectionName == null || (collectionName = collectionName.trim ()).length == 0) return;
this.collectionName = collectionName;
}, "~S");
$_M(c$, "clearGlobalBoolean", 
function (globalIndex) {
this.atomSetCollectionAuxiliaryInfo.remove (J.adapter.smarter.AtomSetCollection.globalBooleans[globalIndex]);
}, "~N");
$_M(c$, "setGlobalBoolean", 
function (globalIndex) {
this.setAtomSetCollectionAuxiliaryInfo (J.adapter.smarter.AtomSetCollection.globalBooleans[globalIndex], Boolean.TRUE);
}, "~N");
$_M(c$, "getGlobalBoolean", 
function (globalIndex) {
return (this.getAtomSetCollectionAuxiliaryInfo (J.adapter.smarter.AtomSetCollection.globalBooleans[globalIndex]) === Boolean.TRUE);
}, "~N");
Clazz.makeConstructor (c$, 
function (fileTypeName, reader, array, list) {
this.fileTypeName = fileTypeName;
this.reader = reader;
this.allowMultiple = (reader == null || reader.desiredVibrationNumber < 0);
var p =  new java.util.Properties ();
p.put ("PATH_KEY", ".PATH");
p.put ("PATH_SEPARATOR", J.adapter.smarter.SmarterJmolAdapter.PATH_SEPARATOR);
this.setAtomSetCollectionAuxiliaryInfo ("properties", p);
if (array != null) {
var n = 0;
this.readerList =  new JU.List ();
for (var i = 0; i < array.length; i++) if (array[i].atomCount > 0 || array[i].reader != null && array[i].reader.mustFinalizeModelSet) this.appendAtomSetCollection (n++, array[i]);

if (n > 1) this.setAtomSetCollectionAuxiliaryInfo ("isMultiFile", Boolean.TRUE);
} else if (list != null) {
this.setAtomSetCollectionAuxiliaryInfo ("isMultiFile", Boolean.TRUE);
this.appendAtomSetCollectionList (list);
}}, "~S,J.adapter.smarter.AtomSetCollectionReader,~A,JU.List");
$_M(c$, "appendAtomSetCollectionList", 
($fz = function (list) {
var n = list.size ();
if (n == 0) {
this.errorMessage = "No file found!";
return;
}for (var i = 0; i < n; i++) {
var o = list.get (i);
if (Clazz.instanceOf (o, JU.List)) this.appendAtomSetCollectionList (o);
 else this.appendAtomSetCollection (i, o);
}
}, $fz.isPrivate = true, $fz), "JU.List");
$_M(c$, "setTrajectory", 
function () {
if (!this.isTrajectory) {
this.trajectorySteps =  new JU.List ();
}this.isTrajectory = true;
this.addTrajectoryStep ();
});
$_M(c$, "appendAtomSetCollection", 
function (collectionIndex, collection) {
if (collection.reader != null && collection.reader.mustFinalizeModelSet) this.readerList.addLast (collection.reader);
var existingAtomsCount = this.atomCount;
this.setAtomSetCollectionAuxiliaryInfo ("loadState", collection.getAtomSetCollectionAuxiliaryInfo ("loadState"));
if (collection.bsAtoms != null) {
if (this.bsAtoms == null) this.bsAtoms =  new JU.BS ();
for (var i = collection.bsAtoms.nextSetBit (0); i >= 0; i = collection.bsAtoms.nextSetBit (i + 1)) this.bsAtoms.set (existingAtomsCount + i);

}var clonedAtoms = 0;
var atomSetCount0 = this.atomSetCount;
for (var atomSetNum = 0; atomSetNum < collection.atomSetCount; atomSetNum++) {
this.newAtomSet ();
var info = this.atomSetAuxiliaryInfo[this.currentAtomSetIndex] = collection.atomSetAuxiliaryInfo[atomSetNum];
var atomInfo = info.get ("PDB_CONECT_firstAtom_count_max");
if (atomInfo != null) atomInfo[0] += existingAtomsCount;
this.setAtomSetAuxiliaryInfo ("title", collection.collectionName);
this.setAtomSetName (collection.getAtomSetName (atomSetNum));
for (var atomNum = 0; atomNum < collection.atomSetAtomCounts[atomSetNum]; atomNum++) {
try {
if (this.bsAtoms != null) this.bsAtoms.set (this.atomCount);
this.newCloneAtom (collection.atoms[clonedAtoms]);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
this.errorMessage = "appendAtomCollection error: " + e;
} else {
throw e;
}
}
clonedAtoms++;
}
this.atomSetNumbers[this.currentAtomSetIndex] = (collectionIndex < 0 ? this.currentAtomSetIndex + 1 : ((collectionIndex + 1) * 1000000) + collection.atomSetNumbers[atomSetNum]);
}
for (var bondNum = 0; bondNum < collection.bondCount; bondNum++) {
var bond = collection.bonds[bondNum];
this.addNewBondWithOrder (bond.atomIndex1 + existingAtomsCount, bond.atomIndex2 + existingAtomsCount, bond.order);
}
for (var i = J.adapter.smarter.AtomSetCollection.globalBooleans.length; --i >= 0; ) if (collection.getGlobalBoolean (i)) this.setGlobalBoolean (i);

for (var i = 0; i < collection.structureCount; i++) {
var s = collection.structures[i];
this.addStructure (s);
s.modelStartEnd[0] += atomSetCount0;
s.modelStartEnd[1] += atomSetCount0;
}
}, "~N,J.adapter.smarter.AtomSetCollection");
$_M(c$, "setNoAutoBond", 
function () {
this.setAtomSetCollectionAuxiliaryInfo ("noAutoBond", Boolean.TRUE);
});
$_M(c$, "freeze", 
function (reverseModels) {
if (this.atomSetCount == 1 && this.collectionName == null) this.collectionName = this.getAtomSetAuxiliaryInfoValue (0, "name");
if (reverseModels) this.reverseAtomSets ();
if (this.trajectoryStepCount > 1) this.finalizeTrajectory ();
this.getList (true);
this.getList (false);
for (var i = 0; i < this.atomSetCount; i++) {
this.setAtomSetAuxiliaryInfoForSet ("initialAtomCount", Integer.$valueOf (this.atomSetAtomCounts[i]), i);
this.setAtomSetAuxiliaryInfoForSet ("initialBondCount", Integer.$valueOf (this.atomSetBondCounts[i]), i);
}
}, "~B");
$_M(c$, "reverseAtomSets", 
($fz = function () {
this.reverseArray (this.atomSetAtomIndexes);
this.reverseArray (this.atomSetNumbers);
this.reverseArray (this.atomSetAtomCounts);
this.reverseArray (this.atomSetBondCounts);
J.adapter.smarter.AtomSetCollection.reverseList (this.trajectorySteps);
J.adapter.smarter.AtomSetCollection.reverseList (this.trajectoryNames);
J.adapter.smarter.AtomSetCollection.reverseList (this.vibrationSteps);
this.reverseObject (this.atomSetAuxiliaryInfo);
for (var i = 0; i < this.atomCount; i++) this.atoms[i].atomSetIndex = this.atomSetCount - 1 - this.atoms[i].atomSetIndex;

for (var i = 0; i < this.structureCount; i++) {
var m = this.structures[i].modelStartEnd[0];
if (m >= 0) {
this.structures[i].modelStartEnd[0] = this.atomSetCount - 1 - this.structures[i].modelStartEnd[1];
this.structures[i].modelStartEnd[1] = this.atomSetCount - 1 - m;
}}
for (var i = 0; i < this.bondCount; i++) this.bonds[i].atomSetIndex = this.atomSetCount - 1 - this.atoms[this.bonds[i].atomIndex1].atomSetIndex;

this.reverseSets (this.bonds, this.bondCount);
var lists = JU.AU.createArrayOfArrayList (this.atomSetCount);
for (var i = 0; i < this.atomSetCount; i++) lists[i] =  new JU.List ();

for (var i = 0; i < this.atomCount; i++) lists[this.atoms[i].atomSetIndex].addLast (this.atoms[i]);

var newIndex =  Clazz.newIntArray (this.atomCount, 0);
var n = this.atomCount;
for (var i = this.atomSetCount; --i >= 0; ) for (var j = lists[i].size (); --j >= 0; ) {
var a = this.atoms[--n] = lists[i].get (j);
newIndex[a.index] = n;
a.index = n;
}

for (var i = 0; i < this.bondCount; i++) {
this.bonds[i].atomIndex1 = newIndex[this.bonds[i].atomIndex1];
this.bonds[i].atomIndex2 = newIndex[this.bonds[i].atomIndex2];
}
for (var i = 0; i < this.atomSetCount; i++) {
var conect = this.getAtomSetAuxiliaryInfoValue (i, "PDB_CONECT_firstAtom_count_max");
if (conect == null) continue;
conect[0] = newIndex[conect[0]];
conect[1] = this.atomSetAtomCounts[i];
}
}, $fz.isPrivate = true, $fz));
$_M(c$, "reverseSets", 
($fz = function (o, n) {
var lists = JU.AU.createArrayOfArrayList (this.atomSetCount);
for (var i = 0; i < this.atomSetCount; i++) lists[i] =  new JU.List ();

for (var i = 0; i < n; i++) {
var index = o[i].atomSetIndex;
if (index < 0) return;
lists[o[i].atomSetIndex].addLast (o[i]);
}
for (var i = this.atomSetCount; --i >= 0; ) for (var j = lists[i].size (); --j >= 0; ) o[--n] = lists[i].get (j);


}, $fz.isPrivate = true, $fz), "~A,~N");
$_M(c$, "reverseObject", 
($fz = function (o) {
var n = this.atomSetCount;
for (var i = Clazz.doubleToInt (n / 2); --i >= 0; ) JU.AU.swap (o, i, n - 1 - i);

}, $fz.isPrivate = true, $fz), "~A");
c$.reverseList = $_M(c$, "reverseList", 
($fz = function (list) {
if (list == null) return;
java.util.Collections.reverse (list);
}, $fz.isPrivate = true, $fz), "JU.List");
$_M(c$, "reverseArray", 
($fz = function (a) {
var n = this.atomSetCount;
for (var i = Clazz.doubleToInt (n / 2); --i >= 0; ) JU.AU.swapInt (a, i, n - 1 - i);

}, $fz.isPrivate = true, $fz), "~A");
$_M(c$, "getList", 
($fz = function (isAltLoc) {
var i;
for (i = this.atomCount; --i >= 0; ) if (this.atoms[i] != null && (isAltLoc ? this.atoms[i].altLoc : this.atoms[i].insertionCode) != '\0') break;

if (i < 0) return;
var lists =  new Array (this.atomSetCount);
for (i = 0; i < this.atomSetCount; i++) lists[i] = "";

var pt;
for (i = 0; i < this.atomCount; i++) {
if (this.atoms[i] == null) continue;
var id = (isAltLoc ? this.atoms[i].altLoc : this.atoms[i].insertionCode);
if (id != '\0' && lists[pt = this.atoms[i].atomSetIndex].indexOf (id) < 0) lists[pt] += id;
}
var type = (isAltLoc ? "altLocs" : "insertionCodes");
for (i = 0; i < this.atomSetCount; i++) if (lists[i].length > 0) this.setAtomSetAuxiliaryInfoForSet (type, lists[i], i);

}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "finish", 
function () {
if (this.reader != null) this.reader.finalizeModelSet ();
 else if (this.readerList != null) for (var i = 0; i < this.readerList.size (); i++) this.readerList.get (i).finalizeModelSet ();

this.atoms = null;
this.atomSetAtomCounts =  Clazz.newIntArray (16, 0);
this.atomSetAuxiliaryInfo =  new Array (16);
this.atomSetCollectionAuxiliaryInfo =  new java.util.Hashtable ();
this.atomSetCount = 0;
this.atomSetNumbers =  Clazz.newIntArray (16, 0);
this.atomSymbolicMap =  new java.util.Hashtable ();
this.bonds = null;
this.currentAtomSetIndex = -1;
this.readerList = null;
this.xtalSymmetry = null;
this.structures =  new Array (16);
this.structureCount = 0;
this.trajectorySteps = null;
this.vibrationSteps = null;
});
$_M(c$, "discardPreviousAtoms", 
function () {
for (var i = this.atomCount; --i >= 0; ) this.atoms[i] = null;

this.atomCount = 0;
this.clearSymbolicMap ();
this.atomSetCount = 0;
this.currentAtomSetIndex = -1;
for (var i = this.atomSetAuxiliaryInfo.length; --i >= 0; ) {
this.atomSetAtomCounts[i] = 0;
this.atomSetBondCounts[i] = 0;
this.atomSetAuxiliaryInfo[i] = null;
}
});
$_M(c$, "removeAtomSet", 
function (imodel) {
if (this.bsAtoms == null) {
this.bsAtoms =  new JU.BS ();
this.bsAtoms.setBits (0, this.atomCount);
}var i0 = this.atomSetAtomIndexes[imodel];
var nAtoms = this.atomSetAtomCounts[imodel];
var i1 = i0 + nAtoms;
this.bsAtoms.clearBits (i0, i1);
for (var i = i1; i < this.atomCount; i++) this.atoms[i].atomSetIndex--;

for (var i = imodel + 1; i < this.atomSetCount; i++) {
this.atomSetAuxiliaryInfo[i - 1] = this.atomSetAuxiliaryInfo[i];
this.atomSetAtomIndexes[i - 1] = this.atomSetAtomIndexes[i];
this.atomSetBondCounts[i - 1] = this.atomSetBondCounts[i];
this.atomSetAtomCounts[i - 1] = this.atomSetAtomCounts[i];
this.atomSetNumbers[i - 1] = this.atomSetNumbers[i];
}
var n = 0;
for (var i = 0; i < this.structureCount; i++) {
var s = this.structures[i];
if (s.modelStartEnd[0] == imodel && s.modelStartEnd[1] == imodel) {
this.structures[i] = null;
n++;
}}
if (n > 0) {
var ss =  new Array (this.structureCount - n);
for (var i = 0, pt = 0; i < this.structureCount; i++) if (this.structures[i] != null) ss[pt++] = this.structures[i];

this.structures = ss;
}for (var i = 0; i < this.bondCount; i++) this.bonds[i].atomSetIndex = this.atoms[this.bonds[i].atomIndex1].atomSetIndex;

this.atomSetAuxiliaryInfo[--this.atomSetCount] = null;
}, "~N");
$_M(c$, "removeCurrentAtomSet", 
function () {
if (this.currentAtomSetIndex < 0) return;
this.currentAtomSetIndex--;
this.atomSetCount--;
});
$_M(c$, "getHydrogenAtomCount", 
function () {
var n = 0;
for (var i = 0; i < this.atomCount; i++) if (this.atoms[i].elementNumber == 1 || this.atoms[i].elementSymbol.equals ("H")) n++;

return n;
});
$_M(c$, "newCloneAtom", 
function (atom) {
var clone = atom.getClone ();
this.addAtom (clone);
return clone;
}, "J.adapter.smarter.Atom");
$_M(c$, "cloneFirstAtomSet", 
function (atomCount) {
if (!this.allowMultiple) return;
this.newAtomSet ();
if (atomCount == 0) atomCount = this.atomSetAtomCounts[0];
for (var i = 0; i < atomCount; ++i) this.newCloneAtom (this.atoms[i]);

}, "~N");
$_M(c$, "cloneFirstAtomSetWithBonds", 
function (nBonds) {
if (!this.allowMultiple) return;
this.cloneFirstAtomSet (0);
var firstCount = this.atomSetAtomCounts[0];
for (var bondNum = 0; bondNum < nBonds; bondNum++) {
var bond = this.bonds[this.bondCount - nBonds];
this.addNewBondWithOrder (bond.atomIndex1 + firstCount, bond.atomIndex2 + firstCount, bond.order);
}
}, "~N");
$_M(c$, "cloneLastAtomSet", 
function () {
this.cloneLastAtomSetFromPoints (0, null);
});
$_M(c$, "cloneLastAtomSetFromPoints", 
function (atomCount, pts) {
if (!this.allowMultiple) return;
var count = (atomCount > 0 ? atomCount : this.getLastAtomSetAtomCount ());
var atomIndex = this.getLastAtomSetAtomIndex ();
this.newAtomSet ();
for (var i = 0; i < count; ++i) {
var atom = this.newCloneAtom (this.atoms[atomIndex++]);
if (pts != null) atom.setT (pts[i]);
}
}, "~N,~A");
$_M(c$, "getFirstAtomSetAtomCount", 
function () {
return this.atomSetAtomCounts[0];
});
$_M(c$, "getLastAtomSetAtomCount", 
function () {
return this.atomSetAtomCounts[this.currentAtomSetIndex];
});
$_M(c$, "getLastAtomSetAtomIndex", 
function () {
return this.atomCount - this.atomSetAtomCounts[this.currentAtomSetIndex];
});
$_M(c$, "addNewAtom", 
function () {
return this.addAtom ( new J.adapter.smarter.Atom ());
});
$_M(c$, "addAtom", 
function (atom) {
if (this.atomCount == this.atoms.length) {
if (this.atomCount > 200000) this.atoms = JU.AU.ensureLength (this.atoms, this.atomCount + 50000);
 else this.atoms = JU.AU.doubleLength (this.atoms);
}if (this.atomSetCount == 0) this.newAtomSet ();
atom.index = this.atomCount;
this.atoms[this.atomCount++] = atom;
atom.atomSetIndex = this.currentAtomSetIndex;
atom.atomSite = this.atomSetAtomCounts[this.currentAtomSetIndex]++;
return atom;
}, "J.adapter.smarter.Atom");
$_M(c$, "addAtomWithMappedName", 
function (atom) {
var atomName = this.addAtom (atom).atomName;
if (atomName != null) this.atomSymbolicMap.put (atomName, Integer.$valueOf (atom.index));
}, "J.adapter.smarter.Atom");
$_M(c$, "addAtomWithMappedSerialNumber", 
function (atom) {
var atomSerial = this.addAtom (atom).atomSerial;
if (atomSerial != -2147483648) this.atomSymbolicMap.put (Integer.$valueOf (atomSerial), Integer.$valueOf (atom.index));
this.haveMappedSerials = true;
}, "J.adapter.smarter.Atom");
$_M(c$, "addNewBondWithOrder", 
function (atomIndex1, atomIndex2, order) {
if (atomIndex1 < 0 || atomIndex1 >= this.atomCount || atomIndex2 < 0 || atomIndex2 >= this.atomCount) return null;
var bond =  new J.adapter.smarter.Bond (atomIndex1, atomIndex2, order);
this.addBond (bond);
return bond;
}, "~N,~N,~N");
$_M(c$, "addNewBondFromNames", 
function (atomName1, atomName2, order) {
return this.addNewBondWithOrder (this.getAtomIndexFromName (atomName1), this.getAtomIndexFromName (atomName2), order);
}, "~S,~S,~N");
$_M(c$, "addNewBondWithMappedSerialNumbers", 
function (atomSerial1, atomSerial2, order) {
return this.addNewBondWithOrder (this.getAtomIndexFromSerial (atomSerial1), this.getAtomIndexFromSerial (atomSerial2), order);
}, "~N,~N,~N");
$_M(c$, "addBond", 
function (bond) {
if (this.trajectoryStepCount > 0) return;
if (bond.atomIndex1 < 0 || bond.atomIndex2 < 0 || bond.order < 0 || this.atoms[bond.atomIndex1].atomSetIndex != this.atoms[bond.atomIndex2].atomSetIndex) {
if (J.util.Logger.debugging) {
J.util.Logger.debug (">>>>>>BAD BOND:" + bond.atomIndex1 + "-" + bond.atomIndex2 + " order=" + bond.order);
}return;
}if (this.bondCount == this.bonds.length) this.bonds = JU.AU.arrayCopyObject (this.bonds, this.bondCount + 1024);
this.bonds[this.bondCount++] = bond;
this.atomSetBondCounts[this.currentAtomSetIndex]++;
}, "J.adapter.smarter.Bond");
$_M(c$, "finalizeStructures", 
function () {
if (this.structureCount == 0) return;
this.bsStructuredModels =  new JU.BS ();
var map =  new java.util.Hashtable ();
for (var i = 0; i < this.structureCount; i++) {
var s = this.structures[i];
if (s.modelStartEnd[0] == -1) {
s.modelStartEnd[0] = 0;
s.modelStartEnd[1] = this.atomSetCount - 1;
}this.bsStructuredModels.setBits (s.modelStartEnd[0], s.modelStartEnd[1] + 1);
if (s.strandCount == 0) continue;
var key = s.structureID + " " + s.modelStartEnd[0];
var v = map.get (key);
var count = (v == null ? 0 : v.intValue ()) + 1;
map.put (key, Integer.$valueOf (count));
}
for (var i = 0; i < this.structureCount; i++) {
var s = this.structures[i];
if (s.strandCount == 1) s.strandCount = map.get (s.structureID + " " + s.modelStartEnd[0]).intValue ();
}
});
$_M(c$, "addStructure", 
function (structure) {
if (this.structureCount == this.structures.length) this.structures = JU.AU.arrayCopyObject (this.structures, this.structureCount + 32);
this.structures[this.structureCount++] = structure;
}, "J.adapter.smarter.Structure");
$_M(c$, "addVibrationVectorWithSymmetry", 
function (iatom, vx, vy, vz, withSymmetry) {
if (!withSymmetry) {
this.addVibrationVector (iatom, vx, vy, vz);
return;
}var atomSite = this.atoms[iatom].atomSite;
var atomSetIndex = this.atoms[iatom].atomSetIndex;
for (var i = iatom; i < this.atomCount && this.atoms[i].atomSetIndex == atomSetIndex; i++) {
if (this.atoms[i].atomSite == atomSite) this.addVibrationVector (i, vx, vy, vz);
}
}, "~N,~N,~N,~N,~B");
$_M(c$, "addVibrationVector", 
function (iatom, x, y, z) {
if (!this.allowMultiple) iatom = iatom % this.atomCount;
this.atoms[iatom].vib = JU.V3.new3 (x, y, z);
}, "~N,~N,~N,~N");
$_M(c$, "setAtomSetSpaceGroupName", 
function (spaceGroupName) {
this.setAtomSetAuxiliaryInfo ("spaceGroup", spaceGroupName + "");
}, "~S");
$_M(c$, "setCoordinatesAreFractional", 
function (tf) {
this.coordinatesAreFractional = tf;
this.setAtomSetAuxiliaryInfo ("coordinatesAreFractional", Boolean.$valueOf (tf));
if (tf) this.setGlobalBoolean (0);
}, "~B");
$_M(c$, "setAnisoBorU", 
function (atom, data, type) {
this.haveAnisou = true;
atom.anisoBorU = data;
data[6] = type;
}, "J.adapter.smarter.Atom,~A,~N");
$_M(c$, "getAnisoBorU", 
function (atom) {
return atom.anisoBorU;
}, "J.adapter.smarter.Atom");
$_M(c$, "getXSymmetry", 
function () {
if (this.xtalSymmetry == null) this.xtalSymmetry = (J.api.Interface.getOptionInterface ("adapter.smarter.XtalSymmetry")).set (this);
return this.xtalSymmetry;
});
$_M(c$, "getSymmetry", 
function () {
return this.getXSymmetry ().getSymmetry ();
});
$_M(c$, "setSymmetry", 
function (symmetry) {
return (symmetry == null ? null : this.getXSymmetry ().setSymmetry (symmetry));
}, "J.api.SymmetryInterface");
$_M(c$, "setTensors", 
function () {
if (this.haveAnisou) this.getXSymmetry ().setTensors ();
});
$_M(c$, "setCheckSpecial", 
function (TF) {
this.checkSpecial = TF;
}, "~B");
$_M(c$, "clearSymbolicMap", 
function () {
this.atomSymbolicMap.clear ();
this.haveMappedSerials = false;
});
$_M(c$, "createAtomSerialMap", 
function () {
if (this.haveMappedSerials || this.currentAtomSetIndex < 0) return;
for (var i = this.getLastAtomSetAtomCount (); i < this.atomCount; i++) {
var atomSerial = this.atoms[i].atomSerial;
if (atomSerial != -2147483648) this.atomSymbolicMap.put (Integer.$valueOf (atomSerial), Integer.$valueOf (i));
}
this.haveMappedSerials = true;
});
$_M(c$, "getAtomIndexFromName", 
function (atomName) {
return this.getMapIndex (atomName);
}, "~S");
$_M(c$, "getAtomIndexFromSerial", 
function (serialNumber) {
return this.getMapIndex (Integer.$valueOf (serialNumber));
}, "~N");
$_M(c$, "getMapIndex", 
($fz = function (nameOrNum) {
var value = this.atomSymbolicMap.get (nameOrNum);
return (value == null ? -1 : value.intValue ());
}, $fz.isPrivate = true, $fz), "~O");
$_M(c$, "setAtomSetCollectionAuxiliaryInfo", 
function (key, value) {
if (value == null) this.atomSetCollectionAuxiliaryInfo.remove (key);
 else this.atomSetCollectionAuxiliaryInfo.put (key, value);
}, "~S,~O");
$_M(c$, "setAtomSetCollectionPartialCharges", 
function (auxKey) {
if (!this.atomSetCollectionAuxiliaryInfo.containsKey (auxKey)) {
return false;
}var atomData = this.atomSetCollectionAuxiliaryInfo.get (auxKey);
for (var i = atomData.size (); --i >= 0; ) this.atoms[i].partialCharge = atomData.get (i).floatValue ();

J.util.Logger.info ("Setting partial charges type " + auxKey);
return true;
}, "~S");
$_M(c$, "mapPartialCharge", 
function (atomName, charge) {
this.atoms[this.getAtomIndexFromName (atomName)].partialCharge = charge;
}, "~S,~N");
$_M(c$, "getAtomSetCollectionAuxiliaryInfo", 
function (key) {
return this.atomSetCollectionAuxiliaryInfo.get (key);
}, "~S");
$_M(c$, "addTrajectoryStep", 
($fz = function () {
var trajectoryStep =  new Array (this.atomCount);
var haveVibrations = (this.atomCount > 0 && this.atoms[0].vib != null && !Float.isNaN (this.atoms[0].vib.z));
var vibrationStep = (haveVibrations ?  new Array (this.atomCount) : null);
var prevSteps = (this.trajectoryStepCount == 0 ? null : this.trajectorySteps.get (this.trajectoryStepCount - 1));
for (var i = 0; i < this.atomCount; i++) {
var pt = JU.P3.newP (this.atoms[i]);
if (this.doFixPeriodic && prevSteps != null) pt = J.adapter.smarter.AtomSetCollection.fixPeriodic (pt, prevSteps[i]);
trajectoryStep[i] = pt;
if (haveVibrations) vibrationStep[i] = this.atoms[i].vib;
}
if (haveVibrations) {
if (this.vibrationSteps == null) {
this.vibrationSteps =  new JU.List ();
for (var i = 0; i < this.trajectoryStepCount; i++) this.vibrationSteps.addLast (null);

}this.vibrationSteps.addLast (vibrationStep);
}this.trajectorySteps.addLast (trajectoryStep);
this.trajectoryStepCount++;
}, $fz.isPrivate = true, $fz));
c$.fixPeriodic = $_M(c$, "fixPeriodic", 
($fz = function (pt, pt0) {
pt.x = J.adapter.smarter.AtomSetCollection.fixPoint (pt.x, pt0.x);
pt.y = J.adapter.smarter.AtomSetCollection.fixPoint (pt.y, pt0.y);
pt.z = J.adapter.smarter.AtomSetCollection.fixPoint (pt.z, pt0.z);
return pt;
}, $fz.isPrivate = true, $fz), "JU.P3,JU.P3");
c$.fixPoint = $_M(c$, "fixPoint", 
($fz = function (x, x0) {
while (x - x0 > 0.9) {
x -= 1;
}
while (x - x0 < -0.9) {
x += 1;
}
return x;
}, $fz.isPrivate = true, $fz), "~N,~N");
$_M(c$, "finalizeTrajectoryAs", 
function (trajectorySteps, vibrationSteps) {
this.trajectorySteps = trajectorySteps;
this.vibrationSteps = vibrationSteps;
this.trajectoryStepCount = trajectorySteps.size ();
this.finalizeTrajectory ();
}, "JU.List,JU.List");
$_M(c$, "finalizeTrajectory", 
($fz = function () {
if (this.trajectoryStepCount == 0) return;
var trajectory = this.trajectorySteps.get (0);
var vibrations = (this.vibrationSteps == null ? null : this.vibrationSteps.get (0));
var v =  new JU.V3 ();
if (this.vibrationSteps != null && vibrations != null && vibrations.length < this.atomCount || trajectory.length < this.atomCount) {
this.errorMessage = "File cannot be loaded as a trajectory";
return;
}for (var i = 0; i < this.atomCount; i++) {
if (this.vibrationSteps != null) this.atoms[i].vib = (vibrations == null ? v : vibrations[i]);
if (trajectory[i] != null) this.atoms[i].setT (trajectory[i]);
}
this.setAtomSetCollectionAuxiliaryInfo ("trajectorySteps", this.trajectorySteps);
if (this.vibrationSteps != null) this.setAtomSetCollectionAuxiliaryInfo ("vibrationSteps", this.vibrationSteps);
}, $fz.isPrivate = true, $fz));
$_M(c$, "newAtomSet", 
function () {
this.newAtomSetClear (true);
});
$_M(c$, "newAtomSetClear", 
function (doClearMap) {
if (!this.allowMultiple && this.currentAtomSetIndex >= 0) this.discardPreviousAtoms ();
this.bondIndex0 = this.bondCount;
if (this.isTrajectory) {
this.discardPreviousAtoms ();
}this.currentAtomSetIndex = this.atomSetCount++;
if (this.atomSetCount > this.atomSetNumbers.length) {
this.atomSetAtomIndexes = JU.AU.doubleLengthI (this.atomSetAtomIndexes);
this.atomSetAtomCounts = JU.AU.doubleLengthI (this.atomSetAtomCounts);
this.atomSetBondCounts = JU.AU.doubleLengthI (this.atomSetBondCounts);
this.atomSetAuxiliaryInfo = JU.AU.doubleLength (this.atomSetAuxiliaryInfo);
}this.atomSetAtomIndexes[this.currentAtomSetIndex] = this.atomCount;
if (this.atomSetCount + this.trajectoryStepCount > this.atomSetNumbers.length) {
this.atomSetNumbers = JU.AU.doubleLengthI (this.atomSetNumbers);
}if (this.isTrajectory) {
this.atomSetNumbers[this.currentAtomSetIndex + this.trajectoryStepCount] = this.atomSetCount + this.trajectoryStepCount;
} else {
this.atomSetNumbers[this.currentAtomSetIndex] = this.atomSetCount;
}if (doClearMap) this.atomSymbolicMap.clear ();
this.setAtomSetAuxiliaryInfo ("title", this.collectionName);
}, "~B");
$_M(c$, "getAtomSetAtomIndex", 
function (i) {
return this.atomSetAtomIndexes[i];
}, "~N");
$_M(c$, "getAtomSetAtomCount", 
function (i) {
return this.atomSetAtomCounts[i];
}, "~N");
$_M(c$, "getAtomSetBondCount", 
function (i) {
return this.atomSetBondCounts[i];
}, "~N");
$_M(c$, "setAtomSetName", 
function (atomSetName) {
if (this.isTrajectory) {
this.setTrajectoryName (atomSetName);
return;
}this.setAtomSetAuxiliaryInfoForSet ("name", atomSetName, this.currentAtomSetIndex);
if (!this.allowMultiple) this.setCollectionName (atomSetName);
}, "~S");
$_M(c$, "setTrajectoryName", 
($fz = function (name) {
if (this.trajectoryStepCount == 0) return;
if (this.trajectoryNames == null) {
this.trajectoryNames =  new JU.List ();
}for (var i = this.trajectoryNames.size (); i < this.trajectoryStepCount; i++) this.trajectoryNames.addLast (null);

this.trajectoryNames.set (this.trajectoryStepCount - 1, name);
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "setAtomSetNames", 
function (atomSetName, n, namedSets) {
for (var i = this.currentAtomSetIndex; --n >= 0 && i >= 0; --i) if (namedSets == null || !namedSets.get (i)) this.setAtomSetAuxiliaryInfoForSet ("name", atomSetName, i);

}, "~S,~N,JU.BS");
$_M(c$, "setCurrentAtomSetNumber", 
function (atomSetNumber) {
this.setAtomSetNumber (this.currentAtomSetIndex + (this.isTrajectory ? this.trajectoryStepCount : 0), atomSetNumber);
}, "~N");
$_M(c$, "setAtomSetNumber", 
function (index, atomSetNumber) {
this.atomSetNumbers[index] = atomSetNumber;
}, "~N,~N");
$_M(c$, "setAtomSetModelProperty", 
function (key, value) {
this.setAtomSetModelPropertyForSet (key, value, this.currentAtomSetIndex);
}, "~S,~S");
$_M(c$, "setAtomSetModelPropertyForSet", 
function (key, value, atomSetIndex) {
var p = this.getAtomSetAuxiliaryInfoValue (atomSetIndex, "modelProperties");
if (p == null) this.setAtomSetAuxiliaryInfoForSet ("modelProperties", p =  new java.util.Properties (), atomSetIndex);
p.put (key, value);
}, "~S,~S,~N");
$_M(c$, "setAtomSetAtomProperty", 
function (key, data, atomSetIndex) {
if (!data.endsWith ("\n")) data += "\n";
if (atomSetIndex < 0) atomSetIndex = this.currentAtomSetIndex;
var p = this.getAtomSetAuxiliaryInfoValue (atomSetIndex, "atomProperties");
if (p == null) this.setAtomSetAuxiliaryInfoForSet ("atomProperties", p =  new java.util.Hashtable (), atomSetIndex);
p.put (key, data);
}, "~S,~S,~N");
$_M(c$, "setAtomSetPartialCharges", 
function (auxKey) {
if (!this.atomSetAuxiliaryInfo[this.currentAtomSetIndex].containsKey (auxKey)) {
return false;
}var atomData = this.getAtomSetAuxiliaryInfoValue (this.currentAtomSetIndex, auxKey);
for (var i = atomData.size (); --i >= 0; ) {
this.atoms[i].partialCharge = atomData.get (i).floatValue ();
}
return true;
}, "~S");
$_M(c$, "getAtomSetAuxiliaryInfoValue", 
function (index, key) {
return this.atomSetAuxiliaryInfo[index >= 0 ? index : this.currentAtomSetIndex].get (key);
}, "~N,~S");
$_M(c$, "setAtomSetAuxiliaryInfo", 
function (key, value) {
this.setAtomSetAuxiliaryInfoForSet (key, value, this.currentAtomSetIndex);
}, "~S,~O");
$_M(c$, "setAtomSetAuxiliaryInfoForSet", 
function (key, value, atomSetIndex) {
if (atomSetIndex < 0) return;
if (this.atomSetAuxiliaryInfo[atomSetIndex] == null) this.atomSetAuxiliaryInfo[atomSetIndex] =  new java.util.Hashtable ();
if (value == null) this.atomSetAuxiliaryInfo[atomSetIndex].remove (key);
 else this.atomSetAuxiliaryInfo[atomSetIndex].put (key, value);
}, "~S,~O,~N");
$_M(c$, "setAtomSetPropertyForSets", 
function (key, value, n) {
for (var idx = this.currentAtomSetIndex; --n >= 0 && idx >= 0; --idx) this.setAtomSetModelPropertyForSet (key, value, idx);

}, "~S,~S,~N");
$_M(c$, "cloneLastAtomSetProperties", 
function () {
this.cloneAtomSetProperties (this.currentAtomSetIndex - 1);
});
$_M(c$, "cloneAtomSetProperties", 
function (index) {
var p = this.getAtomSetAuxiliaryInfoValue (index, "modelProperties");
if (p != null) this.setAtomSetAuxiliaryInfoForSet ("modelProperties", p.clone (), this.currentAtomSetIndex);
}, "~N");
$_M(c$, "getAtomSetNumber", 
function (atomSetIndex) {
return this.atomSetNumbers[atomSetIndex >= this.atomSetCount ? 0 : atomSetIndex];
}, "~N");
$_M(c$, "getAtomSetName", 
function (atomSetIndex) {
if (this.trajectoryNames != null && atomSetIndex < this.trajectoryNames.size ()) return this.trajectoryNames.get (atomSetIndex);
if (atomSetIndex >= this.atomSetCount) atomSetIndex = this.atomSetCount - 1;
return this.getAtomSetAuxiliaryInfoValue (atomSetIndex, "name");
}, "~N");
$_M(c$, "getAtomSetAuxiliaryInfo", 
function (atomSetIndex) {
return this.atomSetAuxiliaryInfo[atomSetIndex >= this.atomSetCount ? this.atomSetCount - 1 : atomSetIndex];
}, "~N");
$_M(c$, "setAtomNames", 
function (atomIdNames) {
if (atomIdNames == null) return null;
var s;
for (var i = 0; i < this.atomCount; i++) if ((s = atomIdNames.getProperty (this.atoms[i].atomName)) != null) this.atoms[i].atomName = s;

return null;
}, "java.util.Properties");
$_M(c$, "setAtomSetEnergy", 
function (energyString, value) {
if (this.currentAtomSetIndex < 0) return;
J.util.Logger.info ("Energy for model " + (this.currentAtomSetIndex + 1) + " = " + energyString);
this.setAtomSetAuxiliaryInfo ("EnergyString", energyString);
this.setAtomSetAuxiliaryInfo ("Energy", Float.$valueOf (value));
this.setAtomSetModelProperty ("Energy", "" + value);
}, "~S,~N");
$_M(c$, "setAtomSetFrequency", 
function (pathKey, label, freq, units) {
freq += " " + (units == null ? "cm^-1" : units);
var name = (label == null ? "" : label + " ") + freq;
this.setAtomSetName (name);
this.setAtomSetModelProperty ("Frequency", freq);
if (label != null) this.setAtomSetModelProperty ("FrequencyLabel", label);
this.setAtomSetModelProperty (".PATH", (pathKey == null ? "" : pathKey + J.adapter.smarter.SmarterJmolAdapter.PATH_SEPARATOR + "Frequencies") + "Frequencies");
return name;
}, "~S,~S,~S,~S");
$_M(c$, "toCartesian", 
function (symmetry) {
for (var i = this.getLastAtomSetAtomIndex (); i < this.atomCount; i++) symmetry.toCartesian (this.atoms[i], true);

}, "J.api.SymmetryInterface");
$_M(c$, "getBondList", 
function () {
var info =  new Array (this.bondCount);
for (var i = 0; i < this.bondCount; i++) {
info[i] = [this.atoms[this.bonds[i].atomIndex1].atomName, this.atoms[this.bonds[i].atomIndex2].atomName, "" + this.bonds[i].order];
}
return info;
});
$_M(c$, "centralize", 
function () {
var pt =  new JU.P3 ();
for (var i = 0; i < this.atomSetCount; i++) {
var n = this.atomSetAtomCounts[i];
var atom0 = this.atomSetAtomIndexes[i];
pt.set (0, 0, 0);
for (var j = atom0 + n; --j >= atom0; ) pt.add (this.atoms[j]);

pt.scale (1 / n);
for (var j = atom0 + n; --j >= atom0; ) this.atoms[j].sub (pt);

}
});
$_M(c$, "mergeTrajectories", 
function (a) {
if (!this.isTrajectory || !a.isTrajectory || this.vibrationSteps != null) return;
for (var i = 0; i < a.trajectoryStepCount; i++) this.trajectorySteps.add (this.trajectoryStepCount++, a.trajectorySteps.get (i));

this.setAtomSetCollectionAuxiliaryInfo ("trajectorySteps", this.trajectorySteps);
}, "J.adapter.smarter.AtomSetCollection");
Clazz.defineStatics (c$,
"globalBooleans", ["someModelsHaveFractionalCoordinates", "someModelsHaveSymmetry", "someModelsHaveUnitcells", "someModelsHaveCONECT", "isPDB"],
"GLOBAL_FRACTCOORD", 0,
"GLOBAL_SYMMETRY", 1,
"GLOBAL_UNITCELLS", 2,
"GLOBAL_CONECT", 3,
"GLOBAL_ISPDB", 4,
"notionalUnitcellTags", ["a", "b", "c", "alpha", "beta", "gamma"]);
});
