Clazz.declarePackage ("J.export");
Clazz.load (["JU.P3", "$.V3"], "J.export.___Exporter", ["java.lang.Float", "$.Short", "java.util.Hashtable", "JU.AU", "$.List", "$.M3", "$.SB", "J.util.C", "$.Logger", "$.MeshSurface", "$.Quaternion"], function () {
c$ = Clazz.decorateAsClass (function () {
this.viewer = null;
this.privateKey = 0;
this.jmolRenderer = null;
this.out = null;
this.fileName = null;
this.commandLineOptions = null;
this.isCartesian = false;
this.g3d = null;
this.backgroundColix = 0;
this.screenWidth = 0;
this.screenHeight = 0;
this.slabZ = 0;
this.depthZ = 0;
this.lightSource = null;
this.fixedRotationCenter = null;
this.referenceCenter = null;
this.cameraPosition = null;
this.cameraDistance = 0;
this.aperatureAngle = 0;
this.scalePixelsPerAngstrom = 0;
this.exportScale = 1;
this.exportType = 0;
this.tempP1 = null;
this.tempP2 = null;
this.tempP3 = null;
this.center = null;
this.tempV1 = null;
this.tempV2 = null;
this.tempV3 = null;
this.isWebGL = false;
this.commentChar = null;
this.tempC = null;
this.nText = 0;
this.nImage = 0;
this.lineWidthMad = 0;
Clazz.instantialize (this, arguments);
}, J["export"], "___Exporter");
Clazz.prepareFields (c$, function () {
this.tempP1 =  new JU.P3 ();
this.tempP2 =  new JU.P3 ();
this.tempP3 =  new JU.P3 ();
this.center =  new JU.P3 ();
this.tempV1 =  new JU.V3 ();
this.tempV2 =  new JU.V3 ();
this.tempV3 =  new JU.V3 ();
this.tempC =  new JU.P3 ();
});
Clazz.makeConstructor (c$, 
function () {
});
$_M(c$, "setRenderer", 
function (jmolRenderer) {
this.jmolRenderer = jmolRenderer;
}, "J.api.JmolRendererInterface");
$_M(c$, "initializeOutput", 
function (viewer, privateKey, g3d, params) {
return this.initOutput (viewer, privateKey, g3d, params);
}, "J.viewer.Viewer,~N,J.util.GData,java.util.Map");
$_M(c$, "initOutput", 
function (viewer, privateKey, g3d, params) {
this.viewer = viewer;
this.isWebGL = params.get ("type").equals ("JS");
this.g3d = g3d;
this.privateKey = privateKey;
this.backgroundColix = viewer.getObjectColix (0);
this.center.setT (viewer.getRotationCenter ());
this.exportScale = viewer.getFloat (570425358);
if ((this.screenWidth <= 0) || (this.screenHeight <= 0)) {
this.screenWidth = viewer.getScreenWidth ();
this.screenHeight = viewer.getScreenHeight ();
}this.slabZ = g3d.getSlab ();
this.depthZ = g3d.getDepth ();
this.lightSource = g3d.getLightSource ();
var cameraFactors = viewer.getCameraFactors ();
this.referenceCenter = cameraFactors[0];
this.cameraPosition = cameraFactors[1];
this.fixedRotationCenter = cameraFactors[2];
this.cameraDistance = cameraFactors[3].x;
this.aperatureAngle = cameraFactors[3].y;
this.scalePixelsPerAngstrom = cameraFactors[3].z;
this.out = params.get ("outputChannel");
this.commandLineOptions = params.get ("params");
if (this.out != null) this.fileName = this.out.getFileName ();
this.outputHeader ();
return true;
}, "J.viewer.Viewer,~N,J.util.GData,java.util.Map");
$_M(c$, "output", 
function (data) {
this.out.append (data);
}, "~S");
$_M(c$, "outputComment", 
function (comment) {
if (this.commentChar != null) this.output (this.commentChar + comment + "\n");
}, "~S");
c$.setTempVertex = $_M(c$, "setTempVertex", 
function (pt, offset, ptTemp) {
ptTemp.setT (pt);
if (offset != null) ptTemp.add (offset);
}, "JU.P3,JU.P3,JU.P3");
$_M(c$, "outputVertices", 
function (vertices, nVertices, offset) {
for (var i = 0; i < nVertices; i++) {
if (Float.isNaN (vertices[i].x)) continue;
this.outputVertex (vertices[i], offset);
this.output ("\n");
}
}, "~A,~N,JU.P3");
$_M(c$, "outputVertex", 
function (pt, offset) {
J["export"].___Exporter.setTempVertex (pt, offset, this.tempP1);
this.output (this.tempP1);
}, "JU.P3,JU.P3");
$_M(c$, "outputJmolPerspective", 
function () {
this.outputComment (this.getJmolPerspective ());
});
$_M(c$, "getJmolPerspective", 
function () {
if (this.commentChar == null) return "";
var sb =  new JU.SB ();
sb.append (this.commentChar).append ("Jmol perspective:");
sb.append ("\n").append (this.commentChar).append ("screen width height dim: " + this.screenWidth + " " + this.screenHeight + " " + this.viewer.getScreenDim ());
sb.append ("\n").append (this.commentChar).append ("perspectiveDepth: " + this.viewer.getPerspectiveDepth ());
sb.append ("\n").append (this.commentChar).append ("cameraDistance(angstroms): " + this.cameraDistance);
sb.append ("\n").append (this.commentChar).append ("aperatureAngle(degrees): " + this.aperatureAngle);
sb.append ("\n").append (this.commentChar).append ("scalePixelsPerAngstrom: " + this.scalePixelsPerAngstrom);
sb.append ("\n").append (this.commentChar).append ("light source: " + this.lightSource);
sb.append ("\n").append (this.commentChar).append ("lighting: " + this.viewer.getSpecularState ().$replace ('\n', ' '));
sb.append ("\n").append (this.commentChar).append ("center: " + this.center);
sb.append ("\n").append (this.commentChar).append ("rotationRadius: " + this.viewer.getFloat (570425388));
sb.append ("\n").append (this.commentChar).append ("boundboxCenter: " + this.viewer.getBoundBoxCenter ());
sb.append ("\n").append (this.commentChar).append ("translationOffset: " + this.viewer.getTranslationScript ());
sb.append ("\n").append (this.commentChar).append ("zoom: " + this.viewer.getZoomPercentFloat ());
sb.append ("\n").append (this.commentChar).append ("moveto command: " + this.viewer.getOrientationText (4130, null));
sb.append ("\n");
return sb.toString ();
});
$_M(c$, "outputFooter", 
function () {
});
$_M(c$, "finalizeOutput", 
function () {
return this.finalizeOutput2 ();
});
$_M(c$, "finalizeOutput2", 
function () {
this.outputFooter ();
if (this.out == null) return null;
var ret = this.out.closeChannel ();
if (this.fileName == null) return ret;
if (ret != null) {
J.util.Logger.info (ret);
return "ERROR EXPORTING FILE: " + ret;
}return "OK " + this.out.getByteCount () + " " + this.jmolRenderer.getExportName () + " " + this.fileName;
});
$_M(c$, "getExportDate", 
function () {
return this.viewer.apiPlatform.getDateFormat (false);
});
$_M(c$, "rgbFractionalFromColix", 
function (colix) {
return this.rgbFractionalFromArgb (this.g3d.getColorArgbOrGray (colix));
}, "~N");
$_M(c$, "getTriad", 
function (t) {
return J["export"].___Exporter.round (t.x) + " " + J["export"].___Exporter.round (t.y) + " " + J["export"].___Exporter.round (t.z);
}, "JU.T3");
$_M(c$, "rgbFractionalFromArgb", 
function (argb) {
var red = (argb >> 16) & 0xFF;
var green = (argb >> 8) & 0xFF;
var blue = argb & 0xFF;
this.tempC.set (red == 0 ? 0 : (red + 1) / 256, green == 0 ? 0 : (green + 1) / 256, blue == 0 ? 0 : (blue + 1) / 256);
return this.getTriad (this.tempC);
}, "~N");
c$.translucencyFractionalFromColix = $_M(c$, "translucencyFractionalFromColix", 
function (colix) {
return J["export"].___Exporter.round (J.util.C.getColixTranslucencyFractional (colix));
}, "~N");
c$.opacityFractionalFromColix = $_M(c$, "opacityFractionalFromColix", 
function (colix) {
return J["export"].___Exporter.round (1 - J.util.C.getColixTranslucencyFractional (colix));
}, "~N");
c$.opacityFractionalFromArgb = $_M(c$, "opacityFractionalFromArgb", 
function (argb) {
var opacity = (argb >> 24) & 0xFF;
return J["export"].___Exporter.round (opacity == 0 ? 0 : (opacity + 1) / 256);
}, "~N");
c$.round = $_M(c$, "round", 
function (number) {
var s;
return (number == 0 ? "0" : number == 1 ? "1" : (s = "" + (Math.round (number * 1000) / 1000)).startsWith ("0.") ? s.substring (1) : s.startsWith ("-0.") ? "-" + s.substring (2) : s.endsWith (".0") ? s.substring (0, s.length - 2) : s);
}, "~N");
c$.round = $_M(c$, "round", 
function (pt) {
return J["export"].___Exporter.round (pt.x) + " " + J["export"].___Exporter.round (pt.y) + " " + J["export"].___Exporter.round (pt.z);
}, "JU.T3");
$_M(c$, "getColorList", 
function (i00, colixes, nVertices, bsSelected, htColixes) {
var nColix = 0;
var list =  new JU.List ();
var isAll = (bsSelected == null);
var i0 = (isAll ? nVertices - 1 : bsSelected.nextSetBit (0));
for (var i = i0; i >= 0; i = (isAll ? i - 1 : bsSelected.nextSetBit (i + 1))) {
var color = Short.$valueOf (colixes[i]);
if (!htColixes.containsKey (color)) {
list.addLast (color);
htColixes.put (color, Integer.$valueOf (i00 + nColix++));
}}
return list;
}, "~N,~A,~N,JU.BS,java.util.Map");
c$.getConeMesh = $_M(c$, "getConeMesh", 
function (centerBase, matRotateScale, colix) {
var ms =  new J.util.MeshSurface ();
var ndeg = 10;
var n = Clazz.doubleToInt (360 / ndeg);
ms.colix = colix;
ms.vertices =  new Array (ms.vertexCount = n + 1);
ms.polygonIndexes = JU.AU.newInt2 (ms.polygonCount = n);
for (var i = 0; i < n; i++) ms.polygonIndexes[i] = [i, (i + 1) % n, n];

var d = ndeg / 180. * 3.141592653589793;
for (var i = 0; i < n; i++) {
var x = (Math.cos (i * d));
var y = (Math.sin (i * d));
ms.vertices[i] = JU.P3.new3 (x, y, 0);
}
ms.vertices[n] = JU.P3.new3 (0, 0, 1);
if (matRotateScale != null) {
ms.normals =  new Array (ms.vertexCount);
for (var i = 0; i < ms.vertexCount; i++) {
matRotateScale.rotate (ms.vertices[i]);
ms.normals[i] = JU.V3.newV (ms.vertices[i]);
ms.normals[i].normalize ();
ms.vertices[i].add (centerBase);
}
}return ms;
}, "JU.P3,JU.M3,~N");
$_M(c$, "getRotationMatrix", 
function (pt1, pt2, radius) {
var m =  new JU.M3 ();
var m1;
if (pt2.x == pt1.x && pt2.y == pt1.y) {
m1 = JU.M3.newM3 (null);
if (pt1.z > pt2.z) m1.m11 = m1.m22 = -1;
} else {
this.tempV1.sub2 (pt2, pt1);
this.tempV2.set (0, 0, 1);
this.tempV2.cross (this.tempV2, this.tempV1);
this.tempV1.cross (this.tempV1, this.tempV2);
var q = J.util.Quaternion.getQuaternionFrameV (this.tempV2, this.tempV1, null, false);
m1 = q.getMatrix ();
}m.m00 = radius;
m.m11 = radius;
m.m22 = pt2.distance (pt1);
m1.mul (m);
return m1;
}, "JU.P3,JU.P3,~N");
$_M(c$, "getRotationMatrix", 
function (pt1, ptZ, radius, ptX, ptY) {
var m =  new JU.M3 ();
m.m00 = ptX.distance (pt1) * radius;
m.m11 = ptY.distance (pt1) * radius;
m.m22 = ptZ.distance (pt1) * 2;
var q = J.util.Quaternion.getQuaternionFrame (pt1, ptX, ptY);
var m1 = q.getMatrix ();
m1.mul (m);
return m1;
}, "JU.P3,JU.P3,~N,JU.P3,JU.P3");
$_M(c$, "drawSurface", 
function (meshSurface, colix) {
var nVertices = meshSurface.vertexCount;
if (nVertices == 0) return;
var nFaces = 0;
var nPolygons = meshSurface.polygonCount;
var bsPolygons = meshSurface.bsPolygons;
var faceVertexMax = (meshSurface.haveQuads ? 4 : 3);
var indices = meshSurface.polygonIndexes;
var isAll = (bsPolygons == null);
var i0 = (isAll ? nPolygons - 1 : bsPolygons.nextSetBit (0));
for (var i = i0; i >= 0; i = (isAll ? i - 1 : bsPolygons.nextSetBit (i + 1))) nFaces += (faceVertexMax == 4 && indices[i].length == 4 ? 2 : 1);

if (nFaces == 0) return;
var vertices = meshSurface.getVertices ();
var normals = meshSurface.normals;
var colorSolid = (colix != 0);
var colixes = (colorSolid ? null : meshSurface.vertexColixes);
var polygonColixes = (colorSolid ? meshSurface.polygonColixes : null);
var htColixes = null;
var colorList = null;
if (!this.isWebGL) {
htColixes =  new java.util.Hashtable ();
if (polygonColixes != null) colorList = this.getColorList (0, polygonColixes, nPolygons, bsPolygons, htColixes);
 else if (colixes != null) colorList = this.getColorList (0, colixes, nVertices, null, htColixes);
}this.outputSurface (vertices, normals, colixes, indices, polygonColixes, nVertices, nPolygons, nFaces, bsPolygons, faceVertexMax, colix, colorList, htColixes, meshSurface.offset);
}, "J.util.MeshSurface,~N");
$_M(c$, "outputSurface", 
function (vertices, normals, colixes, indices, polygonColixes, nVertices, nPolygons, nFaces, bsPolygons, faceVertexMax, colix, colorList, htColixes, offset) {
}, "~A,~A,~A,~A,~A,~N,~N,~N,JU.BS,~N,~N,JU.List,java.util.Map,JU.P3");
$_M(c$, "drawFilledCircle", 
function (colixRing, colixFill, diameter, x, y, z) {
if (colixRing != 0) this.drawCircle (x, y, z, diameter, colixRing, false);
if (colixFill != 0) this.drawCircle (x, y, z, diameter, colixFill, true);
}, "~N,~N,~N,~N,~N,~N");
$_M(c$, "plotImage", 
function (x, y, z, image, bgcolix, width, height) {
if (z < 3) z = this.viewer.getFrontPlane ();
this.outputComment ("start image " + (++this.nImage));
this.g3d.plotImage (x, y, z, image, this.jmolRenderer, bgcolix, width, height);
this.outputComment ("end image " + this.nImage);
}, "~N,~N,~N,~O,~N,~N,~N");
$_M(c$, "plotText", 
function (x, y, z, colix, text, font3d) {
if (z < 3) z = this.viewer.getFrontPlane ();
this.outputComment ("start text " + (++this.nText) + ": " + text);
this.g3d.plotText (x, y, z, this.g3d.getColorArgbOrGray (colix), 0, text, font3d, this.jmolRenderer);
this.outputComment ("end text " + this.nText + ": " + text);
}, "~N,~N,~N,~N,~S,javajs.awt.Font");
Clazz.defineStatics (c$,
"degreesPerRadian", (57.29577951308232));
});
