//  JSmolJME.js   Bob Hanson hansonr@stolaf.edu  6/14/2012 and 3/20/2013

// see http://peter-ertl.com/jsme/JSME_2013-10-13/api_javadoc/index.html


// BH 1/27/2014 8:37:06 AM adding Info.viewSet  
// BH 12/4/2013 7:44:26 PM fix for JME independent search box

/*

	Only HTML5 version (JSME) is supported.

	JME 2D option -- use 

		Jmol.getJMEApplet(id, Info)
		Jmol.getJMEApplet(id, Info, linkedApplet)

	no option for getJMEAppletHtml(), but instead we indicate the
	target div using Info.divId.

	linkedApplet puts JME into INFO block for that applet; 
	use Jmol.showInfo(jme,true/false) to show/hide JME applet with id "jme"

	JME licensing: http://www.molinspiration.com/jme/doc/index.html
	note that required boilerplate: "JME Editor courtesy of Peter Ertl, Novartis"

	API includes:

	Jmol.jmeSmiles = function(jme, withStereoChemistry); 

		// returns SMILES string

	Jmol.jmeGetFile = function(jme, asJME)

		// retrieves structure as JME or MOL data

	Jmol.jmeReadMolecule = function(jme, jmeOrMolData); 

		// loads JME or MOL data into the app
		// JME data is recognized as a single line with no line ending


	Jmol.jmeReset = function(jme);

		// clears the app

	Jmol.jmeOptions = function(jme, options);

			 
	All other methods are private to JSmolJME.js




*/


;(function (Jmol, document) {

	Jmol._JMEApplet = function(id, Info, linkedApplet, checkOnly) {
		this._isJME = true;
		this._isJava = false;//(Info.use && (Info.use.toUpperCase() != "HTML5"))
		this._jmolType = "Jmol._JME" + (this._isJava ? "(JAVA)" : "(HTML5)");
		this._viewType = "JME";
		if (checkOnly)
			return this;
		window[id] = this;
		Jmol._setObject(this, id, Info);
		this._options = Info.options;
		(this._options.indexOf("autoez") < 0) && (this._options += ",autoez");
		if (this._viewSet != null) {
			this._options += ",star";
		}
		var jmol = this._linkedApplet = linkedApplet;
		this._hasOptions = Info.addSelectionOptions;
		this._readyFunction = Info.readyFunction;
		this._ready = false; 
 		this._jarPath = Info.jarPath;
		this._jarFile = Info.jarFile;
		if (jmol)
			this._console = jmol._console;
		Jmol._setConsoleDiv(this._console);
		this._isEmbedded = !Info.divId;
		this._divId = Info.divId || this._id + "_jmeappletdiv";
 		if (Jmol._document) {
			if (jmol) {
				jmol._2dapplet = this;
				var id = jmol._id + "_2dappletdiv";
				if (this._isEmbedded)
					this._divId = id;
				var d = Jmol._document;
				Jmol._document = null;
				Jmol.$html(this._divId, this.create());
				Jmol._document = d;
				this.__showContainer(false, false);
			} else {
				this.create();
			}
		}
		return this;
	}

	Jmol._JMEApplet._get = function(id, Info, linkedApplet, checkOnly) {

	// requires JmolJME.js and JME.jar
	// Jmol.getJMEApplet("jme", Info)
	// window.JME will be created as the return to this function

		Info || (Info = {});
		var DefaultInfo = {
			width: 300,
			height: 300,
			jarPath: "jme",
			jarFile: "JME.jar",
			use: "HTML5",
			structureChangedCallback: null, // could be myFunction(); first parameter will be reference to this object  
			options: "autoez"
			// see http://www2.chemie.uni-erlangen.de/services/fragment/editor/jme_functions.html
			// rbutton, norbutton - show / hide R button
			// hydrogens, nohydrogens - display / hide hydrogens
			// query, noquery - enable / disable query features
			// autoez, noautoez - automatic generation of SMILES with E,Z stereochemistry
			// nocanonize - SMILES canonicalization and detection of aromaticity supressed
			// nostereo - stereochemistry not considered when creating SMILES
			// reaction, noreaction - enable / disable reaction input
			// multipart - possibility to enter multipart structures
			// number - possibility to number (mark) atoms
			// depict - the applet will appear without editing butons,this is used for structure display only
		};		
		Jmol._addDefaultInfo(Info, DefaultInfo);
		if (!Jmol.featureDetection.allowHTML5)Info.use = "JAVA";
		var applet = new Jmol._JMEApplet(id, Info, linkedApplet, checkOnly);
		return (checkOnly ? applet : Jmol._registerApplet(id, applet));  
	}

	jsmeOnLoad = Jmol._JMEApplet.onload = function() {
		for (var i in Jmol._applets) {
			var app = Jmol._applets[i]
			if (app._isJME && !app._isJava && !app._ready) {
				app._applet = new JSApplet.JSME(app._divId, app.__Info);
				app._applet.options(app._options);
				var f = "";
				if (app._viewSet) {
					f = "(function(){" + app._id + "._atomPickedCallback()})";
				} else if (app.__Info.structureChangedCallback) {
					f = "(function(){"+app.__Info.structureChangedCallback.replace(/\(\)/, "(" + app._id + ")") + "})";
				}
				if (f) 
					app._applet.setNotifyStructuralChangeJSfunction(f);
				app._ready = true;
				if (app._isEmbedded && app._linkedApplet._ready && app.__Info.visible)
					app._linkedApplet.show2d(true);
				Jmol._setReady(app);
			}
		}
	}   

;(function(proto){

	proto.create = function() {
		var s = "";
		if (this._isJava) {
			var w = (this._linkedApplet ? "2px" : this._containerWidth);
			var h = (this._linkedApplet ? "2px" : this._containerHeight);
			s = '<applet code="JME.class" id="' + this._id + '_object" name="' + this._id 
				+ '_object" archive="' + this._jarFile + '" codebase="' + this._jarPath + '" width="'+w+'" height="'+h+'">'
				+ '<param name="options" value="' + this._options + '" />'	
				+ '</applet>';
		} else if (this._isEmbedded) {
			return this._code = "";
		}    
		if (this._hasOptions)
			s += Jmol._getGrabberOptions(this);      
		return this._code = Jmol._documentWrite(s);
	}

	proto._checkDeferred = function(script) {
		return false;
	}	

	proto._search = function(query){
		Jmol._search(this, query);
	}

	proto._searchDatabase = function(query, database, _jme_searchDatabase){
		this._showInfo(false);
		this._searchQuery = database + query;
		if (database == "$")
			query = "$" + query; // 2D variant;  will be $$caffeine
		var dm = database + query;
		this._loadFile(dm, {chemID: this._searchQuery});
	}

 	proto._loadFile = function(fileName, params, _jme_loadFile){
		var chemID = (params ? params.chemID : fileName);
		this._showInfo(false);
		this._thisJmolModel = "" + Math.random();
		var me = this;
		Jmol._loadFileData(this, fileName, function(data){me.__loadModel(data, chemID)}, function() {me.__loadModel(null, chemID)});
	}

	proto.__loadModel = function(jmeOrMolData, chemID, _jme__loadModel) {
		if (jmeOrMolData == null)
			return;
		Jmol.jmeReadMolecule(this, jmeOrMolData);
		if (this._viewSet != null)
			Jmol.View.updateView(this, {chemID:chemID, data:jmeOrMolData});      
	}

	proto._loadModelFromView = function(view, _jme_loadModelFromView) {
		// request from Jmol.View to update view with view.JME.data==null or needs changing
		var rec = view.JME;
		this._currentView = view;
		if (rec.data != null) {
			this.__loadModel(rec.data, view.info.chemID);
			return;
		}
		if (rec.chemID != null) {
			Jmol._searchMol(this, view.info.chemID, null, false);
			return;
		}
		rec = view.Jmol;
		if (rec) {
			this._show2d(true, rec.applet);
			return;
		}
		// NOW WHAT??
	}

	proto._updateView = function(_jme_updateView) {
		// called from model change without chemical identifier, possibly by user action and call to Jmol.updateView(applet)
		if (this._viewSet != null)
			this._search("$" + this._getSmiles())
	}
 
	proto._atomPickedCallback = function(_jme_viewAtomPicked) {
		// direct callback from JSME applet
		if (this._viewSet == null)
			return;
		if (this._applet.molFile().split("V2000")[1] != ("" + this._molData).split("V2000")[1]) {
			this._molData = "<modified>";
			this._thisJmolModel = null;
			this._applet.resetAtomColors(1);
			this.__atomSelection = [];
			return;
		}
		// not a structural change
		var data = this._applet.jmeFile();

		if (data.indexOf(":") < 0) {
			this.__atomSelection = [];
			this._applet.resetAtomColors(1);
			Jmol.View.updateAtomPick(this, []);
			return;
		}

		data = data.split(" ");
		var n = parseInt(data[0]);
		var iAtom = 0;
		for (var i = 0; i < n; i++)
			if (!this.__atomSelection[i + 1] && data[i*3 + 2].indexOf(":") >= 0) {
				iAtom = i + 1;
				break;
			}
		if (iAtom <= 0)
			return;
		var A = [];    
		A.push(this._currentView.JME.atomMap.toJmol[iAtom]);
		Jmol.View.updateAtomPick(this, A);
		this._updateAtomPick(A);
		if (this._atomPickCallback)
			setTimeout(this._atomPickCallback+"([" + iAtom + "])",10);    
	}

	proto._updateAtomPick = function(A, _jme_updateAtomPick) {
		this._applet.resetAtomColors(1);
		if (A.length == 0)
			return;
		var B = [];
		var C = [];
		//System.out.println("JME updateAtomPick for " + A.join(","));
		//System.out.println("JME Using " + this._currentView.info.viewID + " atomMap=" + this._currentView.JME.atomMap.toJME.join(","));
		var j;		
		for (var i = 0; i < A.length; i++) {
		 C[j = this._currentView.JME.atomMap.toJME[A[i]]] = 1; 
		 B.push(j);
		 B.push(3);
		}
		this._applet.setAtomBackgroundColors(1, B.join(","));
		System.out.println("JME setting atom colors " + B.join(","))
		this.__atomSelection = C;
	}

	proto._showInfo = Jmol._Applet.prototype._showInfo;
	proto._show = Jmol._Applet.prototype._show;

	proto._show = function(tf) {
		var x = (!tf ? 2 : "100%");
		Jmol.$setSize(Jmol.$(this, "object"), x, x);
		if (!this._isJava) {
			Jmol.$setVisible(Jmol.$(this, "appletdiv"), tf);
			if (this._isEmbedded && !tf)
				Jmol.$setVisible(Jmol.$(this._linkedApplet, "2dappletdiv"), false);
		}
	}

	proto._show2d = function(toJME, jmol) {
		jmol || (jmol = this._linkedApplet);
		if (jmol) {
			var jme = this._applet;
			if (jme == null && this._isJava)
				jme = this._applet = Jmol._getElement(this, "object");
			var isOK = true;
			if (this._viewSet != null) {
			  isOK = false;
			} else if (jme != null) {
				var jmeSMILES = this._getSmiles();
				// testing here to see that we have the same structure as in the JMOL applet
				var jmolAtoms = (jmeSMILES ? jmol._evaluate("{*}.find('SMILES', '" + jmeSMILES.replace(/\\/g,"\\\\")+ "')") : "({})");
				var isOK = (jmolAtoms != "({})");
			}
			if (!isOK) {
				if (toJME) {
				  this._loadFromJmol(jmol);
				} else {
					// toJmol
					if (jmeSMILES)
						Jmol.script(jmol, "load \"$" + jmeSMILES + "\"");
				}
			}
		}
		if (this._linkedApplet) {
		 	this.__showContainer(toJME, true);
			this._showInfo(!toJME);
		}
	}
	
	proto._loadFromJmol = function(jmol) {
		this._molData = jmol._getMol2D();
		setTimeout(this._id + ".__readMolData()",10);
 }

	proto.__readMolData = function() {
		if (!this._applet)return;
		if (this._molData) {
			this._applet.readMolFile(this._molData);
			this._molData = this._applet.molFile();
			if (this._viewSet) {
			  var v = this._currentView;
			  v.JME.data = this._molData;
			  v.JME.atomMap = (v.Jmol && v.Jmol.applet? this.__getAtomCorrelation(v.Jmol.applet) : null);
			}
		} else {
			this._applet.reset();
			this._molData = "<zapped>";
		}
	}

  proto.__getAtomCorrelation = function(jmol) {
    // get the first atom mapping available by loading the JME structure into model 2, 
    jmol._loadMolData(this._molData, "jmeMap = compare({1.1} {2.1} 'MAP' 'H'); zap 2.1", true);
    var map = jmol._evaluate("jmeMap");
    var n = jmol._evaluate("{*}.count");
    var A = [];
    var B = [];
    // these are Jmol atom indexes. The second number will be >= n, and all must be incremented by 1.
		for (var i = 0; i < map.length; i++) {
		  var c = map[i];
		  A[c[0] + 1] = c[1] - n + 1;
		  B[c[1] - n + 1] = c[0] + 1;
		}
		return {toJME:A, toJmol:B}; // forward and rev.		
  }
  
  
	proto.__showContainer = function(tf, andShow) {
		var jmol = this._linkedApplet;
		var mydiv = Jmol.$(jmol, "2dappletdiv");
		if (this._isJava) {
			var w = (tf ? "100%" : 2);
			var h = (tf ? "100%" : 2);
			Jmol.$setSize(mydiv, w, h);
			if (andShow)
				Jmol.$setSize(Jmol.$(this, "object"), w, h);
		} else {
			Jmol.$setVisible(mydiv, tf);
		}
	}

  proto._getSmiles = function(withStereoChemistry) {
  	var s = (arguments.length == 0 || withStereoChemistry ? jme._applet.smiles() : jme._applet.nonisomericSmiles()).replace(/\:1/g,"");
		s = s.replace(/H/g,"").replace(/\[\]/g,"").replace(/@\]/g,"@H]").replace(/\(\)/g,"");
		if (s.indexOf("\\") == 0 || s.indexOf("/") == 0)
		  s= "[H]" + s;
		return s;
  }

  proto._getMol = function() {
		return this._applet.molFile();   
  }
  
})(Jmol._JMEApplet.prototype);

	//////  additional API for JME /////////

	// see also http://www2.chemie.uni-erlangen.de/services/fragment/editor/jme_functions.html

	// The final replacement here is to remove markings from star option.

	Jmol.jmeSmiles = function(jme, withStereoChemistry) {
		return jme._getSmiles();
	}

	Jmol.jmeReadMolecule = function(jme, jmeOrMolData) {
		// JME data is a single line with no line ending
		if (jmeOrMolData.indexOf("\n") < 0 && jmeOrMolData.indexOf("\r") < 0)
			jme._applet.readMolecule(jmeOrMolData);
		else 
			jme._applet.readMolFile(jmeOrMolData);   
	 jme._molData = jme._applet.molFile();
	}

	Jmol.jmeGetFile = function(jme, asJME) {
		jme._molData = jme._applet.molFile();
		return  (asJME ? jme._applet.jmeFile() : jme._molData);
	}

	Jmol.jmeReset = function(jme) {
		jme._applet.reset();
	}

	Jmol.jmeOptions = function(jme, options) {
		jme._applet.options(options);
	}

// doesn't work because of the way JSME is created using frames and SVG.
//	
//  Jmol.getJSVAppletHtml = function(applet, Info, linkedApplet) {
//    if (Info) {
//      var d = Jmol._document;
//      Jmol._document = null;
//      applet = Jmol.getJMEApplet(applet, Info, linkedApplet);
//      Jmol._document = d;
//    }  
//    return applet._code;
//	}


})(Jmol, document);

