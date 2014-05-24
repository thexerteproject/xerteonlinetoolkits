Clazz.declarePackage ("J.image");
Clazz.load (["J.api.JmolImageEncoder"], "J.image.ImageEncoder", ["JU.PT"], function () {
c$ = Clazz.decorateAsClass (function () {
this.out = null;
this.width = -1;
this.height = -1;
this.quality = -1;
this.date = null;
this.errRet = null;
this.pixels = null;
Clazz.instantialize (this, arguments);
}, J.image, "ImageEncoder", null, J.api.JmolImageEncoder);
$_V(c$, "createImage", 
function (apiPlatform, type, objImage, out, params, errRet) {
this.out = out;
this.errRet = errRet;
try {
this.width = (JU.PT.isAI (objImage) ? (params.get ("width")).intValue () : apiPlatform.getImageWidth (objImage));
this.height = (JU.PT.isAI (objImage) ? (params.get ("height")).intValue () : apiPlatform.getImageHeight (objImage));
this.date = params.get ("date");
var q = params.get ("quality");
this.quality = (q == null ? -1 : q.intValue ());
this.setParams (params);
this.encodeImage (apiPlatform, objImage);
this.generate ();
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
errRet[0] = e.toString ();
out.cancel ();
} else {
throw e;
}
} finally {
this.close ();
}
return (errRet[0] == null);
}, "javajs.api.GenericPlatform,~S,~O,JU.OC,java.util.Map,~A");
$_M(c$, "encodeImage", 
function (apiPlatform, objImage) {
if (JU.PT.isAI (objImage)) {
this.pixels = objImage;
} else {
{
pixels = null;
}this.pixels = apiPlatform.grabPixels (objImage, this.width, this.height, this.pixels, 0, this.height);
}}, "javajs.api.GenericPlatform,~O");
$_M(c$, "putString", 
function (str) {
this.out.append (str);
}, "~S");
$_M(c$, "putByte", 
function (b) {
this.out.writeByteAsInt (b);
}, "~N");
$_M(c$, "close", 
function () {
this.out.closeChannel ();
});
});
