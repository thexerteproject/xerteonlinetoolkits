Clazz.declarePackage ("J.adapter.readers.xtal");
Clazz.load (["J.adapter.smarter.AtomSetCollectionReader"], "J.adapter.readers.xtal.AbinitReader", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.znucl = null;
this.inputOnly = false;
this.nAtom = 0;
this.nType = 0;
this.typeArray = null;
this.cellLattice = null;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.xtal, "AbinitReader", J.adapter.smarter.AtomSetCollectionReader);
$_V(c$, "initializeReader", 
function () {
this.setSpaceGroupName ("P1");
this.doApplySymmetry = true;
this.setFractionalCoordinates (false);
this.inputOnly = this.checkFilterKey ("INPUT");
});
$_V(c$, "checkLine", 
function () {
if (this.line.contains ("natom")) {
this.readNoatom ();
} else if (this.line.contains ("ntypat") || this.line.contains ("ntype")) {
this.readNotypes ();
} else if (this.line.contains ("typat") || this.line.contains ("type")) {
this.readTypesequence ();
} else if (this.line.contains ("Pseudopotential")) {
this.readAtomSpecies ();
} else if (this.line.contains ("Symmetries :")) {
this.readSpaceGroup ();
} else if (this.line.contains ("Real(R)+Recip(G)")) {
this.readIntiallattice ();
if (this.inputOnly) this.continuing = false;
} else if (this.line.contains ("xcart")) {
this.readAtoms ();
}return true;
});
$_M(c$, "readNoatom", 
($fz = function () {
var tokens = J.adapter.smarter.AtomSetCollectionReader.getTokensStr (this.line);
if (tokens.length <= 2) this.nAtom = this.parseIntStr (tokens[1]);
}, $fz.isPrivate = true, $fz));
$_M(c$, "readNotypes", 
($fz = function () {
var tokens = J.adapter.smarter.AtomSetCollectionReader.getTokensStr (this.line);
if (tokens.length <= 2) this.nType = this.parseIntStr (tokens[1]);
}, $fz.isPrivate = true, $fz));
$_M(c$, "readTypesequence", 
($fz = function () {
this.fillFloatArray (this.line.substring (12), 0, this.typeArray =  Clazz.newFloatArray (this.nAtom, 0));
}, $fz.isPrivate = true, $fz));
$_M(c$, "readAtomSpecies", 
($fz = function () {
this.znucl =  Clazz.newFloatArray (this.nType, 0);
for (var i = 0; i < this.nType; i++) {
this.discardLinesUntilContains ("zion");
var tokens = this.getTokens ();
this.znucl[i] = this.parseFloatStr (tokens[tokens[0] === "-" ? 1 : 0]);
}
}, $fz.isPrivate = true, $fz));
$_M(c$, "readSpaceGroup", 
($fz = function () {
}, $fz.isPrivate = true, $fz));
$_M(c$, "readIntiallattice", 
($fz = function () {
var f = 0;
this.cellLattice =  Clazz.newFloatArray (9, 0);
for (var i = 0; i < 9; i++) {
if (i % 3 == 0) {
this.line = this.readLine ().substring (6);
f = this.parseFloatStr (this.line);
}this.cellLattice[i] = f * 0.5291772;
f = this.parseFloat ();
}
this.applySymmetry ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "applySymmetry", 
($fz = function () {
if (this.cellLattice == null) return;
this.setSpaceGroupName ("P1");
for (var i = 0; i < 3; i++) this.addPrimitiveLatticeVector (i, this.cellLattice, i * 3);

var atoms = this.atomSetCollection.atoms;
var i0 = this.atomSetCollection.getAtomSetAtomIndex (this.atomSetCollection.currentAtomSetIndex);
if (!this.iHaveFractionalCoordinates) for (var i = this.atomSetCollection.atomCount; --i >= i0; ) this.setAtomCoord (atoms[i]);

this.applySymmetryAndSetTrajectory ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "readAtoms", 
($fz = function () {
this.atomSetCollection.newAtomSet ();
this.iHaveFractionalCoordinates = false;
var i0 = this.atomSetCollection.atomCount;
this.line = this.line.substring (12);
while (this.line != null && !this.line.contains ("x")) {
var atom = this.atomSetCollection.addNewAtom ();
this.setAtomCoordScaled (atom, J.adapter.smarter.AtomSetCollectionReader.getTokensStr (this.line), 0, 0.5291772);
this.readLine ();
}
this.discardLinesUntilContains ("z");
if (this.znucl == null) this.fillFloatArray (this.line.substring (12), 0, this.znucl =  Clazz.newFloatArray (this.nType, 0));
var atoms = this.atomSetCollection.atoms;
for (var i = 0; i < this.nAtom; i++) atoms[i + i0].elementNumber = Clazz.floatToShort (this.znucl[Clazz.floatToInt (this.typeArray[i]) - 1]);

this.applySymmetry ();
}, $fz.isPrivate = true, $fz));
});
