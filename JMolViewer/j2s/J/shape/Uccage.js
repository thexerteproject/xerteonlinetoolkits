Clazz.declarePackage ("J.shape");
Clazz.load (["J.shape.FontLineShape"], "J.shape.Uccage", null, function () {
c$ = Clazz.declareType (J.shape, "Uccage", J.shape.FontLineShape);
$_V(c$, "setProperty", 
function (propertyName, value, bs) {
this.setPropFLS (propertyName, value);
}, "~S,~O,JU.BS");
$_M(c$, "getShapeState", 
function () {
if (!this.modelSet.haveUnitCells) return "";
var s = Clazz.superCall (this, J.shape.Uccage, "getShapeState", []);
var iAtom = this.viewer.getCurrentAtom ();
if (iAtom >= 0) s += "  unitcell ({" + iAtom + "});\n";
var uc = this.viewer.getCurrentUnitCell ();
if (uc != null) s += uc.getUnitCellState ();
return s;
});
$_M(c$, "initShape", 
function () {
Clazz.superCall (this, J.shape.Uccage, "initShape", []);
this.font3d = this.gdata.getFont3D (14);
this.myType = "unitcell";
});
});
