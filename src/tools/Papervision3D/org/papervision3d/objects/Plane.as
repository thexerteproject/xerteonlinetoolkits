/*
 *  PAPER    ON   ERVIS  NPAPER ISION  PE  IS ON  PERVI IO  APER  SI  PA
 *  AP  VI  ONPA  RV  IO PA     SI  PA ER  SI NP PE     ON AP  VI ION AP
 *  PERVI  ON  PE VISIO  APER   IONPA  RV  IO PA  RVIS  NP PE  IS ONPAPE
 *  ER     NPAPER IS     PE     ON  PE  ISIO  AP     IO PA ER  SI NP PER
 *  RV     PA  RV SI     ERVISI NP  ER   IO   PE VISIO  AP  VISI  PA  RV3D
 *  ______________________________________________________________________
 *  papervision3d.org + blog.papervision3d.org + osflash.org/papervision3d
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
//                                                 DisplayObject3D: Plane

import org.papervision3d.core.geom.Face3D;
import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.NumberUV;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.objects.Mesh;

/**
* The Plane DisplayObject3D class lets you create and display flat rectangles in 3D space.
* <p/>
* The rectangle can be divided in smaller segments. This is usually done to reduce linear mapping artifacts. Dividing the plane in the direction of the perspective or vanishing point, helps to reduce this problem.
* <p/>
* This problem dissapears when the plane is facing straignt to the camera, i.e. it is perpendicular with the vanishing point of the scene.
*/
class org.papervision3d.objects.Plane extends Mesh
{
	/**
	* Number of segments horizontally. Defaults to 1.
	*/
	public var segmentsW :Number;

	/**
	* Number of segments vertically. Defaults to 1.
	*/
	public var segmentsH :Number;

	/**
	* Default size of Plane if not texture is defined.
	*/
	static public var DEFAULT_SIZE :Number = 500;

	/**
	* Default size of Plane if not texture is defined.
	*/
	static public var DEFAULT_SCALE :Number = 1;

	/**
	* Default value of segments.
	*/
	static public var DEFAULT_SEGMENTS :Number = 1;


	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Create new Plane object.
	* <p/>
	* @param	material	A Material3D object that contains the material properties of the object.
	* <p/>
	* @param	scale		[optional] - Scaling factor
	* <p/>
	* @param	segmentsW	[optional] - Number of segments horizontally. Defaults to 1.
	* <p/>
	* @param	segmentsH	[optional] - Number of segments vertically. Defaults to segmentsW.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public function Plane( material:MaterialObject3D, width:Number, height:Number, segmentsW:Number, segmentsH:Number, initObject:Object )
	{
		super( material, new Array(), new Array(), initObject );

		this.segmentsW = segmentsW || DEFAULT_SEGMENTS; // Defaults to 1
		this.segmentsH = segmentsH || this.segmentsW;   // Defaults to segmentsW

		var scale :Number = DEFAULT_SCALE;

		if( ! height )
		{
			if( width )
				scale = width;

			if( material && material.bitmap )
			{
				width  = material.bitmap.width  * scale;
				height = material.bitmap.height * scale;
			}
			else
			{
				width  = DEFAULT_SIZE * scale;
				height = DEFAULT_SIZE * scale;
			}
		}

		buildPlane( width, height );
	}


	private function buildPlane( width, height )
	{
		var gridX    :Number = this.segmentsW;
		var gridY    :Number = this.segmentsH;
		var gridX1   :Number = gridX + 1;
		var gridY1   :Number = gridY + 1;

		var vertices :Array      = this.vertices;
		var faces    :Array      = this.faces;

		var textureX :Number = width /2;
		var textureY :Number = height /2;

		var iW       :Number = width / gridX;
		var iH       :Number = height / gridY;

		// Vertices
		for( var ix:Number = 0; ix < gridX + 1; ix++ )
		{
			for( var iy:Number = 0; iy < gridY1; iy++ )
			{
				var x :Number = ix * iW - textureX;
				var y :Number = iy * iH - textureY;

				vertices.push( new Vertex3D( x, y, 0 ) );
			}
		}

		// Faces
		var uvA :NumberUV;
		var uvC :NumberUV;
		var uvB :NumberUV;

		for(  var ix:Number = 0; ix < gridX; ix++ )
		{
			for(  var iy:Number = 0; iy < gridY; iy++ )
			{
				// Triangle A
				var a:Vertex3D = vertices[ ix     * gridY1 + iy     ];
				var c:Vertex3D = vertices[ ix     * gridY1 + (iy+1) ];
				var b:Vertex3D = vertices[ (ix+1) * gridY1 + iy     ];

				uvA =  new NumberUV( ix     / gridX, iy     / gridY );
				uvC =  new NumberUV( ix     / gridX, (iy+1) / gridY );
				uvB =  new NumberUV( (ix+1) / gridX, iy     / gridY );

				faces.push( new Face3D( [ a, b, c ], null, [ uvA, uvB, uvC ] ) );

				// Triangle B
				a = vertices[ (ix+1) * gridY1 + (iy+1) ];
				c = vertices[ (ix+1) * gridY1 + iy     ];
				b = vertices[ ix     * gridY1 + (iy+1) ];

				uvA =  new NumberUV( (ix+1) / gridX, (iy+1) / gridY );
				uvC =  new NumberUV( (ix+1) / gridX, iy      / gridY );
				uvB =  new NumberUV( ix      / gridX, (iy+1) / gridY );

				faces.push( new Face3D( [ a, b, c ], null, [ uvA, uvB, uvC ] ) );
			}
		}

		// Remap UVs
		transformUV( this._material );
	}
}