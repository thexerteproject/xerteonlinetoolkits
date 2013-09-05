/*
 *  PAPER    ON   ERVIS  NPAPER ISION  PE  IS ON  PERVI IO  APER  SI  PA
 *  AP  VI  ONPA  RV  IO PA     SI  PA ER  SI NP PE     ON AP  VI ION AP
 *  PERVI  ON  PE VISIO  APER   IONPA  RV  IO PA  RVIS  NP PE  IS ONPAPE
 *  ER     NPAPER IS     PE     ON  PE  ISIO  AP     IO PA ER  SI NP PER
 *  RV     PA  RV SI     ERVISI NP  ER   IO   PE VISIO  AP  VISI  PA  RV3D
 *  ______________________________________________________________________
 *  papervision3d.org • blog.papervision3d.org • osflash.org/papervision3d
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
//

import org.papervision3d.core.Number3D;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.Papervision3D;

import flash.display.BitmapData;
import flash.geom.Matrix;

/**
* The Face3D class lets you render linear textured triangles. It also supports solid colour fill and hairline outlines.
*
*/
class org.papervision3d.core.geom.Face3D
{
	/**
	* An array of Vertex3D objects for the three vertices of the triangle.
	*/
	public var vertices :Array;


	/**
	* A Material3D object that contains the material properties of the triangle.
	*/
	public var material :MaterialObject3D;


	/**
	* A MaterialObject3D object that contains the material properties of the back of a single sided triangle.
	*/
	public var materialBack :MaterialObject3D;


	/**
	* An array of {x,y} objects for the corresponding UV pixel coordinates of each triangle vertex.
	*/
	public var uv :Array;

	// ______________________________________________________________________

	/**
	* [read-only] The average depth (z coordinate) of the transformed triangle. Also known as the distance from the camera. Used internally for z-sorting.
	*/
	public var screenZ   :Number;

	/**
	* [read-only] A Boolean value that indicates that the face is visible, i.e. it's vertices are in front of the camera.
	*/
	public var isVisible :Boolean;


	/**
	* [read-only] Unique id of this instance.
	*/
	public var id :Number;


	/**
	* The Face3D constructor lets you create linear textured or solid colour triangles.
	*
	* @param	vertices	An array of Vertex3D objects for the three vertices of the triangle.
	* @param	material	A Material3D object that contains the material properties of the triangle.
	* @param	uv			An array of {x,y} objects for the corresponding UV pixel coordinates of each triangle vertex.
	*/
	public function Face3D( vertices:Array, material:MaterialObject3D, uv:Array )
	{
		// Vertices
		this.vertices = vertices;

		// Material
		this.material = material;
		this.uv = uv;

		if( uv && material.bitmap ) transformUV();

		this.id = _totalFaces++;

		if( ! _bitmapMatrix ) _bitmapMatrix = new Matrix();
	}

	/**
	* Applies the updated UV texture mapping values to the triangle. This is required to speed up rendering.
	*
	*/
	public function transformUV( objectMaterial:MaterialObject3D )
	{
		var material:MaterialObject3D = this.material || objectMaterial;

		if( material.bitmap )
		{
			var uv :Array  = this.uv;

			var w  :Number = material.bitmap.width;
			var h  :Number = material.bitmap.height;

			var u0 :Number = uv[0].u * w;
			var v0 :Number = uv[0].v * h;
			var u1 :Number = uv[1].u * w;
			var v1 :Number = uv[1].v * h;
			var u2 :Number = uv[2].u * w;
			var v2 :Number = uv[2].v * h;

			// Fix perpendicular projections
			if( (u0 == u1 && v0 == v1) || (u0 == u2 && v0 == v2) )
			{
				u0 -= (u0 > 0.05)? 0.05 : -0.05;
				v0 -= (v0 > 0.07)? 0.07 : -0.07;
			}

			if( u2 == u1 && v2 == v1 )
			{
				u2 -= (u2 > 0.05)? 0.04 : -0.04;
				v2 -= (v2 > 0.06)? 0.06 : -0.06;
			}

			// Precalculate matrix
			var at :Number = ( u1 - u0 );
			var bt :Number = ( v1 - v0 );
			var ct :Number = ( u2 - u0 );
			var dt :Number = ( v2 - v0 );

			var m :Matrix = new Matrix( at, bt, ct, dt, u0, v0 );
			m.invert();

			this._a  = m.a;
			this._b  = m.b;
			this._c  = m.c;
			this._d  = m.d;
			this._tx = m.tx;
			this._ty = m.ty;
		}
		else
		{
			Papervision3D.log( "Face3D: transformUV() material.bitmap not found!" );
		}
	}

	// ______________________________________________________________________________
	//                                                                         RENDER
	// RRRRR  EEEEEE NN  NN DDDDD  EEEEEE RRRRR
	// RR  RR EE     NNN NN DD  DD EE     RR  RR
	// RRRRR  EEEE   NNNNNN DD  DD EEEE   RRRRR
	// RR  RR EE     NN NNN DD  DD EE     RR  RR
	// RR  RR EEEEEE NN  NN DDDDD  EEEEEE RR  RR

	/**
	* Draws the triangle into its MovieClip container.
	*
	* @param	container	The default MovieClip that you draw into when rendering.
	* @param	randomFill		A Boolean value that indicates whether random coloring is enabled. Typically used for debug purposes. Defaults to false.
	* @return					The number of triangles drawn. Either one if it is double sided or visible, or zero if it single sided and not visible.
	*
	*/
	public function render( container:MovieClip, objectMaterial:MaterialObject3D, randomFill:Boolean ): Number
	{
		var vertices:Array = this.vertices;
		var s0:Number3D = vertices[0].screen;
		var s1:Number3D = vertices[1].screen;
		var s2:Number3D = vertices[2].screen;

		var x0:Number = s0.x;
		var y0:Number = s0.y;
		var x1:Number = s1.x;
		var y1:Number = s1.y;
		var x2:Number = s2.x;
		var y2:Number = s2.y;

		var material :MaterialObject3D = this.material || objectMaterial;

		// Double sided?
		if( material.oneSide &&  (( x2 - x0 ) * ( y1 - y0 ) - ( y2 - y0 ) * ( x1 - x0 ) < 0 ) )
			if( materialBack )
				material = materialBack;
			else
				return 0;

		// Invisible?
		if( material.invisible ) return 0;

		var texture   :BitmapData  = material.bitmap;
		var fillAlpha :Number      = material.fillAlpha;
		var lineAlpha :Number      = material.lineAlpha;

		// Fill color
		if( randomFill )
		{
			container.beginFill( Math.random() * 0xFFFFFF );
		}
		else if( texture )
		{
			var a1  :Number  = this._a;
			var b1  :Number  = this._b;
			var c1  :Number  = this._c;
			var d1  :Number  = this._d;
			var tx1 :Number = this._tx;
			var ty1 :Number = this._ty;

			var a2 :Number = x1 - x0;
			var b2 :Number = y1 - y0;
			var c2 :Number = x2 - x0;
			var d2 :Number = y2 - y0;

			var matrix :Matrix = _bitmapMatrix;
			matrix.a = a1*a2 + b1*c2;
			matrix.b = a1*b2 + b1*d2;
			matrix.c = c1*a2 + d1*c2;
			matrix.d = c1*b2 + d1*d2;
			matrix.tx = tx1*a2 + ty1*c2 + x0;
			matrix.ty = tx1*b2 + ty1*d2 + y0;

			container.beginBitmapFill( texture, matrix, true, material.smooth );
		}
		else if( fillAlpha )
		{
			container.beginFill( material.fillColor, fillAlpha );
		}

		// Line color
		if( lineAlpha )
			container.lineStyle( 0, material.lineColor, lineAlpha );
		else
			container.lineStyle();

		// Draw triangle
		container.moveTo( x0, y0 );
		container.lineTo( x1, y1 );
		container.lineTo( x2, y2 );

		if( lineAlpha )
			container.lineTo( x0, y0 );

		if( texture || fillAlpha )
			container.endFill();

		return 1;
	}

	// ______________________________________________________________________________
	//                                                                        PRIVATE

	static private var _totalFaces: Number = 0;

	static private var _bitmapMatrix :Matrix;

	private var _a  :Number;
	private var _b  :Number;
	private var _c  :Number;
	private var _d  :Number;
	private var _tx :Number;
	private var _ty :Number;
}