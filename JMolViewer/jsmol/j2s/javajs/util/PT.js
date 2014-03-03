Clazz.declarePackage ("JU");
Clazz.load (null, "JU.PT", ["java.lang.Boolean", "$.Character", "$.Float", "$.Number", "java.util.Map", "javajs.api.JSONEncodable", "JU.AU", "$.DF", "$.List", "$.M34", "$.M4", "$.SB"], function () {
c$ = Clazz.declareType (JU, "PT");
c$.parseInt = $_M(c$, "parseInt", 
function (str) {
return JU.PT.parseIntNext (str, [0]);
}, "~S");
c$.parseIntNext = $_M(c$, "parseIntNext", 
function (str, next) {
var cch = str.length;
if (next[0] < 0 || next[0] >= cch) return -2147483648;
return JU.PT.parseIntChecked (str, cch, next);
}, "~S,~A");
c$.parseIntChecked = $_M(c$, "parseIntChecked", 
function (str, ichMax, next) {
var digitSeen = false;
var value = 0;
var ich = next[0];
if (ich < 0) return -2147483648;
var ch;
while (ich < ichMax && JU.PT.isWhiteSpace (str, ich)) ++ich;

var negative = false;
if (ich < ichMax && str.charCodeAt (ich) == 45) {
negative = true;
++ich;
}while (ich < ichMax && (ch = str.charCodeAt (ich)) >= 48 && ch <= 57) {
value = value * 10 + (ch - 48);
digitSeen = true;
++ich;
}
if (!digitSeen) value = -2147483648;
 else if (negative) value = -value;
next[0] = ich;
return value;
}, "~S,~N,~A");
c$.isWhiteSpace = $_M(c$, "isWhiteSpace", 
function (str, ich) {
var ch;
return (ich >= 0 && ((ch = str.charAt (ich)) == ' ' || ch == '\t' || ch == '\n'));
}, "~S,~N");
c$.parseFloatChecked = $_M(c$, "parseFloatChecked", 
function (str, ichMax, next, isStrict) {
var digitSeen = false;
var ich = next[0];
if (isStrict && str.indexOf ('\n') != str.lastIndexOf ('\n')) return NaN;
while (ich < ichMax && JU.PT.isWhiteSpace (str, ich)) ++ich;

var negative = false;
if (ich < ichMax && str.charAt (ich) == '-') {
++ich;
negative = true;
}var ch = 0;
var ival = 0;
var ival2 = 0;
while (ich < ichMax && (ch = str.charCodeAt (ich)) >= 48 && ch <= 57) {
ival = (ival * 10) + (ch - 48) * 1;
++ich;
digitSeen = true;
}
var isDecimal = false;
var iscale = 0;
var nzero = (ival == 0 ? -1 : 0);
if (ch == 46) {
isDecimal = true;
while (++ich < ichMax && (ch = str.charCodeAt (ich)) >= 48 && ch <= 57) {
digitSeen = true;
if (nzero < 0) {
if (ch == 48) {
nzero--;
continue;
}nzero = -nzero;
}if (iscale < JU.PT.decimalScale.length) {
ival2 = (ival2 * 10) + (ch - 48) * 1;
iscale++;
}}
}var value;
if (!digitSeen) {
value = NaN;
} else if (ival2 > 0) {
value = ival2 * JU.PT.decimalScale[iscale - 1];
if (nzero > 1) {
if (nzero - 2 < JU.PT.decimalScale.length) {
value *= JU.PT.decimalScale[nzero - 2];
} else {
value *= Math.pow (10, 1 - nzero);
}} else {
value += ival;
}} else {
value = ival;
}var isExponent = false;
if (ich < ichMax && (ch == 69 || ch == 101 || ch == 68)) {
isExponent = true;
if (++ich >= ichMax) return NaN;
ch = str.charCodeAt (ich);
if ((ch == 43) && (++ich >= ichMax)) return NaN;
next[0] = ich;
var exponent = JU.PT.parseIntChecked (str, ichMax, next);
if (exponent == -2147483648) return NaN;
if (exponent > 0 && exponent <= JU.PT.tensScale.length) value *= JU.PT.tensScale[exponent - 1];
 else if (exponent < 0 && -exponent <= JU.PT.decimalScale.length) value *= JU.PT.decimalScale[-exponent - 1];
 else if (exponent != 0) value *= Math.pow (10, exponent);
} else {
next[0] = ich;
}if (negative) value = -value;
if (value == Infinity) value = 3.4028235E38;
return (!isStrict || (!isExponent || isDecimal) && JU.PT.checkTrailingText (str, next[0], ichMax) ? value : NaN);
}, "~S,~N,~A,~B");
c$.checkTrailingText = $_M(c$, "checkTrailingText", 
function (str, ich, ichMax) {
var ch;
while (ich < ichMax && (Character.isWhitespace (ch = str.charAt (ich)) || ch == ';')) ++ich;

return (ich == ichMax);
}, "~S,~N,~N");
c$.parseFloatArray = $_M(c$, "parseFloatArray", 
function (str) {
return JU.PT.parseFloatArrayNext (str,  Clazz.newIntArray (1, 0), null, null, null);
}, "~S");
c$.parseFloatArrayInfested = $_M(c$, "parseFloatArrayInfested", 
function (tokens, data) {
var len = data.length;
var nTokens = tokens.length;
var n = 0;
var max = 0;
for (var i = 0; i >= 0 && i < len && n < nTokens; i++) {
var f;
while (Float.isNaN (f = JU.PT.parseFloat (tokens[n++])) && n < nTokens) {
}
if (!Float.isNaN (f)) data[(max = i)] = f;
if (n == nTokens) break;
}
return max + 1;
}, "~A,~A");
c$.parseFloatArrayNext = $_M(c$, "parseFloatArrayNext", 
function (str, next, f, strStart, strEnd) {
var n = 0;
var pt = next[0];
if (pt >= 0) {
if (strStart != null) {
var p = str.indexOf (strStart, pt);
if (p >= 0) next[0] = p + strStart.length;
}str = str.substring (next[0]);
pt = (strEnd == null ? -1 : str.indexOf (strEnd));
if (pt < 0) pt = str.length;
 else str = str.substring (0, pt);
next[0] += pt + 1;
var tokens = JU.PT.getTokens (str);
if (f == null) f =  Clazz.newFloatArray (tokens.length, 0);
n = JU.PT.parseFloatArrayInfested (tokens, f);
}if (f == null) return  Clazz.newFloatArray (0, 0);
for (var i = n; i < f.length; i++) f[i] = NaN;

return f;
}, "~S,~A,~A,~S,~S");
c$.parseFloatRange = $_M(c$, "parseFloatRange", 
function (str, ichMax, next) {
var cch = str.length;
if (ichMax > cch) ichMax = cch;
if (next[0] < 0 || next[0] >= ichMax) return NaN;
return JU.PT.parseFloatChecked (str, ichMax, next, false);
}, "~S,~N,~A");
c$.parseFloatNext = $_M(c$, "parseFloatNext", 
function (str, next) {
var cch = (str == null ? -1 : str.length);
if (next[0] < 0 || next[0] >= cch) return NaN;
return JU.PT.parseFloatChecked (str, cch, next, false);
}, "~S,~A");
c$.parseFloatStrict = $_M(c$, "parseFloatStrict", 
function (str) {
var cch = str.length;
if (cch == 0) return NaN;
return JU.PT.parseFloatChecked (str, cch, [0], true);
}, "~S");
c$.parseFloat = $_M(c$, "parseFloat", 
function (str) {
return JU.PT.parseFloatNext (str, [0]);
}, "~S");
c$.parseIntRadix = $_M(c$, "parseIntRadix", 
function (s, i) {
{
return Integer.parseIntRadix(s, i);
}}, "~S,~N");
c$.getTokens = $_M(c$, "getTokens", 
function (line) {
return JU.PT.getTokensAt (line, 0);
}, "~S");
c$.parseToken = $_M(c$, "parseToken", 
function (str) {
return JU.PT.parseTokenNext (str, [0]);
}, "~S");
c$.parseTrimmed = $_M(c$, "parseTrimmed", 
function (str) {
return JU.PT.parseTrimmedRange (str, 0, str.length);
}, "~S");
c$.parseTrimmedAt = $_M(c$, "parseTrimmedAt", 
function (str, ichStart) {
return JU.PT.parseTrimmedRange (str, ichStart, str.length);
}, "~S,~N");
c$.parseTrimmedRange = $_M(c$, "parseTrimmedRange", 
function (str, ichStart, ichMax) {
var cch = str.length;
if (ichMax < cch) cch = ichMax;
if (cch < ichStart) return "";
return JU.PT.parseTrimmedChecked (str, ichStart, cch);
}, "~S,~N,~N");
c$.getTokensAt = $_M(c$, "getTokensAt", 
function (line, ich) {
if (line == null) return null;
var cchLine = line.length;
if (ich < 0 || ich > cchLine) return null;
var tokenCount = JU.PT.countTokens (line, ich);
var tokens =  new Array (tokenCount);
var next =  Clazz.newIntArray (1, 0);
next[0] = ich;
for (var i = 0; i < tokenCount; ++i) tokens[i] = JU.PT.parseTokenChecked (line, cchLine, next);

return tokens;
}, "~S,~N");
c$.countTokens = $_M(c$, "countTokens", 
function (line, ich) {
var tokenCount = 0;
if (line != null) {
var ichMax = line.length;
while (true) {
while (ich < ichMax && JU.PT.isWhiteSpace (line, ich)) ++ich;

if (ich == ichMax) break;
++tokenCount;
do {
++ich;
} while (ich < ichMax && !JU.PT.isWhiteSpace (line, ich));
}
}return tokenCount;
}, "~S,~N");
c$.parseTokenNext = $_M(c$, "parseTokenNext", 
function (str, next) {
var cch = str.length;
if (next[0] < 0 || next[0] >= cch) return null;
return JU.PT.parseTokenChecked (str, cch, next);
}, "~S,~A");
c$.parseTokenRange = $_M(c$, "parseTokenRange", 
function (str, ichMax, next) {
var cch = str.length;
if (ichMax > cch) ichMax = cch;
if (next[0] < 0 || next[0] >= ichMax) return null;
return JU.PT.parseTokenChecked (str, ichMax, next);
}, "~S,~N,~A");
c$.parseTokenChecked = $_M(c$, "parseTokenChecked", 
function (str, ichMax, next) {
var ich = next[0];
while (ich < ichMax && JU.PT.isWhiteSpace (str, ich)) ++ich;

var ichNonWhite = ich;
while (ich < ichMax && !JU.PT.isWhiteSpace (str, ich)) ++ich;

next[0] = ich;
if (ichNonWhite == ich) return null;
return str.substring (ichNonWhite, ich);
}, "~S,~N,~A");
c$.parseTrimmedChecked = $_M(c$, "parseTrimmedChecked", 
function (str, ich, ichMax) {
while (ich < ichMax && JU.PT.isWhiteSpace (str, ich)) ++ich;

var ichLast = ichMax - 1;
while (ichLast >= ich && JU.PT.isWhiteSpace (str, ichLast)) --ichLast;

if (ichLast < ich) return "";
return str.substring (ich, ichLast + 1);
}, "~S,~N,~N");
c$.dVal = $_M(c$, "dVal", 
function (s) {
{
if(s==null)
throw new NumberFormatException("null");
var d=parseFloat(s);
if(isNaN(d))
throw new NumberFormatException("Not a Number : "+s);
return d
}}, "~S");
c$.fVal = $_M(c$, "fVal", 
function (s) {
{
return this.dVal(s);
}}, "~S");
c$.parseIntRange = $_M(c$, "parseIntRange", 
function (str, ichMax, next) {
var cch = str.length;
if (ichMax > cch) ichMax = cch;
if (next[0] < 0 || next[0] >= ichMax) return -2147483648;
return JU.PT.parseIntChecked (str, ichMax, next);
}, "~S,~N,~A");
c$.parseFloatArrayData = $_M(c$, "parseFloatArrayData", 
function (tokens, data) {
JU.PT.parseFloatArrayDataN (tokens, data, data.length);
}, "~A,~A");
c$.parseFloatArrayDataN = $_M(c$, "parseFloatArrayDataN", 
function (tokens, data, nData) {
for (var i = nData; --i >= 0; ) data[i] = (i >= tokens.length ? NaN : JU.PT.parseFloat (tokens[i]));

}, "~A,~A,~N");
c$.split = $_M(c$, "split", 
function (text, run) {
if (text.length == 0) return  new Array (0);
var n = 1;
var i = text.indexOf (run);
var lines;
var runLen = run.length;
if (i < 0 || runLen == 0) {
lines =  new Array (1);
lines[0] = text;
return lines;
}var len = text.length - runLen;
for (; i >= 0 && i < len; n++) i = text.indexOf (run, i + runLen);

lines =  new Array (n);
i = 0;
var ipt = 0;
var pt = 0;
for (; (ipt = text.indexOf (run, i)) >= 0 && pt + 1 < n; ) {
lines[pt++] = text.substring (i, ipt);
i = ipt + runLen;
}
if (text.indexOf (run, len) != len) len += runLen;
lines[pt] = text.substring (i, len);
return lines;
}, "~S,~S");
c$.getQuotedStringAt = $_M(c$, "getQuotedStringAt", 
function (line, ipt0) {
var next = [ipt0];
return JU.PT.getQuotedStringNext (line, next);
}, "~S,~N");
c$.getQuotedStringNext = $_M(c$, "getQuotedStringNext", 
function (line, next) {
var value = line;
var i = next[0];
if (i < 0 || (i = value.indexOf ("\"", i)) < 0) return "";
next[0] = ++i;
value = value.substring (i);
i = -1;
while (++i < value.length && value.charAt (i) != '"') if (value.charAt (i) == '\\') i++;

next[0] += i + 1;
return value.substring (0, i);
}, "~S,~A");
c$.isOneOf = $_M(c$, "isOneOf", 
function (key, semiList) {
if (semiList.length == 0) return false;
if (semiList.charAt (0) != ';') semiList = ";" + semiList + ";";
return key.indexOf (";") < 0 && semiList.indexOf (';' + key + ';') >= 0;
}, "~S,~S");
c$.getQuotedAttribute = $_M(c$, "getQuotedAttribute", 
function (info, name) {
var i = info.indexOf (name + "=");
return (i < 0 ? null : JU.PT.getQuotedStringAt (info, i));
}, "~S,~S");
c$.approx = $_M(c$, "approx", 
function (f, n) {
return Math.round (f * n) / n;
}, "~N,~N");
c$.rep = $_M(c$, "rep", 
function (str, strFrom, strTo) {
if (str == null || strFrom.length == 0 || str.indexOf (strFrom) < 0) return str;
var isOnce = (strTo.indexOf (strFrom) >= 0);
do {
str = str.$replace (strFrom, strTo);
} while (!isOnce && str.indexOf (strFrom) >= 0);
return str;
}, "~S,~S,~S");
c$.formatF = $_M(c$, "formatF", 
function (value, width, precision, alignLeft, zeroPad) {
return JU.PT.formatS (JU.DF.formatDecimal (value, precision), width, 0, alignLeft, zeroPad);
}, "~N,~N,~N,~B,~B");
c$.formatD = $_M(c$, "formatD", 
function (value, width, precision, alignLeft, zeroPad, allowOverflow) {
return JU.PT.formatS (JU.DF.formatDecimal (value, -1 - precision), width, 0, alignLeft, zeroPad);
}, "~N,~N,~N,~B,~B,~B");
c$.formatS = $_M(c$, "formatS", 
function (value, width, precision, alignLeft, zeroPad) {
if (value == null) return "";
var len = value.length;
if (precision != 2147483647 && precision > 0 && precision < len) value = value.substring (0, precision);
 else if (precision < 0 && len + precision >= 0) value = value.substring (len + precision + 1);
var padLength = width - value.length;
if (padLength <= 0) return value;
var isNeg = (zeroPad && !alignLeft && value.charAt (0) == '-');
var padChar = (zeroPad ? '0' : ' ');
var padChar0 = (isNeg ? '-' : padChar);
var sb =  new JU.SB ();
if (alignLeft) sb.append (value);
sb.appendC (padChar0);
for (var i = padLength; --i > 0; ) sb.appendC (padChar);

if (!alignLeft) sb.append (isNeg ? padChar + value.substring (1) : value);
return sb.toString ();
}, "~S,~N,~N,~B,~B");
c$.replaceWithCharacter = $_M(c$, "replaceWithCharacter", 
function (str, strFrom, chTo) {
if (str == null) return null;
for (var i = strFrom.length; --i >= 0; ) str = str.$replace (strFrom.charAt (i), chTo);

return str;
}, "~S,~S,~S");
c$.replaceAllCharacters = $_M(c$, "replaceAllCharacters", 
function (str, strFrom, strTo) {
for (var i = strFrom.length; --i >= 0; ) {
var chFrom = strFrom.substring (i, i + 1);
str = JU.PT.rep (str, chFrom, strTo);
}
return str;
}, "~S,~S,~S");
c$.trim = $_M(c$, "trim", 
function (str, chars) {
if (chars.length == 0) return str.trim ();
var len = str.length;
var k = 0;
while (k < len && chars.indexOf (str.charAt (k)) >= 0) k++;

var m = str.length - 1;
while (m > k && chars.indexOf (str.charAt (m)) >= 0) m--;

return str.substring (k, m + 1);
}, "~S,~S");
c$.trimQuotes = $_M(c$, "trimQuotes", 
function (value) {
return (value != null && value.length > 1 && value.startsWith ("\"") && value.endsWith ("\"") ? value.substring (1, value.length - 1) : value);
}, "~S");
c$.isNonStringPrimitive = $_M(c$, "isNonStringPrimitive", 
function (info) {
return Clazz.instanceOf (info, Number) || Clazz.instanceOf (info, Boolean);
}, "~O");
c$.arrayGet = $_M(c$, "arrayGet", 
($fz = function (info, i) {
{
return info[i];
}}, $fz.isPrivate = true, $fz), "~O,~N");
c$.toJSON = $_M(c$, "toJSON", 
function (infoType, info) {
if (info == null) return JU.PT.packageJSON (infoType, null);
if (JU.PT.isNonStringPrimitive (info)) return JU.PT.packageJSON (infoType, info.toString ());
var s = null;
var sb = null;
while (true) {
if (Clazz.instanceOf (info, String)) {
s = JU.PT.fixString (info);
break;
}if (Clazz.instanceOf (info, javajs.api.JSONEncodable)) {
s = (info).toJSON ();
break;
}sb =  new JU.SB ();
if (Clazz.instanceOf (info, java.util.Map)) {
sb.append ("{ ");
var sep = "";
for (var key, $key = (info).keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) {
sb.append (sep).append (JU.PT.packageJSON (key, JU.PT.toJSON (null, (info).get (key))));
sep = ",";
}
sb.append (" }");
break;
}if (Clazz.instanceOf (info, JU.List)) {
sb.append ("[ ");
var n = (info).size ();
for (var i = 0; i < n; i++) {
if (i > 0) sb.appendC (',');
sb.append (JU.PT.toJSON (null, (info).get (i)));
}
sb.append (" ]");
break;
}if (Clazz.instanceOf (info, JU.M34)) {
var len = (Clazz.instanceOf (info, JU.M4) ? 4 : 3);
var x =  Clazz.newFloatArray (len, 0);
var m = info;
sb.appendC ('[');
for (var i = 0; i < len; i++) {
if (i > 0) sb.appendC (',');
m.getRow (i, x);
sb.append (JU.PT.toJSON (null, x));
}
sb.appendC (']');
break;
}s = JU.PT.nonArrayString (info);
if (s == null) {
sb.append ("[");
var n = JU.AU.getLength (info);
for (var i = 0; i < n; i++) {
if (i > 0) sb.appendC (',');
sb.append (JU.PT.toJSON (null, JU.PT.arrayGet (info, i)));
}
sb.append ("]");
break;
}info = info.toString ();
}
return JU.PT.packageJSON (infoType, (s == null ? sb.toString () : s));
}, "~S,~O");
c$.nonArrayString = $_M(c$, "nonArrayString", 
function (x) {
{
var s = x.toString(); return (s.startsWith("[object") &&
s.endsWith("Array]") ? null : s);
}}, "~O");
c$.packageJSON = $_M(c$, "packageJSON", 
function (infoType, info) {
return (infoType == null ? info : "\"" + infoType + "\": " + info);
}, "~S,~S");
c$.fixString = $_M(c$, "fixString", 
($fz = function (s) {
{
if (typeof s == "undefined") return "null"
}if (s == null || s.indexOf ("{\"") == 0) return s;
s = JU.PT.rep (s, "\"", "\\\"");
s = JU.PT.rep (s, "\n", "\\n");
return "\"" + s + "\"";
}, $fz.isPrivate = true, $fz), "~S");
c$.isAS = $_M(c$, "isAS", 
function (x) {
{
return Clazz.isAS(x);
}}, "~O");
c$.isASS = $_M(c$, "isASS", 
function (x) {
{
return Clazz.isASS(x);
}}, "~O");
c$.isAP = $_M(c$, "isAP", 
function (x) {
{
return Clazz.isAP(x);
}}, "~O");
c$.isAF = $_M(c$, "isAF", 
function (x) {
{
return Clazz.isAF(x);
}}, "~O");
c$.isAFloat = $_M(c$, "isAFloat", 
function (x) {
{
return Clazz.isAFloat(x);
}}, "~O");
c$.isAD = $_M(c$, "isAD", 
function (x) {
{
return Clazz.isAF(x);
}}, "~O");
c$.isADD = $_M(c$, "isADD", 
function (x) {
{
return Clazz.isAFF(x);
}}, "~O");
c$.isAB = $_M(c$, "isAB", 
function (x) {
{
return Clazz.isAI(x);
}}, "~O");
c$.isAI = $_M(c$, "isAI", 
function (x) {
{
return Clazz.isAI(x);
}}, "~O");
c$.isAII = $_M(c$, "isAII", 
function (x) {
{
return Clazz.isAII(x);
}}, "~O");
c$.isAFF = $_M(c$, "isAFF", 
function (x) {
{
return Clazz.isAFF(x);
}}, "~O");
c$.isAFFF = $_M(c$, "isAFFF", 
function (x) {
{
return Clazz.isAFFF(x);
}}, "~O");
c$.escapeUrl = $_M(c$, "escapeUrl", 
function (url) {
url = JU.PT.rep (url, "\n", "");
url = JU.PT.rep (url, "%", "%25");
url = JU.PT.rep (url, "#", "%23");
url = JU.PT.rep (url, "[", "%5B");
url = JU.PT.rep (url, "]", "%5D");
url = JU.PT.rep (url, " ", "%20");
return url;
}, "~S");
c$.esc = $_M(c$, "esc", 
function (str) {
if (str == null || str.length == 0) return "\"\"";
var haveEscape = false;
var i = 0;
for (; i < "\\\\\tt\rr\nn\"\"".length; i += 2) if (str.indexOf ("\\\\\tt\rr\nn\"\"".charAt (i)) >= 0) {
haveEscape = true;
break;
}
if (haveEscape) while (i < "\\\\\tt\rr\nn\"\"".length) {
var pt = -1;
var ch = "\\\\\tt\rr\nn\"\"".charAt (i++);
var ch2 = "\\\\\tt\rr\nn\"\"".charAt (i++);
var sb =  new JU.SB ();
var pt0 = 0;
while ((pt = str.indexOf (ch, pt + 1)) >= 0) {
sb.append (str.substring (pt0, pt)).appendC ('\\').appendC (ch2);
pt0 = pt + 1;
}
sb.append (str.substring (pt0, str.length));
str = sb.toString ();
}
for (i = str.length; --i >= 0; ) if (str.charCodeAt (i) > 0x7F) {
var s = "0000" + Integer.toHexString (str.charCodeAt (i));
str = str.substring (0, i) + "\\u" + s.substring (s.length - 4) + str.substring (i + 1);
}
return "\"" + str + "\"";
}, "~S");
Clazz.defineStatics (c$,
"tensScale", [10, 100, 1000, 10000, 100000, 1000000],
"decimalScale", [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001, 0.0000001, 0.00000001, 0.000000001],
"FLOAT_MIN_SAFE", 2E-45,
"escapable", "\\\\\tt\rr\nn\"\"");
});
