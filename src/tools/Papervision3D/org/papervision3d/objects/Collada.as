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
//                                               DisplayObject3D: Collada


import org.papervision3d.core.geom.Face3D;
import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.NumberUV;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.core.utils.XML2Object;
import org.papervision3d.objects.Mesh;

import com.dynamicflash.utils.Delegate;

/**
* The Collada DisplayObject3D class lets you load and parse a Collada meshes.
* <p/>
* Only the geometry and mapping of one mesh is currently parsed. As usual, the texture is specified in the material object.
*/
class org.papervision3d.objects.Collada extends Mesh
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
	* Creates a new Collada object.
	* <p/>
	* The Collada DisplayObject3D class lets you load and parse a Collada mesh.
	* <p/>
	* COLLADA is a COLLAborative Design Activity for establishing an interchange file format for interactive 3D applications.
	* <p/>
	* COLLADA defines an open standard XML schema for exchanging digital assets among various container software applications that might otherwise store their assets in incompatible formats.
	* <p/>
	* COLLADA documents that describe digital assets are XML files, usually identified with a .dae (digital asset exchange) filename extension.
	* <p/>
	* Only the geometry and mapping of one mesh is currently parsed. As usual, the texture is specified in the material object.
	* <p/>
	* @param	material	A MaterialObject3D object that contains the material properties of the object.
	* <p/>
	* @param	filename	Filename of the .ASE object to parse.
	* <p/>
	* @param	scale		Scaling factor. Max = 100. Maya =
	* <p/>
	* @param	callback	Function callback that's called when the file is loaded and parsed.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public function Collada( material:MaterialObject3D, filename:String, scale:Number, callback:Function, initObject:Object )
	{
		super( material, new Array(), new Array(), initObject );

		this._scaling  = scale || DEFAULT_SCALING;
		this._callback = callback;

		this.sortFaces = (initObject.sortFaces != false); // Default sortFaces to true

		_raw = new XML2Object( filename, Delegate.create( this, parseCollada ) );
	}


	// ________________________________________________________________


	private function parseCollada()
	{
		// Parse COLLADA
		var semantic:Object = createSemantic();
_global.semantic = semantic; // DEBUG only

		// Build object

		// Vertices
		var vertices :Array      = this.vertices;
		var scale    :Number     = this._scaling * INTERNAL_SCALING;

		var semVertices :Array = semantic.VERTEX;
		var len:Number = semVertices.length;

		for( var i:Number = 0; i < len; i++ )
		{
			var vert:Object = semVertices[ i ];
			var x :Number =  Number( vert.x ) * scale;
			var y :Number = -Number( vert.z ) * scale; // Swapped to make Y up and Z depth.
			var z :Number =  Number( vert.y ) * scale;

			vertices.push( new Vertex3D( x, y, z ) );
		}

		// Faces
		var faces    :Array            = this.faces;
		var material :MaterialObject3D = this.material;

		var semFaces :Array = semantic.triangles;
		len = semFaces.length;

		for( var i:Number = 0; i < len; i++ )
		{
			// Triangle A
			var tri:Array = semFaces[i].VERTEX;
			var a:Vertex3D = vertices[ tri[ 0 ] ];
			var b:Vertex3D = vertices[ tri[ 1 ] ];
			var c:Vertex3D = vertices[ tri[ 2 ] ];

			var tex :Array = semantic.TEXCOORD;
			var uv :Array = semFaces[i].TEXCOORD;
			var uvA :NumberUV = new NumberUV( tex[ uv[0] ].s, 1 - tex[ uv[0] ].t );
			var uvB :NumberUV = new NumberUV( tex[ uv[1] ].s, 1 - tex[ uv[1] ].t );
			var uvC :NumberUV = new NumberUV( tex[ uv[2] ].s, 1 - tex[ uv[2] ].t );

			faces.push( new Face3D( [ a, b, c ], material, [ uvA, uvB, uvC ] ) );
		}

		this.visible = true;

		// Callback
		this._callback();
	}


	private function createSemantic():Object
	{
		var semantic:Object = new Object();

		var COLLADA:Object = this._raw.data.COLLADA;
		var geometry:Object = COLLADA.library_geometries.geometry;

		var msh:Object;
		makeArray( geometry );

		for( var i:Number = 0; msh = geometry[i].mesh; i++ )
		{
			// sources
			var src:Object;
			makeArray( msh.source );

			for( var j:Number = 0; src = msh.source[j]; j++ )
				sourceDeserialize( semantic, src );

			// vertices
			var inp:Object;
			makeArray( msh.vertices.input );
			for( var j:Number = 0; inp = msh.vertices.input[j]; j++ )
			{
				if( j == 0 )
					semantic[ cleanId( msh.vertices.id ) ] = inputDeserialize( semantic, inp );
				else
					inputDeserialize( semantic, inp );
			}

			// triangles
			var field:Array = new Array();
			makeArray( msh.triangles.input );
			for( var j:Number = 0; inp = msh.triangles.input[j]; j++ )
			{
				inputDeserialize( semantic, inp );
				field.push( inp.semantic );
			}

			var triangles:Array = semantic.triangles = new Array();
			var data :Number = msh.triangles.p._value.split(' ');
			var len  :Number = msh.triangles.count;

			var d = 0;
			for( var j:Number = 0; j < len; j++ )
			{
				var t:Object = new Object();

				for( var v:Number = 0; v < 3; v++ )
				{
					var fld:String;
					for( var k:Number = 0; fld = field[k]; k++ )
					{
						if( ! t[ fld ] )
							t[ fld ] = new Array();

						t[ fld ].push( Number( data[d++] ) );
					}
				}
				triangles.push( t );
			}

		}

		return semantic;
	}


	private function sourceDeserialize( semantic:Object, source:Object )
	{
		var output:Array = new Array();

		var floats:Array = source.float_array._value.split(" ");

		var acc:Object = source.technique_common.accessor;

		var field:Array = new Array();
		var stride:Number = acc.stride;
		for( var i:Number = 0; i < stride; i++ )
		{
			field.push( acc.param[i].name.toLowerCase() );
		}

		var k:Number = 0;
		var count:Number = acc.count;
		for( var i:Number = 0; i < count; i++ )
		{
			var obj:Object = new Object();

			for( var j:Number = 0; j < stride; j++ )
			{
				obj[ field[j] ] = Number( floats[ k++ ] );
			}
			output.push( obj );
		}
		semantic[ cleanId( source.id ) ] = semantic[ cleanSource( acc.source ) ] = output;
	}


	private function inputDeserialize( semantic:Object, input:Object ) :Object
	{
		return semantic[ input.semantic ] = semantic[ cleanSource( input.source ) ];
	}



	// DEBUG
	private function propTrace( x )
	{
		for( var i in x ) trace( i + ": " + x[i] );
	}

	private function makeArray( obj:Object )
	{
		if( obj._type != 'array' ) obj["0"] = obj;
	}

	function cleanId( str:String ):String
	{
		var BAD  :String = '-';
		var GOOD :String = '_';

		var out  :String = str;

		var last :Number = out.lastIndexOf( BAD );

		for( var i:Number = out.indexOf( BAD, 0 ); last > i; i = out.indexOf( BAD, i ) )
			out = out.slice( 0, i ) + GOOD + out.slice( i+1 );

		if( last > 0 )
			out = out.slice( 0, last ) + GOOD + out.slice( last+1 );

		return out;
	}

	function cleanSource( str:String ):String
	{
		return cleanId( str.substr( 1 ) ); // Substr removes '#'
	}


// ________________________________________________________________

	private var _scaling  :Number;
	private var _callback :Function;

	private var _raw      :Object;
}