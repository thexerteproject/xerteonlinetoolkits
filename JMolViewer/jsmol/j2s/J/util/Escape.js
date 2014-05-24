Clazz.declarePackage ("J.util");
Clazz.load (null, "J.util.Escape", ["java.lang.Float", "java.util.Map", "JU.A4", "$.BS", "$.List", "$.M3", "$.M34", "$.M4", "$.P3", "$.P4", "$.PT", "$.SB", "$.T3", "J.script.SV", "J.util.Quaternion"], function () {
c$ = Clazz.declareType (J.util, "Escape");
c$.escapeColor = $_M(c$, "escapeColor", 
function (argb) {
return (argb == 0 ? null : "[x" + J.util.Escape.getHexColorFromRGB (argb) + "]");
}, "~N");
c$.getHexColorFromRGB = $_M(c$, "getHexColorFromRGB", 
function (argb) {
if (argb == 0) return null;
var r = "00" + Integer.toHexString ((argb >> 16) & 0xFF);
r = r.substring (r.length - 2);
var g = "00" + Integer.toHexString ((argb >> 8) & 0xFF);
g = g.substring (g.length - 2);
var b = "00" + Integer.toHexString (argb & 0xFF);
b = b.substring (b.length - 2);
return r + g + b;
}, "~N");
c$.eP = $_M(c$, "eP", 
function (xyz) {
if (xyz == null) return "null";
return "{" + xyz.x + " " + xyz.y + " " + xyz.z + "}";
}, "JU.T3");
c$.matrixToScript = $_M(c$, "matrixToScript", 
function (m) {
return JU.PT.replaceAllCharacters (m.toString (), "\n\r ", "").$replace ('\t', ' ');
}, "~O");
c$.eP4 = $_M(c$, "eP4", 
function (x) {
return "{" + x.x + " " + x.y + " " + x.z + " " + x.w + "}";
}, "JU.P4");
c$.e = $_M(c$, "e", 
function (x) {
if (x == null) return "null";
if (JU.PT.isNonStringPrimitive (x)) return x.toString ();
if (Clazz.instanceOf (x, String)) return JU.PT.esc (x);
if (Clazz.instanceOf (x, JU.List)) return J.util.Escape.eV (x);
if (Clazz.instanceOf (x, java.util.Map)) return J.util.Escape.escapeMap (x);
if (Clazz.instanceOf (x, JU.BS)) return J.util.Escape.eBS (x);
if (Clazz.instanceOf (x, JU.T3)) return J.util.Escape.eP (x);
if (Clazz.instanceOf (x, JU.P4)) return J.util.Escape.eP4 (x);
if (JU.PT.isAS (x)) return J.util.Escape.eAS (x, true);
if (Clazz.instanceOf (x, JU.M34)) return JU.PT.rep (x.toString (), "\t", ",\t");
if (Clazz.instanceOf (x, JU.A4)) {
var a = x;
return "{" + a.x + " " + a.y + " " + a.z + " " + (a.angle * 180 / 3.141592653589793) + "}";
}if (Clazz.instanceOf (x, J.util.Quaternion)) return (x).toString ();
var s = JU.PT.nonArrayString (x);
return (s == null ? JU.PT.toJSON (null, x) : s);
}, "~O");
c$.eV = $_M(c$, "eV", 
function (list) {
if (list == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < list.size (); i++) {
if (i > 0) s.append (", ");
s.append (J.util.Escape.escapeNice (list.get (i).asString ()));
}
s.append ("]");
return s.toString ();
}, "JU.List");
c$.escapeMap = $_M(c$, "escapeMap", 
function (ht) {
var sb =  new JU.SB ();
sb.append ("{ ");
var sep = "";
for (var entry, $entry = ht.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) {
var key = entry.getKey ();
sb.append (sep).append (JU.PT.esc (key)).appendC (':');
var val = entry.getValue ();
if (!(Clazz.instanceOf (val, J.script.SV))) val = J.script.SV.getVariable (val);
sb.append ((val).escape ());
sep = ",";
}
sb.append (" }");
return sb.toString ();
}, "java.util.Map");
c$.escapeFloatA = $_M(c$, "escapeFloatA", 
function (f, asArray) {
if (asArray) return JU.PT.toJSON (null, f);
var sb =  new JU.SB ();
for (var i = 0; i < f.length; i++) {
if (i > 0) sb.appendC ('\n');
sb.appendF (f[i]);
}
return sb.toString ();
}, "~A,~B");
c$.escapeFloatAA = $_M(c$, "escapeFloatAA", 
function (f, addSemi) {
var sb =  new JU.SB ();
var eol = (addSemi ? ";\n" : "\n");
for (var i = 0; i < f.length; i++) if (f[i] != null) {
if (i > 0) sb.append (eol);
for (var j = 0; j < f[i].length; j++) sb.appendF (f[i][j]).appendC ('\t');

}
return sb.toString ();
}, "~A,~B");
c$.escapeFloatAAA = $_M(c$, "escapeFloatAAA", 
function (f, addSemi) {
var sb =  new JU.SB ();
var eol = (addSemi ? ";\n" : "\n");
if (f[0] == null || f[0][0] == null) return "0 0 0" + eol;
sb.appendI (f.length).append (" ").appendI (f[0].length).append (" ").appendI (f[0][0].length);
for (var i = 0; i < f.length; i++) if (f[i] != null) {
sb.append (eol);
for (var j = 0; j < f[i].length; j++) if (f[i][j] != null) {
sb.append (eol);
for (var k = 0; k < f[i][j].length; k++) sb.appendF (f[i][j][k]).appendC ('\t');

}
}
return sb.toString ();
}, "~A,~B");
c$.eAS = $_M(c$, "eAS", 
function (list, nicely) {
if (list == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < list.length; i++) {
if (i > 0) s.append (", ");
s.append (nicely ? J.util.Escape.escapeNice (list[i]) : JU.PT.esc (list[i]));
}
s.append ("]");
return s.toString ();
}, "~A,~B");
c$.eAI = $_M(c$, "eAI", 
function (ilist) {
if (ilist == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < ilist.length; i++) {
if (i > 0) s.append (", ");
s.appendI (ilist[i]);
}
return s.append ("]").toString ();
}, "~A");
c$.eAD = $_M(c$, "eAD", 
function (dlist) {
if (dlist == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < dlist.length; i++) {
if (i > 0) s.append (", ");
s.appendD (dlist[i]);
}
return s.append ("]").toString ();
}, "~A");
c$.eAF = $_M(c$, "eAF", 
function (flist) {
if (flist == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < flist.length; i++) {
if (i > 0) s.append (", ");
s.appendF (flist[i]);
}
return s.append ("]").toString ();
}, "~A");
c$.eAP = $_M(c$, "eAP", 
function (plist) {
if (plist == null) return JU.PT.esc ("");
var s =  new JU.SB ();
s.append ("[");
for (var i = 0; i < plist.length; i++) {
if (i > 0) s.append (", ");
s.append (J.util.Escape.eP (plist[i]));
}
return s.append ("]").toString ();
}, "~A");
c$.escapeNice = $_M(c$, "escapeNice", 
($fz = function (s) {
if (s == null) return "null";
var f = JU.PT.parseFloatStrict (s);
return (Float.isNaN (f) ? JU.PT.esc (s) : s);
}, $fz.isPrivate = true, $fz), "~S");
c$.uABsM = $_M(c$, "uABsM", 
function (s) {
if (s.charAt (0) == '{') return J.util.Escape.uP (s);
if ((J.util.Escape.isStringArray (s) || s.startsWith ("[{") && s.indexOf ("[{") == s.lastIndexOf ("[{")) && s.indexOf (',') < 0 && s.indexOf ('.') < 0 && s.indexOf ('-') < 0) return JU.BS.unescape (s);
if (s.startsWith ("[[")) return J.util.Escape.unescapeMatrix (s);
return s;
}, "~S");
c$.isStringArray = $_M(c$, "isStringArray", 
function (s) {
return s.startsWith ("({") && s.lastIndexOf ("({") == 0 && s.indexOf ("})") == s.length - 2;
}, "~S");
c$.uP = $_M(c$, "uP", 
function (strPoint) {
if (strPoint == null || strPoint.length == 0) return strPoint;
var str = strPoint.$replace ('\n', ' ').trim ();
if (str.charAt (0) != '{' || str.charAt (str.length - 1) != '}') return strPoint;
var points =  Clazz.newFloatArray (5, 0);
var nPoints = 0;
str = str.substring (1, str.length - 1);
var next =  Clazz.newIntArray (1, 0);
for (; nPoints < 5; nPoints++) {
points[nPoints] = JU.PT.parseFloatNext (str, next);
if (Float.isNaN (points[nPoints])) {
if (next[0] >= str.length || str.charAt (next[0]) != ',') break;
next[0]++;
nPoints--;
}}
if (nPoints == 3) return JU.P3.new3 (points[0], points[1], points[2]);
if (nPoints == 4) return JU.P4.new4 (points[0], points[1], points[2], points[3]);
return strPoint;
}, "~S");
c$.unescapeMatrix = $_M(c$, "unescapeMatrix", 
function (strMatrix) {
if (strMatrix == null || strMatrix.length == 0) return strMatrix;
var str = strMatrix.$replace ('\n', ' ').trim ();
if (str.lastIndexOf ("[[") != 0 || str.indexOf ("]]") != str.length - 2) return strMatrix;
var points =  Clazz.newFloatArray (16, 0);
str = str.substring (2, str.length - 2).$replace ('[', ' ').$replace (']', ' ').$replace (',', ' ');
var next =  Clazz.newIntArray (1, 0);
var nPoints = 0;
for (; nPoints < 16; nPoints++) {
points[nPoints] = JU.PT.parseFloatNext (str, next);
if (Float.isNaN (points[nPoints])) {
break;
}}
if (!Float.isNaN (JU.PT.parseFloatNext (str, next))) return strMatrix;
if (nPoints == 9) return JU.M3.newA9 (points);
if (nPoints == 16) return JU.M4.newA16 (points);
return strMatrix;
}, "~S");
c$.eBS = $_M(c$, "eBS", 
function (bs) {
return JU.BS.escape (bs, '(', ')');
}, "JU.BS");
c$.eBond = $_M(c$, "eBond", 
function (bs) {
return JU.BS.escape (bs, '[', ']');
}, "JU.BS");
c$.toReadable = $_M(c$, "toReadable", 
function (name, info) {
var sb =  new JU.SB ();
var sep = "";
if (info == null) return "null";
if (JU.PT.isNonStringPrimitive (info)) return J.util.Escape.packageReadable (name, null, info.toString ());
if (Clazz.instanceOf (info, String)) return J.util.Escape.packageReadable (name, null, JU.PT.esc (info));
if (Clazz.instanceOf (info, J.script.SV)) return J.util.Escape.packageReadable (name, null, (info).escape ());
if (JU.PT.isAS (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (JU.PT.esc ((info)[i]));
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "String[" + imax + "]", sb);
}if (JU.PT.isAI (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).appendI ((info)[i]);
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "int[" + imax + "]", sb);
}if (JU.PT.isAF (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).appendF ((info)[i]);
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "float[" + imax + "]", sb);
}if (JU.PT.isAD (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).appendD ((info)[i]);
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "double[" + imax + "]", sb);
}if (JU.PT.isAP (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (J.util.Escape.eP ((info)[i]));
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "point3f[" + imax + "]", sb);
}if (JU.PT.isASS (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (J.util.Escape.toReadable (null, (info)[i]));
sep = ",\n";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "String[" + imax + "][]", sb);
}if (JU.PT.isAII (info)) {
sb.append ("[");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (J.util.Escape.toReadable (null, (info)[i]));
sep = ",";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "int[" + imax + "][]", sb);
}if (JU.PT.isAFF (info)) {
sb.append ("[\n");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (J.util.Escape.toReadable (null, (info)[i]));
sep = ",\n";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "float[][]", sb);
}if (JU.PT.isADD (info)) {
sb.append ("[\n");
var imax = (info).length;
for (var i = 0; i < imax; i++) {
sb.append (sep).append (J.util.Escape.toReadable (null, (info)[i]));
sep = ",\n";
}
sb.append ("]");
return J.util.Escape.packageReadableSb (name, "double[][]", sb);
}if (Clazz.instanceOf (info, JU.List)) {
var imax = (info).size ();
for (var i = 0; i < imax; i++) {
sb.append (J.util.Escape.toReadable (name + "[" + (i + 1) + "]", (info).get (i)));
}
return J.util.Escape.packageReadableSb (name, "List[" + imax + "]", sb);
}if (Clazz.instanceOf (info, JU.M34) || Clazz.instanceOf (info, JU.T3) || Clazz.instanceOf (info, JU.P4) || Clazz.instanceOf (info, JU.A4)) {
sb.append (J.util.Escape.e (info));
return J.util.Escape.packageReadableSb (name, null, sb);
}if (Clazz.instanceOf (info, java.util.Map)) {
var e = (info).keySet ().iterator ();
while (e.hasNext ()) {
var key = e.next ();
sb.append (J.util.Escape.toReadable ((name == null ? "" : name + ".") + key, (info).get (key)));
}
return sb.toString ();
}return J.util.Escape.packageReadable (name, null, JU.PT.toJSON (null, info));
}, "~S,~O");
c$.packageReadableSb = $_M(c$, "packageReadableSb", 
($fz = function (infoName, infoType, sb) {
return J.util.Escape.packageReadable (infoName, infoType, sb.toString ());
}, $fz.isPrivate = true, $fz), "~S,~S,JU.SB");
c$.packageReadable = $_M(c$, "packageReadable", 
($fz = function (infoName, infoType, info) {
var s = (infoType == null ? "" : infoType + "\t");
if (infoName == null) return s + info;
return "\n" + infoName + "\t" + (infoType == null ? "" : "*" + infoType + "\t") + info;
}, $fz.isPrivate = true, $fz), "~S,~S,~S");
c$.escapeModelFileNumber = $_M(c$, "escapeModelFileNumber", 
function (iv) {
return "" + (Clazz.doubleToInt (iv / 1000000)) + "." + (iv % 1000000);
}, "~N");
c$.encapsulateData = $_M(c$, "encapsulateData", 
function (name, data, depth) {
return "  DATA \"" + name + "\"\n" + (depth == 2 ? J.util.Escape.escapeFloatAA (data, true) + ";\n" : depth == 3 ? J.util.Escape.escapeFloatAAA (data, true) + ";\n" : data) + "    END \"" + name + "\";\n";
}, "~S,~O,~N");
c$.unescapeUnicode = $_M(c$, "unescapeUnicode", 
function (s) {
var ichMax = s.length;
var sb = JU.SB.newN (ichMax);
var ich = 0;
while (ich < ichMax) {
var ch = s.charAt (ich++);
if (ch == '\\' && ich < ichMax) {
ch = s.charAt (ich++);
switch (ch) {
case 'u':
if (ich < ichMax) {
var unicode = 0;
for (var k = 4; --k >= 0 && ich < ichMax; ) {
var chT = s.charAt (ich);
var hexit = J.util.Escape.getHexitValue (chT);
if (hexit < 0) break;
unicode <<= 4;
unicode += hexit;
++ich;
}
ch = String.fromCharCode (unicode);
}}
}sb.appendC (ch);
}
return sb.toString ();
}, "~S");
c$.getHexitValue = $_M(c$, "getHexitValue", 
function (ch) {
if (ch.charCodeAt (0) >= 48 && ch.charCodeAt (0) <= 57) return ch.charCodeAt (0) - 48;
 else if (ch.charCodeAt (0) >= 97 && ch.charCodeAt (0) <= 102) return 10 + ch.charCodeAt (0) - 97;
 else if (ch.charCodeAt (0) >= 65 && ch.charCodeAt (0) <= 70) return 10 + ch.charCodeAt (0) - 65;
 else return -1;
}, "~S");
c$.unescapeStringArray = $_M(c$, "unescapeStringArray", 
function (data) {
if (data == null || !data.startsWith ("[") || !data.endsWith ("]")) return null;
var v =  new JU.List ();
var next =  Clazz.newIntArray (1, 0);
next[0] = 1;
while (next[0] < data.length) {
var s = JU.PT.getQuotedStringNext (data, next);
if (s == null) return null;
v.addLast (JU.PT.rep (s, "\\\"", "\""));
while (next[0] < data.length && data.charAt (next[0]) != '"') next[0]++;

}
return v.toArray ( new Array (v.size ()));
}, "~S");
c$.isAV = $_M(c$, "isAV", 
function (x) {
{
return Clazz.instanceOf(x[0], J.script.SV);
}}, "~O");
});
