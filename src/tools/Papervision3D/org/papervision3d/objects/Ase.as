/*
 *  PAPER    ON   ERVIS  NPAPER ISION  PE  IS ON  PERVI IO  APER  SI  PA
 *  AP  VI  ONPA  RV  IO PA     SI  PA ER  SI NP PE     ON AP  VI ION AP
 *  PERVI  ON  PE VISIO  APER   IONPA  RV  IO PA  RVIS  NP PE  IS ONPAPE
 *  ER     NPAPER IS     PE     ON  PE  ISIO  AP     IO PA ER  SI NP PER
 *  RV     PA  RV SI     ERVISI NP  ER   IO   PE VISIO  AP  VISI  PA  RV3D
 *  ______________________________________________________________________
 *  papervision3d.org � blog.papervision3d.org � osflash.org/papervision3d
 */

/*
 * Copyright 2006 (c) Carlos Ulloa Matesanz, noventaynueve.com.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

// ______________________________________________________________________
//                                                   DisplayObject3D: Ase


import org.papervision3d.core.geom.Face3D;
import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.NumberUV;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.objects.Mesh;
import org.papervision3d.Papervision3D;

/**
* The Ase DisplayObject3D class lets you load and parse a 3DS Max exported .ASE mesh.
* <p/>
* Only the geometry and mapping of one mesh is currently parsed. As usual, the texture is specified in the material object.
*/
class org.papervision3d.objects.Ase extends Mesh
{
	/**
	* Default scaling value for constructor.
	*/
	static public var DEFAULT_SCALING  :Number = 1;

	/**
	* Internal scaling value.
	*/
	static private var INTERNAL_SCALING :Number = 50;

	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Creates a new Ase object.
	* <p/>
	* The Ase DisplayObject3D class lets you load and parse a 3DS Max exported .ASE mesh.
	* <p/>
	* Only the geometry and mapping of one mesh is currently parsed. As usual, the texture is specified in the material object.
	* <p/>
	* @param	material	A Material3D object that contains the material properties of the object.
	* <p/>
	* @param	filename	Filename of the .ASE object to parse.
	* <p/>
	* @param	scale		Scaling factor.
	* <p/>
	* @param	callback	Function callback that's called when the file is loaded and parsed.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public function Ase( material:MaterialObject3D, filename:String, scale:Number, callback:Function, initObject:Object )
	{
		super( material, new Array(), new Array(), initObject );

		this._scaleAse = scale;
		this._filename = filename;
		this._callback = callback;

		loadAse( filename );
	}

	// ___________________________________________________________________________________________________
	//                                                                                               A S E
	//   AA    SSSSS  EEEEEE
	//  AAAA  SS      EE
	// AA  AA  SSSS   EEEE
	// AAAAAA     SS  EE
	// AA  AA SSSSS   EEEEEE PARSER

	/**
	* Taken from w3d at http://blog.andre-michelle.com/2005/flash8-sourcecodes
	* By Andr� Michelle, with much respect
	*/

	private function loadAse( filename:String )
	{
		var scale:Number = this._scaleAse;
		scale *= INTERNAL_SCALING;

		this.visible = false;

		var vertices :Array = this.vertices;
		var faces    :Array = this.faces;

		var o = this;

		var lv: LoadVars = new LoadVars();

		lv.onLoad = function( sucess: Boolean ): Void
		{
			if( !sucess )
				{ Papervision3D.log( filename + ": ASE File Error" );	return;	}

			var lines: Array = unescape( this ).split( '\n' );

			// Strip \r for Max
			for( var i:String in lines )
			{
				var tSplit:Array = lines[i].split("\r");
				lines[i] = tSplit[0] + tSplit[1];
			}

			var line: String;
			var chunk: String;
			var content: String;

			var uvs:Array = new Array();

			var material :MaterialObject3D = o.material;

			while( lines.length )
			{
				line = String( lines.shift() );

				//-- clear white space from beginn
				line = line.substr( line.indexOf( '*' ) + 1 );

				//-- clear closing brackets
				if( line.indexOf( '}' ) >= 0 ) line = '';

				//-- get chunk description
				chunk = line.substr( 0, line.indexOf( ' ' ) );

				switch( chunk )
				{
					case 'MESH_VERTEX_LIST':

						while( ( content = String( lines.shift() ) ).indexOf( '}' ) < 0 )
						{
							content = content.substr( content.indexOf( '*' ) + 1 );
							var mvl: Array = content.split(  '\t' ); // separate here

							var x =  Number( mvl[1] ) * scale;
							var y = -Number( mvl[3] ) * scale;
							var z =  Number( mvl[2] ) * scale;

							vertices.push( new Vertex3D( x, y, z ) );
						}
						break;


					case 'MESH_FACE_LIST':

						while( ( content = String( lines.shift() ) ).indexOf( '}' ) < 0 )
						{
							content = content.substr( content.indexOf( '*' ) + 1 );

							var mfl: Array = content.split(  '\t' )[0]; // ignore: [MESH_SMOOTHING,MESH_MTLID]
							var drc: Array = mfl.split( ':' ); // separate here
							var con: String;

							var a = vertices[ parseInt( con.substr( 0, ( con = drc[2] ).lastIndexOf( ' ' ) ) ) ];
							var b = vertices[ parseInt( con.substr( 0, ( con = drc[3] ).lastIndexOf( ' ' ) ) ) ];
							var c = vertices[ parseInt( con.substr( 0, ( con = drc[4] ).lastIndexOf( ' ' ) ) ) ];

							faces.push( new Face3D( [ a, b, c ], material, null ) );
						}
						break;


					case 'MESH_TVERTLIST':

						while( ( content = String( lines.shift() ) ).indexOf( '}' ) < 0 )
						{
							content = content.substr( content.indexOf( '*' ) + 1 );
							var mtvl: Array = content.split(  '\t' ); // separate here
							uvs.push( new NumberUV( parseFloat( mtvl[1] ), 1 - parseFloat( mtvl[2] )) );
						}
						break;


					case 'MESH_TFACELIST':

						var num: Number = 0;

						while( ( content = String( lines.shift() ) ).indexOf( '}' ) < 0 )
						{
							content = content.substr( content.indexOf( '*' ) + 1 );
							var mtfl: Array = content.split(  '\t' ); // separate here

							faces[ num ].uv =
							[
								uvs[ parseInt( mtfl[1] )],
								uvs[ parseInt( mtfl[2] )],
								uvs[ parseInt( mtfl[3] )]
							];
							num++;
						}
						break;
				}
			}
			// Remap UVs
			for( var i in faces ) faces[i].transformUV( material );

			// Activate object
			o.visible = true;

			Papervision3D.log( "Parsed ASE: " + filename + "\n vertices:" + vertices.length + "\n faces:" + faces.length );

			// Callback
			if( this._callback ) this._callback();
		};
		lv.load( filename );
	}

	private var _scaleAse :Number;
	private var _filename :String;
	private var _callback :Function;
}