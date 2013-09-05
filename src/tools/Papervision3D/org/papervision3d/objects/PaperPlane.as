/*
 *  PAPER    ON   ERVIS  NPAPER ISION  PE  IS ON  PERVI IO  APER  SI  PA
 *  AP  VI  ONPA  RV  IO PA     SI  PA ER  SI NP PE     ON AP  VI ION AP
 *  PERVI  ON  PE VISIO  APER   IONPA  RV  IO PA  RVIS  NP PE  IS ONPAPE
 *  ER     NPAPER IS     PE     ON  PE  ISIO  AP     IO PA ER  SI NP PER
 *  RV     PA  RV SI     ERVISI NP  ER   IO   PE VISIO  AP  VISI  PA  RV3D
 *  ______________________________________________________________________
 *  papervision3d.org  blog.papervision3d.org  osflash.org/papervision3d
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
//                                            DisplayObject3D: PaperPlane

import org.papervision3d.core.geom.Face3D;
import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.objects.Mesh;

/**
*
*/
class org.papervision3d.objects.PaperPlane extends Mesh
{
	/**
	* Default value of segments.
	*/
	static public var DEFAULT_SCALE :Number = 1;


	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Create new PaperPlane object.
	* <p/>
	* @param	material	A Material3D object that contains the material properties of the object.
	* <p/>
	* @param	scale		[optional] - Scaling factor
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public function PaperPlane( material:MaterialObject3D, scale:Number, initObject:Object )
	{
		super( material, new Array(), new Array(), initObject );

		scale = scale || DEFAULT_SCALE;

		buildPaperPlane( scale );
	}


	private function buildPaperPlane( scale )
	{
		var a :Number = 100 * scale;
		var b :Number = a/2;
		var c :Number = b/3;

		var v:Array =
		[
			new Vertex3D(  0,  0,  a ),
			new Vertex3D( -b, -c, -a ),
			new Vertex3D( -c, -c, -a ),
			new Vertex3D(  0,  c, -a ),
			new Vertex3D(  c, -c, -a ),
			new Vertex3D(  b, -c, -a )
		];

		this.vertices = v;

		this.faces =
		[
			new Face3D( [v[0], v[1], v[2]] ),
			new Face3D( [v[0], v[2], v[3]] ),
			new Face3D( [v[0], v[3], v[4]] ),
			new Face3D( [v[0], v[4], v[5]] )
		];
	}
}