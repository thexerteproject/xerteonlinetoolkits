Clazz.declarePackage ("JU");
c$ = Clazz.decorateAsClass (function () {
this.a = null;
this.m = 0;
this.n = 0;
if (!Clazz.isClassDefined ("JU.Matrix.LUDecomp")) {
JU.Matrix.$Matrix$LUDecomp$ ();
}
Clazz.instantialize (this, arguments);
}, JU, "Matrix", null, Cloneable);
Clazz.makeConstructor (c$, 
function (a, m, n) {
this.a = (a == null ?  Clazz.newDoubleArray (m, n, 0) : a);
this.m = m;
this.n = n;
}, "~A,~N,~N");
$_M(c$, "getRowDimension", 
function () {
return this.m;
});
$_M(c$, "getColumnDimension", 
function () {
return this.n;
});
$_M(c$, "getArray", 
function () {
return this.a;
});
$_M(c$, "getArrayCopy", 
function () {
var x =  Clazz.newDoubleArray (this.m, this.n, 0);
for (var i = this.m; --i >= 0; ) for (var j = this.n; --j >= 0; ) x[i][j] = this.a[i][j];


return x;
});
$_M(c$, "copy", 
function () {
var x =  new JU.Matrix (null, this.m, this.n);
var c = x.a;
for (var i = this.m; --i >= 0; ) for (var j = this.n; --j >= 0; ) c[i][j] = this.a[i][j];


return x;
});
$_V(c$, "clone", 
function () {
return this.copy ();
});
$_M(c$, "getSubmatrix", 
function (i0, j0, nrows, ncols) {
var x =  new JU.Matrix (null, nrows, ncols);
var xa = x.a;
for (var i = nrows; --i >= 0; ) for (var j = ncols; --j >= 0; ) xa[i][j] = this.a[i0 + i][j0 + j];


return x;
}, "~N,~N,~N,~N");
$_M(c$, "getMatrixSelected", 
function (r, n) {
var x =  new JU.Matrix (null, r.length, n);
var xa = x.a;
for (var i = r.length; --i >= 0; ) {
var b = this.a[r[i]];
for (var j = n; --j >= 0; ) xa[i][j] = b[j];

}
return x;
}, "~A,~N");
$_M(c$, "transpose", 
function () {
var x =  new JU.Matrix (null, this.n, this.m);
var c = x.a;
for (var i = this.m; --i >= 0; ) for (var j = this.n; --j >= 0; ) c[j][i] = this.a[i][j];


return x;
});
$_M(c$, "add", 
function (b) {
return this.scaleAdd (b, 1);
}, "JU.Matrix");
$_M(c$, "sub", 
function (b) {
return this.scaleAdd (b, -1);
}, "JU.Matrix");
$_M(c$, "scaleAdd", 
function (b, scale) {
var x =  new JU.Matrix (null, this.m, this.n);
var xa = x.a;
var ba = b.a;
for (var i = this.m; --i >= 0; ) for (var j = this.n; --j >= 0; ) xa[i][j] = ba[i][j] * scale + this.a[i][j];


return x;
}, "JU.Matrix,~N");
$_M(c$, "mul", 
function (b) {
if (b.m != this.n) return null;
var x =  new JU.Matrix (null, this.m, b.n);
var xa = x.a;
var ba = b.a;
for (var j = b.n; --j >= 0; ) for (var i = this.m; --i >= 0; ) {
var arowi = this.a[i];
var s = 0;
for (var k = this.n; --k >= 0; ) s += arowi[k] * ba[k][j];

xa[i][j] = s;
}

return x;
}, "JU.Matrix");
$_M(c$, "inverse", 
function () {
return Clazz.innerTypeInstance (JU.Matrix.LUDecomp, this, null).solve (JU.Matrix.identity (this.m, this.m));
});
$_M(c$, "trace", 
function () {
var t = 0;
for (var i = Math.min (this.m, this.n); --i >= 0; ) t += this.a[i][i];

return t;
});
c$.identity = $_M(c$, "identity", 
function (m, n) {
var x =  new JU.Matrix (null, m, n);
var xa = x.a;
for (var i = Math.min (m, n); --i >= 0; ) xa[i][i] = 1;

return x;
}, "~N,~N");
$_V(c$, "toString", 
function () {
var s = "[\n";
for (var i = 0; i < this.m; i++) {
s += "  [";
for (var j = 0; j < this.n; j++) s += " " + this.a[i][j];

s += "]\n";
}
s += "]";
return s;
});
$_M(c$, "getRotation", 
function () {
return this.getSubmatrix (0, 0, this.m - 1, this.n - 1);
});
$_M(c$, "getTranslation", 
function () {
return this.getSubmatrix (0, this.n - 1, this.m - 1, 1);
});
c$.newT = $_M(c$, "newT", 
function (r, asColumn) {
return (asColumn ?  new JU.Matrix ([[r.x], [r.y], [r.z]], 3, 1) :  new JU.Matrix ([[r.x, r.y, r.z]], 1, 3));
}, "JU.P3,~B");
c$.$Matrix$LUDecomp$ = function () {
Clazz.pu$h ();
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.LU = null;
this.piv = null;
this.pivsign = 0;
Clazz.instantialize (this, arguments);
}, JU.Matrix, "LUDecomp");
Clazz.makeConstructor (c$, 
function () {
this.LU = this.b$["JU.Matrix"].getArrayCopy ();
this.piv =  Clazz.newIntArray (this.b$["JU.Matrix"].m, 0);
for (var a = this.b$["JU.Matrix"].m; --a >= 0; ) this.piv[a] = a;

this.pivsign = 1;
var b;
var c =  Clazz.newDoubleArray (this.b$["JU.Matrix"].m, 0);
for (var d = 0; d < this.b$["JU.Matrix"].n; d++) {
for (var e = this.b$["JU.Matrix"].m; --e >= 0; ) c[e] = this.LU[e][d];

for (var f = this.b$["JU.Matrix"].m; --f >= 0; ) {
b = this.LU[f];
var g = Math.min (f, d);
var h = 0.0;
for (var i = g; --i >= 0; ) h += b[i] * c[i];

b[d] = c[f] -= h;
}
var g = d;
for (var h = this.b$["JU.Matrix"].m; --h > d; ) if (Math.abs (c[h]) > Math.abs (c[g])) g = h;

if (g != d) {
for (var i = this.b$["JU.Matrix"].n; --i >= 0; ) {
var j = this.LU[g][i];
this.LU[g][i] = this.LU[d][i];
this.LU[d][i] = j;
}
var j = this.piv[g];
this.piv[g] = this.piv[d];
this.piv[d] = j;
this.pivsign = -this.pivsign;
}if ( new Boolean (d < this.b$["JU.Matrix"].m & this.LU[d][d] != 0.0).valueOf ()) for (var i = this.b$["JU.Matrix"].m; --i > d; ) this.LU[i][d] /= this.LU[d][d];

}
});
$_M(c$, "solve", 
function (a) {
if (a.m != this.b$["JU.Matrix"].m) return null;
for (var b = 0; b < this.b$["JU.Matrix"].n; b++) if (this.LU[b][b] == 0) return null;

var c = a.n;
var d = a.getMatrixSelected (this.piv, c);
var e = d.a;
for (var f = 0; f < this.b$["JU.Matrix"].n; f++) for (var g = f + 1; g < this.b$["JU.Matrix"].n; g++) for (var h = 0; h < c; h++) e[g][h] -= e[f][h] * this.LU[g][f];



for (var i = this.b$["JU.Matrix"].n; --i >= 0; ) {
for (var j = c; --j >= 0; ) e[i][j] /= this.LU[i][i];

for (var k = i; --k >= 0; ) for (var l = c; --l >= 0; ) e[k][l] -= e[i][l] * this.LU[k][i];


}
return d;
}, "JU.Matrix");
c$ = Clazz.p0p ();
};
