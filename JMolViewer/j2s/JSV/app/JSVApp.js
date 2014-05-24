Clazz.declarePackage ("JSV.app");
Clazz.load (["JSV.api.JSVAppInterface", "$.PanelListener"], "JSV.app.JSVApp", ["java.lang.Boolean", "$.Double", "JU.List", "$.PT", "JSV.common.Coordinate", "$.JSVFileManager", "$.JSViewer", "$.Parameters", "$.PeakPickEvent", "$.ScriptToken", "$.ScriptTokenizer", "$.SubSpecChangeEvent", "$.ZoomEvent", "J.util.Logger"], function () {
c$ = Clazz.decorateAsClass (function () {
this.appletFrame = null;
this.isNewWindow = false;
this.allowCompoundMenu = true;
this.allowMenu = true;
this.initialStartIndex = -1;
this.initialEndIndex = -1;
this.appletReadyCallbackFunctionName = null;
this.coordCallbackFunctionName = null;
this.loadFileCallbackFunctionName = null;
this.peakCallbackFunctionName = null;
this.syncCallbackFunctionName = null;
this.viewer = null;
this.prevPanel = null;
Clazz.instantialize (this, arguments);
}, JSV.app, "JSVApp", null, [JSV.api.PanelListener, JSV.api.JSVAppInterface]);
Clazz.makeConstructor (c$, 
function (appletFrame, isJS) {
this.appletFrame = appletFrame;
this.initViewer (isJS);
this.initParams (appletFrame.getParameter ("script"));
}, "JSV.api.AppletFrame,~B");
$_M(c$, "initViewer", 
($fz = function (isJS) {
this.viewer =  new JSV.common.JSViewer (this, true, isJS);
this.appletFrame.setDropTargetListener (this.isSigned (), this.viewer);
var path = this.appletFrame.getDocumentBase ();
JSV.common.JSVFileManager.setDocumentBase (this.viewer, path);
}, $fz.isPrivate = true, $fz), "~B");
$_V(c$, "isPro", 
function () {
return this.isSigned ();
});
$_V(c$, "isSigned", 
function () {
{
return true;
}});
$_M(c$, "getAppletFrame", 
function () {
return this.appletFrame;
});
$_M(c$, "dispose", 
function () {
try {
this.viewer.dispose ();
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
e.printStackTrace ();
} else {
throw e;
}
}
});
$_V(c$, "getPropertyAsJavaObject", 
function (key) {
return this.viewer.getPropertyAsJavaObject (key);
}, "~S");
$_V(c$, "getPropertyAsJSON", 
function (key) {
return JU.PT.toJSON (null, this.getPropertyAsJavaObject (key));
}, "~S");
$_V(c$, "getCoordinate", 
function () {
return this.viewer.getCoordinate ();
});
$_V(c$, "loadInline", 
function (data) {
this.siOpenDataOrFile (data, null, null, null, -1, -1, true, null, null);
this.appletFrame.validateContent (3);
}, "~S");
$_V(c$, "exportSpectrum", 
function (type, n) {
return this.viewer.$export (type, n);
}, "~S,~N");
$_V(c$, "setFilePath", 
function (tmpFilePath) {
this.runScript ("load " + JU.PT.esc (tmpFilePath));
}, "~S");
$_V(c$, "setSpectrumNumber", 
function (n) {
this.runScript (JSV.common.ScriptToken.SPECTRUMNUMBER + " " + n);
}, "~N");
$_V(c$, "reversePlot", 
function () {
this.toggle (JSV.common.ScriptToken.REVERSEPLOT);
});
$_V(c$, "toggleGrid", 
function () {
this.toggle (JSV.common.ScriptToken.GRIDON);
});
$_V(c$, "toggleCoordinate", 
function () {
this.toggle (JSV.common.ScriptToken.COORDINATESON);
});
$_V(c$, "toggleIntegration", 
function () {
this.toggle (JSV.common.ScriptToken.INTEGRATE);
});
$_M(c$, "toggle", 
($fz = function (st) {
var jsvp = this.viewer.selectedPanel;
if (jsvp != null) this.runScript (st + " TOGGLE");
}, $fz.isPrivate = true, $fz), "JSV.common.ScriptToken");
$_V(c$, "addHighlight", 
function (x1, x2, r, g, b, a) {
this.viewer.addHighLight (x1, x2, r, g, b, a);
}, "~N,~N,~N,~N,~N,~N");
$_V(c$, "removeAllHighlights", 
function () {
this.viewer.removeAllHighlights ();
});
$_V(c$, "removeHighlight", 
function (x1, x2) {
this.viewer.removeHighlight (x1, x2);
}, "~N,~N");
$_V(c$, "syncScript", 
function (peakScript) {
this.viewer.syncScript (peakScript);
}, "~S");
$_V(c$, "writeStatus", 
function (msg) {
J.util.Logger.info (msg);
}, "~S");
$_M(c$, "initParams", 
function (params) {
this.parseInitScript (params);
this.newAppletPanel ();
this.viewer.setPopupMenu (this.allowMenu, this.viewer.parameters.getBoolean (JSV.common.ScriptToken.ENABLEZOOM));
if (this.allowMenu) {
this.viewer.closeSource (null);
}this.runScriptNow (params);
}, "~S");
$_M(c$, "newAppletPanel", 
($fz = function () {
J.util.Logger.info ("newAppletPanel");
this.appletFrame.createMainPanel (this.viewer);
}, $fz.isPrivate = true, $fz));
$_V(c$, "repaint", 
function () {
{
if (typeof Jmol != "undefined" && Jmol._repaint && this.viewer.applet)
Jmol._repaint(this.viewer.applet,true);
}});
$_M(c$, "updateJS", 
function (width, height) {
}, "~N,~N");
$_M(c$, "parseInitScript", 
($fz = function (params) {
if (params == null) params = "";
var allParamTokens =  new JSV.common.ScriptTokenizer (params, true);
if (J.util.Logger.debugging) {
J.util.Logger.info ("Running in DEBUG mode");
}while (allParamTokens.hasMoreTokens ()) {
var token = allParamTokens.nextToken ();
var eachParam =  new JSV.common.ScriptTokenizer (token, false);
var key = eachParam.nextToken ();
if (key.equalsIgnoreCase ("SET")) key = eachParam.nextToken ();
key = key.toUpperCase ();
var st = JSV.common.ScriptToken.getScriptToken (key);
var value = JSV.common.ScriptToken.getValue (st, eachParam, token);
J.util.Logger.info ("KEY-> " + key + " VALUE-> " + value + " : " + st);
try {
switch (st) {
default:
this.viewer.parameters.set (null, st, value);
break;
case JSV.common.ScriptToken.UNKNOWN:
break;
case JSV.common.ScriptToken.APPLETID:
this.viewer.fullName = this.viewer.appletID + "__" + (this.viewer.appletID = value) + "__";
{
if(typeof Jmol != "undefined") this.viewer.applet =
Jmol._applets[value];
}break;
case JSV.common.ScriptToken.APPLETREADYCALLBACKFUNCTIONNAME:
this.appletReadyCallbackFunctionName = value;
break;
case JSV.common.ScriptToken.AUTOINTEGRATE:
this.viewer.autoIntegrate = JSV.common.Parameters.isTrue (value);
break;
case JSV.common.ScriptToken.COMPOUNDMENUON:
this.allowCompoundMenu = Boolean.parseBoolean (value);
break;
case JSV.common.ScriptToken.COORDCALLBACKFUNCTIONNAME:
case JSV.common.ScriptToken.LOADFILECALLBACKFUNCTIONNAME:
case JSV.common.ScriptToken.PEAKCALLBACKFUNCTIONNAME:
case JSV.common.ScriptToken.SYNCCALLBACKFUNCTIONNAME:
this.siExecSetCallback (st, value);
break;
case JSV.common.ScriptToken.ENDINDEX:
this.initialEndIndex = Integer.parseInt (value);
break;
case JSV.common.ScriptToken.INTERFACE:
this.viewer.checkOvelayInterface (value);
break;
case JSV.common.ScriptToken.IRMODE:
this.viewer.setIRmode (value);
break;
case JSV.common.ScriptToken.MENUON:
this.allowMenu = Boolean.parseBoolean (value);
break;
case JSV.common.ScriptToken.OBSCURE:
if (this.viewer.obscureTitleFromUser == null) this.viewer.obscureTitleFromUser = Boolean.$valueOf (value);
break;
case JSV.common.ScriptToken.STARTINDEX:
this.initialStartIndex = Integer.parseInt (value);
break;
case JSV.common.ScriptToken.SYNCID:
this.viewer.fullName = this.viewer.appletID + "__" + (this.viewer.syncID = value) + "__";
break;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
}
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "runScriptNow", 
function (params) {
return this.viewer.runScriptNow (params);
}, "~S");
$_M(c$, "checkCallbacks", 
($fz = function () {
if (this.coordCallbackFunctionName == null && this.peakCallbackFunctionName == null) return;
var coord =  new JSV.common.Coordinate ();
var actualCoord = (this.peakCallbackFunctionName == null ? null :  new JSV.common.Coordinate ());
if (!this.viewer.pd ().getPickedCoordinates (coord, actualCoord)) return;
var iSpec = this.viewer.mainPanel.getCurrentPanelIndex ();
if (actualCoord == null) this.appletFrame.callToJavaScript (this.coordCallbackFunctionName, [Double.$valueOf (coord.getXVal ()), Double.$valueOf (coord.getYVal ()), Integer.$valueOf (iSpec + 1)]);
 else this.appletFrame.callToJavaScript (this.peakCallbackFunctionName, [Double.$valueOf (coord.getXVal ()), Double.$valueOf (coord.getYVal ()), Double.$valueOf (actualCoord.getXVal ()), Double.$valueOf (actualCoord.getYVal ()), Integer.$valueOf (iSpec + 1)]);
}, $fz.isPrivate = true, $fz));
$_M(c$, "doAdvanced", 
function (filePath) {
}, "~S");
$_V(c$, "panelEvent", 
function (eventObj) {
if (Clazz.instanceOf (eventObj, JSV.common.PeakPickEvent)) {
this.viewer.processPeakPickEvent (eventObj, false);
} else if (Clazz.instanceOf (eventObj, JSV.common.ZoomEvent)) {
} else if (Clazz.instanceOf (eventObj, JSV.common.SubSpecChangeEvent)) {
}}, "~O");
$_V(c$, "getSolnColour", 
function () {
return this.viewer.getSolutionColor ();
});
$_M(c$, "updateJSView", 
($fz = function (msg) {
{
this.viewer.applet && this.viewer.applet._viewSet != null && this.viewer.applet._updateView(this.viewer.seletedPanel, msg);
}}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "syncToJmol", 
function (msg) {
this.updateJSView (msg);
if (this.syncCallbackFunctionName == null) return;
J.util.Logger.info ("JSVApp.syncToJmol JSV>Jmol " + msg);
this.appletFrame.callToJavaScript (this.syncCallbackFunctionName, [this.viewer.fullName, msg]);
}, "~S");
$_V(c$, "setVisible", 
function (b) {
this.appletFrame.setPanelVisible (b);
}, "~B");
$_V(c$, "setCursor", 
function (id) {
this.viewer.apiPlatform.setCursor (id, this.appletFrame);
}, "~N");
$_V(c$, "runScript", 
function (script) {
this.viewer.runScript (script);
}, "~S");
$_V(c$, "getScriptQueue", 
function () {
return this.viewer.scriptQueue;
});
$_V(c$, "siSetCurrentSource", 
function (source) {
this.viewer.currentSource = source;
}, "JSV.source.JDXSource");
$_V(c$, "siSendPanelChange", 
function () {
if (this.viewer.selectedPanel === this.prevPanel) return;
this.prevPanel = this.viewer.selectedPanel;
this.viewer.sendPanelChange ();
});
$_V(c$, "siNewWindow", 
function (isSelected, fromFrame) {
this.isNewWindow = isSelected;
if (fromFrame) {
if (this.viewer.jsvpPopupMenu != null) this.viewer.jsvpPopupMenu.setSelected ("Window", false);
} else {
this.appletFrame.newWindow (isSelected);
}}, "~B,~B");
$_V(c$, "siValidateAndRepaint", 
function (isAll) {
var pd;
if (this.viewer.selectedPanel != null && (pd = this.viewer.pd ()) != null) pd.taintedAll = true;
this.appletFrame.validate ();
this.repaint ();
}, "~B");
$_V(c$, "siSyncLoad", 
function (filePath) {
this.newAppletPanel ();
J.util.Logger.info ("JSVP syncLoad reading " + filePath);
this.siOpenDataOrFile (null, null, null, filePath, -1, -1, false, null, null);
this.appletFrame.validateContent (3);
}, "~S");
$_V(c$, "siOpenDataOrFile", 
function (data, name, specs, url, firstSpec, lastSpec, isAppend, script, id) {
switch (this.viewer.openDataOrFile (data, name, specs, url, firstSpec, lastSpec, isAppend, id)) {
case 0:
if (script != null) this.runScript (script);
break;
case -1:
return;
default:
this.siSetSelectedPanel (null);
return;
}
if (this.viewer.jsvpPopupMenu != null) this.viewer.jsvpPopupMenu.setCompoundMenu (this.viewer.panelNodes, this.allowCompoundMenu);
J.util.Logger.info (this.appletFrame.getAppletInfo () + " File " + this.viewer.currentSource.getFilePath () + " Loaded Successfully");
}, "~S,~S,JU.List,~S,~N,~N,~B,~S,~S");
$_V(c$, "siProcessCommand", 
function (scriptItem) {
this.viewer.runScriptNow (scriptItem);
}, "~S");
$_V(c$, "siSetSelectedPanel", 
function (jsvp) {
this.viewer.mainPanel.setSelectedPanel (this.viewer, jsvp, this.viewer.panelNodes);
this.viewer.selectedPanel = jsvp;
this.viewer.spectraTree.setSelectedPanel (this, jsvp);
if (jsvp == null) {
this.viewer.selectedPanel = jsvp = this.appletFrame.getJSVPanel (this.viewer, null, -1, -1);
this.viewer.mainPanel.setSelectedPanel (this.viewer, jsvp, null);
}this.appletFrame.validate ();
if (jsvp != null) {
jsvp.setEnabled (true);
jsvp.setFocusable (true);
}}, "JSV.api.JSVPanel");
$_V(c$, "siExecSetCallback", 
function (st, value) {
switch (st) {
case JSV.common.ScriptToken.LOADFILECALLBACKFUNCTIONNAME:
this.loadFileCallbackFunctionName = value;
break;
case JSV.common.ScriptToken.PEAKCALLBACKFUNCTIONNAME:
this.peakCallbackFunctionName = value;
break;
case JSV.common.ScriptToken.SYNCCALLBACKFUNCTIONNAME:
this.syncCallbackFunctionName = value;
break;
case JSV.common.ScriptToken.COORDCALLBACKFUNCTIONNAME:
this.coordCallbackFunctionName = value;
break;
}
}, "JSV.common.ScriptToken,~S");
$_V(c$, "siLoaded", 
function (value) {
if (this.loadFileCallbackFunctionName != null) this.appletFrame.callToJavaScript (this.loadFileCallbackFunctionName, [this.viewer.appletID, value]);
this.updateJSView (null);
return null;
}, "~S");
$_V(c$, "siExecHidden", 
function (b) {
}, "~B");
$_V(c$, "siExecScriptComplete", 
function (msg, isOK) {
this.viewer.showMessage (msg);
this.siValidateAndRepaint (false);
}, "~S,~B");
$_V(c$, "siUpdateBoolean", 
function (st, TF) {
}, "JSV.common.ScriptToken,~B");
$_V(c$, "siCheckCallbacks", 
function (title) {
this.checkCallbacks ();
}, "~S");
$_V(c$, "siNodeSet", 
function (panelNode) {
this.appletFrame.validateContent (2);
this.siValidateAndRepaint (false);
}, "JSV.common.PanelNode");
$_V(c$, "siSourceClosed", 
function (source) {
}, "JSV.source.JDXSource");
$_V(c$, "siGetNewJSVPanel2", 
function (specs) {
if (specs == null) {
this.initialEndIndex = this.initialStartIndex = -1;
return this.appletFrame.getJSVPanel (this.viewer, null, -1, -1);
}var jsvp = this.appletFrame.getJSVPanel (this.viewer, specs, this.initialStartIndex, this.initialEndIndex);
this.initialEndIndex = this.initialStartIndex = -1;
jsvp.getPanelData ().addListener (this);
this.viewer.parameters.setFor (jsvp, null, true);
return jsvp;
}, "JU.List");
$_V(c$, "siGetNewJSVPanel", 
function (spec) {
if (spec == null) {
this.initialEndIndex = this.initialStartIndex = -1;
return null;
}var specs =  new JU.List ();
specs.addLast (spec);
var jsvp = this.appletFrame.getJSVPanel (this.viewer, specs, this.initialStartIndex, this.initialEndIndex);
jsvp.getPanelData ().addListener (this);
this.viewer.parameters.setFor (jsvp, null, true);
return jsvp;
}, "JSV.common.JDXSpectrum");
$_V(c$, "siSetPropertiesFromPreferences", 
function (jsvp, includeMeasures) {
this.viewer.checkAutoIntegrate ();
}, "JSV.api.JSVPanel,~B");
$_V(c$, "siSetLoaded", 
function (fileName, filePath) {
}, "~S,~S");
$_V(c$, "siSetMenuEnables", 
function (node, isSplit) {
}, "JSV.common.PanelNode,~B");
$_V(c$, "siUpdateRecentMenus", 
function (filePath) {
}, "~S");
$_V(c$, "siExecTest", 
function (value) {
var data = "";
this.loadInline (data);
}, "~S");
});
