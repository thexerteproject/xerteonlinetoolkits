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
//                                                DisplayObject3D: Points

import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.Number3D;
import org.papervision3d.core.proto.CameraObject3D;
import org.papervision3d.core.proto.DisplayObject3D;

/**
* The Points DisplayObject3D class lets you create and manipulate groups of vertices.
*
*/
class org.papervision3d.objects.Points extends DisplayObject3D
{
	/**
	* An array of Vertex3D objects for the vertices of the mesh.
	*/

	public var vertices :Array;

	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Creates a new Points object.
	*
	* The Points DisplayObject3D class lets you create and manipulate groups of vertices.
	*
	* @param	vertices	An array of Vertex3D objects for the vertices of the mesh.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public function Points( vertices:Array, initObject:Object )
	{
		super( initObject );

		this.vertices = vertices || new Array();
	}

	// ___________________________________________________________________________________________________
	//                                                                                   T R A N S F O R M
	// TTTTTT RRRRR    AA   NN  NN  SSSSS FFFFFF OOOO  RRRRR  MM   MM
	//   TT   RR  RR  AAAA  NNN NN SS     FF    OO  OO RR  RR MMM MMM
	//   TT   RRRRR  AA  AA NNNNNN  SSSS  FFFF  OO  OO RRRRR  MMMMMMM
	//   TT   RR  RR AAAAAA NN NNN     SS FF    OO  OO RR  RR MM M MM
	//   TT   RR  RR AA  AA NN  NN SSSSS  FF     OOOO  RR  RR MM   MM

	/**
	* Projects three dimensional coordinates onto a two dimensional plane to simulate the relationship of the camera to subject.
	*
	* This is the first step in the process of representing three dimensional shapes two dimensionally.
	*
	* @param	camera		Camera.
	*/
	public function project( camera :CameraObject3D )
	{
		// TODO Combine this 3 vertices loops into 4 versions
		// Update mesh
		if( this._scale )
		{
			updateScale( this.vertices, new Number3D( this._scaleX, this._scaleY, this._scaleZ ) );
			this._scale = false;
			this._rotation = true;
		}

		if( this._rotation )
		{
			updateRotation( this.vertices, new Number3D( this._rotationX, this._rotationY, this._rotationZ ) );
			this._rotation = false;
		}

		// Camera
		var camPosX :Number   = camera.x;
		var camPosY :Number   = camera.y;
		var camPosZ :Number   = camera.z;

		var camSin  :Number3D = camera.sin;
		var camSinX :Number   = camSin.x;
		var camSinY :Number   = camSin.y;
		var camSinZ :Number   = camSin.z;

		var camCos  :Number3D = camera.cos;
		var camCosX :Number   = camCos.x;
		var camCosY :Number   = camCos.y;
		var camCosZ :Number   = camCos.z;

		// Pos
		camPosX -= this.x;
		camPosY -= this.y;
		camPosZ -= this.z;

		var vertex   :Vertex3D;
		var vertices :Array  = this.vertices;
		var i        :Number = vertices.length;

		var focus    :Number = camera.focus;
		var zoom     :Number = camera.zoom;

		var screen   :Number3D;
		var persp    :Number;

		var x0 :Number;
		var y0 :Number;
		var z0 :Number;

		var x1 :Number;
		var y1 :Number;

		var x2 :Number;
		var z1 :Number;

		var y2 :Number;
		var z2 :Number;

		while( vertex = vertices[--i] )
		{
			// Center position
			x0 = vertex.x - camPosX;
			y0 = vertex.y - camPosY;
			z0 = vertex.z - camPosZ;

			x1 = x0 * camCosZ - y0 * camSinZ;
			y1 = y0 * camCosZ + x0 * camSinZ;

			x2 = x1 * camCosY - z0 * camSinY;
			z1 = z0 * camCosY + x1 * camSinY;

			y2 = y1 * camCosX - z1 * camSinX;
			z2 = z1 * camCosX + y1 * camSinX;

			vertex.visible = ( z2 > 0 );

			if( vertex.visible )
			{
				screen = vertex.screen;
				persp  = focus / (focus + z2) * zoom;

				screen.x = x2 * persp;
				screen.y = y2 * persp;
				screen.z = z2;
			}
		}
	}

	/**
	* Applies the current rotation values to the mesh.
	*
	* @param	vertices	An array of Vetex3D objects.
	* @param	rotation	A Number3D value with the angles of rotation around the three axis, in radians.
	* @param	pivot		A Number3D value with the position of the pivot relative to the object's center.
	*/
	private function updateRotation( vertices:Array, rotation:Number3D )
	{
		var cosX :Number = Math.cos( rotation.x );
		var sinX :Number = Math.sin( rotation.x );
		var cosY :Number = Math.cos( rotation.y );
		var sinY :Number = Math.sin( rotation.y );
		var cosZ :Number = Math.cos( rotation.z );
		var sinZ :Number = Math.sin( rotation.z );

		var x0 :Number;
		var y0 :Number;
		var z0 :Number;

		var x1 :Number;
		var y1 :Number;

		var x2 :Number;
		var z1 :Number;

		var y2 :Number;
		var z2 :Number;

		var scaled :Number3D;

		var vertex :Vertex3D;
		var i      :Number = vertices.length;

		while( vertex = vertices[--i] )
		{
			scaled = vertex.toRotate;

			x0 = scaled.x;
			y0 = scaled.y;
			z0 = scaled.z;

			x1 = x0 * cosZ - y0 * sinZ;
			y1 = y0 * cosZ + x0 * sinZ;

			x2 = x1 * cosY - z0 * sinY;
			z1 = z0 * cosY + x1 * sinY;

			y2 = y1 * cosX - z1 * sinX;
			z2 = z1 * cosX + y1 * sinX;

			vertex.x = x2;
			vertex.y = y2;
			vertex.z = z2;
		}
	}

	/**
	* Applies the current rotation values to the mesh.
	*
	* @param	vertices	An array of Vetex3D objects.
	* @param	rotation	A Number3D value with the angles of rotation around the three axis, in radians.
	* @param	pivot		A Number3D value with the position of the pivot relative to the object's center.
	* @param	from		Index of the first vertex to transform.
	* @param	to			Index of the last vertex to transform plus one.
	*/
	/*
	public function transformRotation( vertices:Array, rotation:Number3D, pivot:Number3D, from:Number, to:Number, by:Number )
	{
		var cosX :Number = Math.cos( rotation.x );
		var sinX :Number = Math.sin( rotation.x );
		var cosY :Number = Math.cos( rotation.y );
		var sinY :Number = Math.sin( rotation.y );
		var cosZ :Number = Math.cos( rotation.z );
		var sinZ :Number = Math.sin( rotation.z );

		var pivotX :Number = pivot.x || 0;
		var pivotY :Number = pivot.y || 0;
		var pivotZ :Number = pivot.z || 0;

		to = to || vertices.length;
		by = by || 1;
		for( var i:Number = from || 0; i < to; i+=by )
		{
			var vertex   :Vertex3D = vertices[i]
			var original :Number3D = vertex.toScale;

			var x0:Number = original.x - pivotX;
			var y0:Number = original.y - pivotY;
			var z0:Number = original.z - pivotZ;

			var x1:Number = x0 * cosZ - y0 * sinZ;
			var y1:Number = y0 * cosZ + x0 * sinZ;

			var x2:Number = x1 * cosY - z0 * sinY;
			var z1:Number = z0 * cosY + x1 * sinY;

			var y2:Number = y1 * cosX - z1 * sinX;
			var z2:Number = z1 * cosX + y1 * sinX;

			vertex.toScale.x = x2;
			vertex.toScale.y = y2;
			vertex.toScale.z = z2;
		}
		this._scale = true;
	}
*/

	/**
	* Applies the current scale values to the mesh.
	*
	* @param	vertices	An array of Vetex3D objects.
	* @param	rotation	A Number3D value with the scaling factor along the three axis, in base one.
	*/
	public function updateScale( vertices:Array, scale:Number3D )
	{
		var sX :Number = scale.x;
		var sY :Number = scale.y;
		var sZ :Number = scale.z;

		var original :Number3D;
		var scaled   :Number3D;

		var i :Number = vertices.length;
		var vertex :Vertex3D;

		while( vertex = vertices[--i] )
		{
			original = vertex.toScale;
			scaled   = vertex.toRotate;

			scaled.x = original.x * sX;
			scaled.y = original.y * sY;
			scaled.z = original.z * sZ;
		}
	}



/*
	public function rotate()
	{
		var rot :Rotation3D = this.rotation;

		var pivot  :Number3D = rot.pivot;
		var pivotX :Number   = pivot.x;
		var pivotY :Number   = pivot.y;
		var pivotZ :Number   = pivot.z;

		var angle = rot.angle;
		var cosX :Number = Math.cos( angle.x );
		var sinX :Number = Math.sin( angle.x );
		var cosY :Number = Math.cos( angle.y );
		var sinY :Number = Math.sin( angle.y );
		var cosZ :Number = Math.cos( angle.z );
		var sinZ :Number = Math.sin( angle.z );

		var vertices = this.vertices;

		for( var i in vertices )
		{
			var vertex :Vertex3D = vertices[i];
			var pos    :Number3D = vertex.position;
			var origin :Number3D = vertex.origin;
			var screen :Number3D = vertex.screen;

			var x0:Number = origin.x - pivotX;
			var y0:Number = origin.y - pivotY;
			var z0:Number = origin.z - pivotZ;

			var x1:Number = x0 * cosZ - y0 * sinZ;
			var y1:Number = y0 * cosZ + x0 * sinZ;

			var x2:Number = x1 * cosY - z0 * sinY;
			var z1:Number = z0 * cosY + x1 * sinY;

			var y2:Number = y1 * cosX - z1 * sinX;
			var z2:Number = z1 * cosX + y1 * sinX;

			pos.x = x2;
			pos.y = y2;
			pos.z = z2;
		}
	}
*/

	/**
	* Calculates 3D bounding box.
	*
	* @return	{minX, maxX, minY, maxY, minZ, maxZ}
	*/
	public function boundingBox():Object
	{
		var vertices :Object = this.vertices;
		var bBox     :Object = new Object();

		bBox.min  = new Number3D();
		bBox.max  = new Number3D();
		bBox.size = new Number3D();

		for( var i:String in vertices )
		{
			var v:Vertex3D = vertices[Number(i)];

			bBox.min.x = (bBox.min.x == undefined)? v.x : Math.min( v.x, bBox.min.x );
			bBox.max.x = (bBox.max.x == undefined)? v.x : Math.max( v.x, bBox.max.x );

			bBox.min.y = (bBox.min.y == undefined)? v.y : Math.min( v.y, bBox.min.y );
			bBox.max.y = (bBox.max.y == undefined)? v.y : Math.max( v.y, bBox.max.y );

			bBox.min.z = (bBox.min.z == undefined)? v.z : Math.min( v.z, bBox.min.z );
			bBox.max.z = (bBox.max.z == undefined)? v.z : Math.max( v.z, bBox.max.z );
		}

		bBox.size.x = bBox.max.x - bBox.min.x;
		bBox.size.y = bBox.max.y - bBox.min.y;
		bBox.size.z = bBox.max.z - bBox.min.z;

		return bBox;
	}


	// ___________________________________________________________________________________________________
	//                                                                                         R E N D E R
	// RRRRR  EEEEEE NN  NN DDDDD  EEEEEE RRRRR
	// RR  RR EE     NNN NN DD  DD EE     RR  RR
	// RRRRR  EEEE   NNNNNN DD  DD EEEE   RRRRR
	// RR  RR EE     NN NNN DD  DD EE     RR  RR
	// RR  RR EEEEEE NN  NN DDDDD  EEEEEE RR  RR

	// public function render() {}

	// ___________________________________________________________________________________________________
}