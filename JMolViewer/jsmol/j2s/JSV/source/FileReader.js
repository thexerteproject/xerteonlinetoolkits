Clazz.declarePackage ("JSV.source");
Clazz.load (["J.adapter.smarter.JmolJDXMOLReader"], "JSV.source.FileReader", ["java.io.BufferedReader", "$.StringReader", "java.lang.Double", "$.Float", "java.util.Arrays", "$.Hashtable", "$.StringTokenizer", "JU.List", "$.PT", "$.SB", "JSV.api.JSVZipReader", "JSV.common.Coordinate", "$.JDXSpectrum", "$.JSVFileManager", "$.JSViewer", "$.PeakInfo", "JSV.exception.JSVException", "JSV.source.JDXDecompressor", "$.JDXSource", "$.JDXSourceStreamTokenizer", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.nmrMaxY = NaN;
this.source = null;
this.t = null;
this.errorLog = null;
this.obscure = false;
this.done = false;
this.isZipFile = false;
this.filePath = null;
this.loadImaginary = true;
this.firstSpec = 0;
this.lastSpec = 0;
this.nSpec = 0;
this.blockID = 0;
this.mpr = null;
this.reader = null;
this.modelSpectrum = null;
this.peakData = null;
Clazz.instantialize (this, arguments);
}, JSV.source, "FileReader", null, J.adapter.smarter.JmolJDXMOLReader);
Clazz.makeConstructor (c$, 
($fz = function (filePath, obscure, loadImaginary, iSpecFirst, iSpecLast, nmrNormalization) {
filePath = JU.PT.trimQuotes (filePath);
if (filePath != null && filePath.startsWith ("http://SIMULATION/")) this.nmrMaxY = 10000;
if (!Float.isNaN (nmrNormalization)) this.nmrMaxY = nmrNormalization;
this.filePath = filePath;
if (filePath != null && filePath.startsWith ("http://SIMULATION/")) filePath = JSV.common.JSVFileManager.getSimulationFileName (filePath);
this.obscure = obscure;
this.firstSpec = iSpecFirst;
this.lastSpec = iSpecLast;
this.loadImaginary = loadImaginary;
}, $fz.isPrivate = true, $fz), "~S,~B,~B,~N,~N,~N");
c$.createJDXSourceFromStream = $_M(c$, "createJDXSourceFromStream", 
function ($in, obscure, loadImaginary, nmrMaxY) {
return JSV.source.FileReader.createJDXSource (JSV.common.JSVFileManager.getBufferedReaderForInputStream ($in), "stream", obscure, loadImaginary, -1, -1, nmrMaxY);
}, "java.io.InputStream,~B,~B,~N");
c$.createJDXSource = $_M(c$, "createJDXSource", 
function (br, filePath, obscure, loadImaginary, iSpecFirst, iSpecLast, nmrMaxY) {
var header = null;
try {
if (br == null) br = JSV.common.JSVFileManager.getBufferedReaderFromName (filePath, "##TITLE");
br.mark (400);
var chs =  Clazz.newCharArray (400, '\0');
br.read (chs, 0, 400);
br.reset ();
header =  String.instantialize (chs);
var pt1 = header.indexOf ('#');
var pt2 = header.indexOf ('<');
if (pt1 < 0 || pt2 >= 0 && pt2 < pt1) {
var xmlType = header.toLowerCase ();
xmlType = (xmlType.contains ("<animl") || xmlType.contains ("<!doctype technique") ? "AnIML" : xmlType.contains ("xml-cml") ? "CML" : null);
var xmlSource = null;
if (xmlType != null) xmlSource = (JSV.common.JSViewer.getInterface ("JSV.source." + xmlType + "Reader")).getSource (filePath, br);
br.close ();
if (xmlSource == null) {
J.util.Logger.error (header + "...");
throw  new JSV.exception.JSVException ("File type not recognized");
}return xmlSource;
}return ( new JSV.source.FileReader (filePath, obscure, loadImaginary, iSpecFirst, iSpecLast, nmrMaxY)).getJDXSource (br);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
if (br != null) br.close ();
if (header != null) J.util.Logger.error (header + "...");
var s = e.getMessage ();
{
}throw  new JSV.exception.JSVException ("Error reading data: " + s);
} else {
throw e;
}
}
}, "java.io.BufferedReader,~S,~B,~B,~N,~N,~N");
$_M(c$, "getJDXSource", 
($fz = function (reader) {
this.source =  new JSV.source.JDXSource (0, this.filePath);
this.isZipFile = (Clazz.instanceOf (reader, JSV.api.JSVZipReader));
this.t =  new JSV.source.JDXSourceStreamTokenizer (reader);
this.errorLog =  new JU.SB ();
var label = null;
var isOK = false;
while (!this.done && "##TITLE".equals (this.t.peakLabel ())) {
isOK = true;
if (label != null && !this.isZipFile) this.errorLog.append ("Warning - file is a concatenation without LINK record -- does not conform to IUPAC standards!\n");
var spectrum =  new JSV.common.JDXSpectrum ();
var dataLDRTable =  new JU.List ();
while (!this.done && (label = this.t.getLabel ()) != null && !this.isEnd (label)) {
if (label.equals ("##DATATYPE") && this.t.getValue ().toUpperCase ().equals ("LINK")) {
this.getBlockSpectra (dataLDRTable);
spectrum = null;
continue;
}if (label.equals ("##NTUPLES") || label.equals ("##VARNAME")) {
this.getNTupleSpectra (dataLDRTable, spectrum, label);
spectrum = null;
continue;
}if (java.util.Arrays.binarySearch (JSV.source.FileReader.TABULAR_DATA_LABELS, label) > 0) {
this.setTabularDataType (spectrum, label);
if (!this.processTabularData (spectrum, dataLDRTable)) throw  new JSV.exception.JSVException ("Unable to read JDX file");
this.addSpectrum (spectrum, false);
spectrum = null;
continue;
}if (spectrum == null) spectrum =  new JSV.common.JDXSpectrum ();
if (this.readDataLabel (spectrum, label, this.t, this.errorLog, this.obscure)) continue;
var value = this.t.getValue ();
JSV.source.FileReader.addHeader (dataLDRTable, this.t.getRawLabel (), value);
if (this.checkCustomTags (spectrum, label, value)) continue;
}
}
if (!isOK) throw  new JSV.exception.JSVException ("##TITLE record not found");
this.source.setErrorLog (this.errorLog.toString ());
if (!Float.isNaN (this.nmrMaxY)) for (var i = this.source.getNumberOfSpectra (); --i >= 0; ) this.source.getJDXSpectrum (i).doNormalize (this.nmrMaxY);

return this.source;
}, $fz.isPrivate = true, $fz), "~O");
$_M(c$, "isEnd", 
($fz = function (label) {
if (!label.equals ("##END")) return false;
this.t.getValue ();
return true;
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "addSpectrum", 
($fz = function (spectrum, forceSub) {
if (!this.loadImaginary && spectrum.isImaginary ()) {
J.util.Logger.info ("FileReader skipping imaginary spectrum -- use LOADIMAGINARY TRUE to load this spectrum.");
return true;
}this.nSpec++;
if (this.firstSpec > 0 && this.nSpec < this.firstSpec) return true;
if (this.lastSpec > 0 && this.nSpec > this.lastSpec) return !(this.done = true);
spectrum.setBlockID (this.blockID);
this.source.addJDXSpectrum (null, spectrum, forceSub);
return true;
}, $fz.isPrivate = true, $fz), "JSV.common.JDXSpectrum,~B");
$_M(c$, "getBlockSpectra", 
($fz = function (sourceLDRTable) {
J.util.Logger.debug ("--JDX block start--");
var label = "";
var isNew = (this.source.type == 0);
var forceSub = false;
while ((label = this.t.getLabel ()) != null && !label.equals ("##TITLE")) {
if (isNew) {
if (!JSV.source.FileReader.readHeaderLabel (this.source, label, this.t, this.errorLog, this.obscure)) JSV.source.FileReader.addHeader (sourceLDRTable, this.t.getRawLabel (), this.t.getValue ());
} else {
this.t.getValue ();
}if (label.equals ("##BLOCKS")) {
var nBlocks = JU.PT.parseInt (this.t.getValue ());
if (nBlocks > 100 && this.firstSpec <= 0) forceSub = true;
}}
if (!"##TITLE".equals (label)) throw  new JSV.exception.JSVException ("Unable to read block source");
if (isNew) this.source.setHeaderTable (sourceLDRTable);
this.source.type = 1;
this.source.isCompoundSource = true;
var dataLDRTable;
var spectrum =  new JSV.common.JDXSpectrum ();
dataLDRTable =  new JU.List ();
this.readDataLabel (spectrum, label, this.t, this.errorLog, this.obscure);
try {
var tmp;
while ((tmp = this.t.getLabel ()) != null) {
if ("##END".equals (label) && this.isEnd (tmp)) {
J.util.Logger.debug ("##END= " + this.t.getValue ());
break;
}label = tmp;
if (java.util.Arrays.binarySearch (JSV.source.FileReader.TABULAR_DATA_LABELS, label) > 0) {
this.setTabularDataType (spectrum, label);
if (!this.processTabularData (spectrum, dataLDRTable)) throw  new JSV.exception.JSVException ("Unable to read Block Source");
continue;
}if (label.equals ("##DATATYPE") && this.t.getValue ().toUpperCase ().equals ("LINK")) {
this.getBlockSpectra (dataLDRTable);
spectrum = null;
label = null;
} else if (label.equals ("##NTUPLES") || label.equals ("##VARNAME")) {
this.getNTupleSpectra (dataLDRTable, spectrum, label);
spectrum = null;
label = "";
} else if (label.equals ("##JCAMPCS")) {
while (!(label = this.t.getLabel ()).equals ("##TITLE")) {
this.t.getValue ();
}
spectrum = null;
} else {
this.t.getValue ();
}if (this.done) break;
if (spectrum == null) {
spectrum =  new JSV.common.JDXSpectrum ();
dataLDRTable =  new JU.List ();
if (label === "") continue;
if (label == null) {
label = "##END";
continue;
}}if (this.readDataLabel (spectrum, label, this.t, this.errorLog, this.obscure)) continue;
if (this.isEnd (label)) {
if (spectrum.getXYCoords ().length > 0 && !this.addSpectrum (spectrum, forceSub)) return this.source;
spectrum =  new JSV.common.JDXSpectrum ();
dataLDRTable =  new JU.List ();
this.t.getValue ();
continue;
}var value = this.t.getValue ();
JSV.source.FileReader.addHeader (dataLDRTable, this.t.getRawLabel (), value);
if (this.checkCustomTags (spectrum, label, value)) continue;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
throw  new JSV.exception.JSVException (e.getMessage ());
} else {
throw e;
}
}
this.addErrorLogSeparator ();
this.source.setErrorLog (this.errorLog.toString ());
J.util.Logger.debug ("--JDX block end--");
return this.source;
}, $fz.isPrivate = true, $fz), "JU.List");
$_M(c$, "addErrorLogSeparator", 
($fz = function () {
if (this.errorLog.length () > 0 && this.errorLog.lastIndexOf ("=====================\n") != this.errorLog.length () - "=====================\n".length) this.errorLog.append ("=====================\n");
}, $fz.isPrivate = true, $fz));
$_M(c$, "getNTupleSpectra", 
($fz = function (sourceLDRTable, spectrum0, label) {
var minMaxY = [1.7976931348623157E308, 4.9E-324];
this.blockID = Math.random ();
var isOK = true;
if (this.firstSpec > 0) spectrum0.numDim = 1;
var isVARNAME = label.equals ("##VARNAME");
if (!isVARNAME) {
label = "";
this.t.getValue ();
}var nTupleTable =  new java.util.Hashtable ();
var plotSymbols =  new Array (2);
var isNew = (this.source.type == 0);
if (isNew) {
this.source.type = 2;
this.source.isCompoundSource = true;
this.source.setHeaderTable (sourceLDRTable);
}while (!(label = (isVARNAME ? label : this.t.getLabel ())).equals ("##PAGE")) {
isVARNAME = false;
var st =  new java.util.StringTokenizer (this.t.getValue (), ",");
var attrList =  new JU.List ();
while (st.hasMoreTokens ()) attrList.addLast (st.nextToken ().trim ());

nTupleTable.put (label, attrList);
}
var symbols = nTupleTable.get ("##SYMBOL");
if (!label.equals ("##PAGE")) throw  new JSV.exception.JSVException ("Error Reading NTuple Source");
var page = this.t.getValue ();
var spectrum = null;
var isFirst = true;
while (!this.done) {
if ((label = this.t.getLabel ()).equals ("##ENDNTUPLES")) {
this.t.getValue ();
break;
}if (label.equals ("##PAGE")) {
page = this.t.getValue ();
continue;
}if (spectrum == null) {
spectrum =  new JSV.common.JDXSpectrum ();
spectrum0.copyTo (spectrum);
spectrum.setTitle (spectrum0.getTitle ());
if (!spectrum.is1D ()) {
var pt = page.indexOf ('=');
if (pt >= 0) try {
spectrum.setY2D (Double.parseDouble (page.substring (pt + 1).trim ()));
var y2dUnits = page.substring (0, pt).trim ();
var i = symbols.indexOf (y2dUnits);
if (i >= 0) spectrum.setY2DUnits (nTupleTable.get ("##UNITS").get (i));
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
}}var dataLDRTable =  new JU.List ();
spectrum.setHeaderTable (dataLDRTable);
while (!label.equals ("##DATATABLE")) {
JSV.source.FileReader.addHeader (dataLDRTable, this.t.getRawLabel (), this.t.getValue ());
label = this.t.getLabel ();
}
var continuous = true;
var line = this.t.flushLine ();
if (line.trim ().indexOf ("PEAKS") > 0) continuous = false;
var index1 = line.indexOf ('(');
var index2 = line.lastIndexOf (')');
if (index1 == -1 || index2 == -1) throw  new JSV.exception.JSVException ("Variable List not Found");
var varList = line.substring (index1, index2 + 1);
var countSyms = 0;
for (var i = 0; i < symbols.size (); i++) {
var sym = symbols.get (i).trim ();
if (varList.indexOf (sym) != -1) {
plotSymbols[countSyms++] = sym;
}if (countSyms == 2) break;
}
this.setTabularDataType (spectrum, "##" + (continuous ? "XYDATA" : "PEAKTABLE"));
if (!this.readNTUPLECoords (spectrum, nTupleTable, plotSymbols, minMaxY)) throw  new JSV.exception.JSVException ("Unable to read Ntuple Source");
if (!spectrum.nucleusX.equals ("?")) spectrum0.nucleusX = spectrum.nucleusX;
spectrum0.nucleusY = spectrum.nucleusY;
spectrum0.freq2dX = spectrum.freq2dX;
spectrum0.freq2dY = spectrum.freq2dY;
spectrum0.y2DUnits = spectrum.y2DUnits;
for (var i = 0; i < sourceLDRTable.size (); i++) {
var entry = sourceLDRTable.get (i);
var key = JSV.source.JDXSourceStreamTokenizer.cleanLabel (entry[0]);
if (!key.equals ("##TITLE") && !key.equals ("##DATACLASS") && !key.equals ("##NTUPLES")) dataLDRTable.addLast (entry);
}
if (isOK) this.addSpectrum (spectrum, !isFirst);
isFirst = false;
spectrum = null;
}
this.addErrorLogSeparator ();
this.source.setErrorLog (this.errorLog.toString ());
J.util.Logger.info ("NTUPLE MIN/MAX Y = " + minMaxY[0] + " " + minMaxY[1]);
return this.source;
}, $fz.isPrivate = true, $fz), "JU.List,JSV.source.JDXDataObject,~S");
$_M(c$, "readDataLabel", 
($fz = function (spectrum, label, t, errorLog, obscure) {
if (JSV.source.FileReader.readHeaderLabel (spectrum, label, t, errorLog, obscure)) return true;
if (label.equals ("##MINX") || label.equals ("##MINY") || label.equals ("##MAXX") || label.equals ("##MAXY") || label.equals ("##FIRSTY") || label.equals ("##DELTAX") || label.equals ("##DATACLASS")) {
t.getValue ();
return true;
}if (label.equals ("##FIRSTX")) {
spectrum.fileFirstX = Double.parseDouble (t.getValue ());
return true;
}if (label.equals ("##LASTX")) {
spectrum.fileLastX = Double.parseDouble (t.getValue ());
return true;
}if (label.equals ("##NPOINTS")) {
spectrum.nPointsFile = Integer.parseInt (t.getValue ());
return true;
}if (label.equals ("##XFACTOR")) {
spectrum.xFactor = Double.parseDouble (t.getValue ());
return true;
}if (label.equals ("##YFACTOR")) {
spectrum.yFactor = Double.parseDouble (t.getValue ());
return true;
}if (label.equals ("##XUNITS")) {
spectrum.setXUnits (t.getValue ());
return true;
}if (label.equals ("##YUNITS")) {
spectrum.setYUnits (t.getValue ());
return true;
}if (label.equals ("##XLABEL")) {
spectrum.setXLabel (t.getValue ());
return false;
}if (label.equals ("##YLABEL")) {
spectrum.setYLabel (t.getValue ());
return false;
}if (label.equals ("##NUMDIM")) {
spectrum.numDim = Integer.parseInt (t.getValue ());
return true;
}if (label.equals ("##.OBSERVEFREQUENCY")) {
spectrum.observedFreq = Double.parseDouble (t.getValue ());
return true;
}if (label.equals ("##.OBSERVENUCLEUS")) {
spectrum.setObservedNucleus (t.getValue ());
return true;
}if (label.equals ("##$OFFSET") && spectrum.shiftRefType != 0) {
if (spectrum.offset == 1.7976931348623157E308) spectrum.offset = Double.parseDouble (t.getValue ());
spectrum.dataPointNum = 1;
spectrum.shiftRefType = 1;
return false;
}if ((label.equals ("##$REFERENCEPOINT")) && (spectrum.shiftRefType != 0)) {
spectrum.offset = Double.parseDouble (t.getValue ());
spectrum.dataPointNum = 1;
spectrum.shiftRefType = 2;
return false;
}if (label.equals ("##.SHIFTREFERENCE")) {
var val = t.getValue ();
if (!(spectrum.dataType.toUpperCase ().contains ("SPECTRUM"))) return true;
var srt =  new java.util.StringTokenizer (val, ",");
if (srt.countTokens () != 4) return true;
try {
srt.nextToken ();
srt.nextToken ();
spectrum.dataPointNum = Integer.parseInt (srt.nextToken ().trim ());
spectrum.offset = Double.parseDouble (srt.nextToken ().trim ());
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return true;
} else {
throw e;
}
}
if (spectrum.dataPointNum <= 0) spectrum.dataPointNum = 1;
spectrum.shiftRefType = 0;
return true;
}return false;
}, $fz.isPrivate = true, $fz), "JSV.source.JDXDataObject,~S,JSV.source.JDXSourceStreamTokenizer,JU.SB,~B");
c$.readHeaderLabel = $_M(c$, "readHeaderLabel", 
($fz = function (jdxHeader, label, t, errorLog, obscure) {
if (label.equals ("##TITLE")) {
var value = t.getValue ();
jdxHeader.setTitle (obscure || value == null || value.equals ("") ? "Unknown" : value);
return true;
}if (label.equals ("##JCAMPDX")) {
var value = t.getValue ();
jdxHeader.jcampdx = value;
var version = JU.PT.parseFloat (value);
if (version >= 6.0 || Float.isNaN (version)) {
if (errorLog != null) errorLog.append ("Warning: JCAMP-DX version may not be fully supported: " + value + "\n");
}return true;
}if (label.equals ("##ORIGIN")) {
var value = t.getValue ();
jdxHeader.origin = (value != null && !value.equals ("") ? value : "Unknown");
return true;
}if (label.equals ("##OWNER")) {
var value = t.getValue ();
jdxHeader.owner = (value != null && !value.equals ("") ? value : "Unknown");
return true;
}if (label.equals ("##DATATYPE")) {
jdxHeader.dataType = t.getValue ();
return true;
}if (label.equals ("##LONGDATE")) {
jdxHeader.longDate = t.getValue ();
return true;
}if (label.equals ("##DATE")) {
jdxHeader.date = t.getValue ();
return true;
}if (label.equals ("##TIME")) {
jdxHeader.time = t.getValue ();
return true;
}return false;
}, $fz.isPrivate = true, $fz), "JSV.source.JDXHeader,~S,JSV.source.JDXSourceStreamTokenizer,JU.SB,~B");
$_M(c$, "setTabularDataType", 
($fz = function (spectrum, label) {
if (label.equals ("##PEAKASSIGNMENTS")) spectrum.setDataClass ("PEAKASSIGNMENTS");
 else if (label.equals ("##PEAKTABLE")) spectrum.setDataClass ("PEAKTABLE");
 else if (label.equals ("##XYDATA")) spectrum.setDataClass ("XYDATA");
 else if (label.equals ("##XYPOINTS")) spectrum.setDataClass ("XYPOINTS");
}, $fz.isPrivate = true, $fz), "JSV.source.JDXDataObject,~S");
$_M(c$, "processTabularData", 
($fz = function (spec, table) {
if (spec.dataClass.equals ("PEAKASSIGNMENTS")) return true;
spec.setHeaderTable (table);
if (spec.dataClass.equals ("XYDATA")) {
spec.checkRequiredTokens ();
this.decompressData (spec, null);
return true;
}if (spec.dataClass.equals ("PEAKTABLE") || spec.dataClass.equals ("XYPOINTS")) {
spec.setContinuous (spec.dataClass.equals ("XYPOINTS"));
try {
this.t.readLineTrimmed ();
} catch (e) {
if (Clazz.exceptionOf (e, java.io.IOException)) {
} else {
throw e;
}
}
var xyCoords;
if (spec.xFactor != 1.7976931348623157E308 && spec.yFactor != 1.7976931348623157E308) xyCoords = JSV.common.Coordinate.parseDSV (this.t.getValue (), spec.xFactor, spec.yFactor);
 else xyCoords = JSV.common.Coordinate.parseDSV (this.t.getValue (), 1, 1);
spec.setXYCoords (xyCoords);
var fileDeltaX = JSV.common.Coordinate.deltaX (xyCoords[xyCoords.length - 1].getXVal (), xyCoords[0].getXVal (), xyCoords.length);
spec.setIncreasing (fileDeltaX > 0);
return true;
}return false;
}, $fz.isPrivate = true, $fz), "JSV.source.JDXDataObject,JU.List");
$_M(c$, "readNTUPLECoords", 
($fz = function (spec, nTupleTable, plotSymbols, minMaxY) {
var list;
if (spec.dataClass.equals ("XYDATA")) {
list = nTupleTable.get ("##SYMBOL");
var index1 = list.indexOf (plotSymbols[0]);
var index2 = list.indexOf (plotSymbols[1]);
list = nTupleTable.get ("##VARNAME");
spec.varName = list.get (index2).toUpperCase ();
list = nTupleTable.get ("##FACTOR");
spec.xFactor = Double.parseDouble (list.get (index1));
spec.yFactor = Double.parseDouble (list.get (index2));
list = nTupleTable.get ("##LAST");
spec.fileLastX = Double.parseDouble (list.get (index1));
list = nTupleTable.get ("##FIRST");
spec.fileFirstX = Double.parseDouble (list.get (index1));
list = nTupleTable.get ("##VARDIM");
spec.nPointsFile = Integer.parseInt (list.get (index1));
list = nTupleTable.get ("##UNITS");
spec.setXUnits (list.get (index1));
spec.setYUnits (list.get (index2));
if (spec.nucleusX == null && (list = nTupleTable.get ("##.NUCLEUS")) != null) {
spec.setNucleusAndFreq (list.get (0), false);
spec.setNucleusAndFreq (list.get (index1), true);
} else {
if (spec.nucleusX == null) spec.nucleusX = "?";
}this.decompressData (spec, minMaxY);
return true;
}if (spec.dataClass.equals ("PEAKTABLE") || spec.dataClass.equals ("XYPOINTS")) {
spec.setContinuous (spec.dataClass.equals ("XYPOINTS"));
list = nTupleTable.get ("##SYMBOL");
var index1 = list.indexOf (plotSymbols[0]);
var index2 = list.indexOf (plotSymbols[1]);
list = nTupleTable.get ("##UNITS");
spec.setXUnits (list.get (index1));
spec.setYUnits (list.get (index2));
spec.setXYCoords (JSV.common.Coordinate.parseDSV (this.t.getValue (), spec.xFactor, spec.yFactor));
return true;
}return false;
}, $fz.isPrivate = true, $fz), "JSV.source.JDXDataObject,java.util.Map,~A,~A");
$_M(c$, "decompressData", 
($fz = function (spec, minMaxY) {
var errPt = this.errorLog.length ();
var fileDeltaX = JSV.common.Coordinate.deltaX (spec.fileLastX, spec.fileFirstX, spec.nPointsFile);
spec.setIncreasing (fileDeltaX > 0);
spec.setContinuous (true);
var decompressor =  new JSV.source.JDXDecompressor (this.t, spec.fileFirstX, spec.xFactor, spec.yFactor, fileDeltaX, spec.nPointsFile);
var firstLastX =  Clazz.newDoubleArray (2, 0);
var t = System.currentTimeMillis ();
var xyCoords = decompressor.decompressData (this.errorLog, firstLastX);
if (J.util.Logger.debugging) J.util.Logger.debug ("decompression time = " + (System.currentTimeMillis () - t) + " ms");
spec.setXYCoords (xyCoords);
var d = decompressor.getMinY ();
if (minMaxY != null) {
if (d < minMaxY[0]) minMaxY[0] = d;
d = decompressor.getMaxY ();
if (d > minMaxY[1]) minMaxY[1] = d;
}var freq = (Double.isNaN (spec.freq2dX) ? spec.observedFreq : spec.freq2dX);
if (spec.offset != 1.7976931348623157E308 && freq != 1.7976931348623157E308 && spec.dataType.toUpperCase ().contains ("SPECTRUM")) {
JSV.common.Coordinate.applyShiftReference (xyCoords, spec.dataPointNum, spec.fileFirstX, spec.fileLastX, spec.offset, freq, spec.shiftRefType);
}if (freq != 1.7976931348623157E308 && spec.getXUnits ().toUpperCase ().equals ("HZ")) {
var xScale = freq;
JSV.common.Coordinate.applyScale (xyCoords, (1 / xScale), 1);
spec.setXUnits ("PPM");
spec.setHZtoPPM (true);
}if (this.errorLog.length () != errPt) {
this.errorLog.append (spec.getTitle ()).append ("\n");
this.errorLog.append ("firstX: " + spec.fileFirstX + " Found " + firstLastX[0] + "\n");
this.errorLog.append ("lastX from Header " + spec.fileLastX + " Found " + firstLastX[1] + "\n");
this.errorLog.append ("deltaX from Header " + fileDeltaX + "\n");
this.errorLog.append ("Number of points in Header " + spec.nPointsFile + " Found " + xyCoords.length + "\n");
} else {
}if (J.util.Logger.debugging) {
System.err.println (this.errorLog.toString ());
}}, $fz.isPrivate = true, $fz), "JSV.source.JDXDataObject,~A");
c$.addHeader = $_M(c$, "addHeader", 
function (table, label, value) {
var entry;
for (var i = 0; i < table.size (); i++) if ((entry = table.get (i))[0].equals (label)) {
entry[1] = value;
return;
}
table.addLast ([label, value, JSV.source.JDXSourceStreamTokenizer.cleanLabel (label)]);
}, "JU.List,~S,~S");
$_M(c$, "checkCustomTags", 
($fz = function (spectrum, label, value) {
this.modelSpectrum = spectrum;
var pt = "##$MODELS ##$PEAKS  ##$SIGNALS".indexOf (label);
if (pt < 0) return false;
if (this.mpr == null) this.mpr = (JSV.common.JSViewer.getInterface ("J.jsv.JDXMOLParser")).set (this, this.filePath, null);
try {
this.reader =  new java.io.BufferedReader ( new java.io.StringReader (value));
switch (pt) {
case 0:
this.mpr.readModels ();
break;
case 10:
case 20:
this.peakData =  new JU.List ();
this.source.peakCount += this.mpr.readPeaks (pt == 20, this.source.peakCount);
break;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
throw  new JSV.exception.JSVException (e.getMessage ());
} else {
throw e;
}
} finally {
this.reader = null;
this.modelSpectrum = null;
}
return true;
}, $fz.isPrivate = true, $fz), "JSV.common.JDXSpectrum,~S,~S");
$_V(c$, "readLine", 
function () {
return this.reader.readLine ();
});
$_V(c$, "setSpectrumPeaks", 
function (nH, piUnitsX, piUnitsY) {
this.modelSpectrum.setPeakList (this.peakData, piUnitsX, piUnitsY);
this.modelSpectrum.setNHydrogens (nH);
}, "~N,~S,~S");
$_V(c$, "addPeakData", 
function (info) {
if (this.peakData == null) this.peakData =  new JU.List ();
this.peakData.addLast ( new JSV.common.PeakInfo (info));
}, "~S");
$_V(c$, "processModelData", 
function (id, data, type, base, last, vibScale, isFirst) {
}, "~S,~S,~S,~S,~S,~N,~B");
$_V(c$, "discardLinesUntilContains", 
function (containsMatch) {
var line;
while ((line = this.readLine ()) != null && line.indexOf (containsMatch) < 0) {
}
return line;
}, "~S");
$_V(c$, "discardLinesUntilContains2", 
function (s1, s2) {
var line;
while ((line = this.readLine ()) != null && line.indexOf (s1) < 0 && line.indexOf (s2) < 0) {
}
return line;
}, "~S,~S");
$_V(c$, "discardLinesUntilNonBlank", 
function () {
var line;
while ((line = this.readLine ()) != null && line.trim ().length == 0) {
}
return line;
});
Clazz.defineStatics (c$,
"VAR_LIST_TABLE", [["PEAKTABLE", "XYDATA", "XYPOINTS"], ["(XY..XY)", "(X++(Y..Y))", "(XY..XY)"]],
"ERROR_SEPARATOR", "=====================\n",
"TABULAR_DATA_LABELS", ["##DATATABLE", "##PEAKASSIGNMENTS", "##PEAKTABLE", "##XYDATA", "##XYPOINTS"]);
});
