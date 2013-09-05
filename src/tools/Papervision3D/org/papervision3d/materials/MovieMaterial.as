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

// __________________________________________________________________________ MOVIE MATERIAL

import org.papervision3d.materials.BitmapMaterial;

import flash.display.BitmapData;
import flash.geom.Matrix;

/**
* The MovieMaterial class creates a texture from an existing MovieClip instance.
*
* The texture can be animated and/or transparent. Current scale and color values of the MovieClip instance will be used. Rotation will be discarded.
*
* The MovieClip's content needs to be top left aligned with the registration point.
*
* A material is extra that you assign to objects or faces, so that they appear a certain way when rendered. Materials affect the line and fill colors.
*
* Materials create greater realism in a scene. A material describes how an object reflects or transmits light. You assign materials to individual objects or a selection of faces; a single object can contain different materials.
*
*/
class org.papervision3d.materials.MovieMaterial extends BitmapMaterial
{
	// ______________________________________________________________________ PUBLIC

	/**
	* The MovieClip that is used as a texture.
	*/
	public var movie :MovieClip;

	/**
	* A Boolean value that determines whether the MovieClip is transparent. The default value is false, which is much faster.
	*/
	public var movieTransparent :Boolean;

	// ______________________________________________________________________ NEW

	/**
	* The MovieMaterial class creates a texture from an existing MovieClip instance.
	*
	* @param	asset			A String that contains an existing MovieClip library id.
	* @param	transparent		[optional] - If it's not transparent, the empty areas of the MovieClip will be of fill32 color. Default value is false.
	* @param	initObject		[optional] - An object that contains additional properties with which to populate the newly created material.
	*/
	public function MovieMaterial( asset, transparent:Boolean, initObject:Object )
	{
		super( initBitmap( asset, transparent ), initObject );
	}


	// ______________________________________________________________________ UPDATE

	/**
	* Updates animated MovieClip bitmap.
	*
	* Draws the current MovieClip image onto bitmap.
	*/
	public function updateBitmap()
	{
		var tex :BitmapData = this.bitmap;
		var mov :MovieClip  = this.movie;

		tex.fillRect( tex.rectangle, this.fillColor );

		var mtx:Matrix = new Matrix();
		mtx.scale( mov._xscale/100, mov._yscale/100 );

		tex.draw( mov, mtx, mov.transform.colorTransform );
	}


	// ______________________________________________________________________ CREATE BITMAP

	private function createBitmap( asset:MovieClip ):BitmapData
	{
		// Dispose of previous bitmap
		if( this.bitmap ) this.bitmap.dispose();

		// Create new bitmap
		this.bitmap = new BitmapData( asset._width, asset._height, this.movieTransparent );
		
		__bitmapList.push( this.bitmap );

		// Draw bitmap
		this.movie = asset;
		updateBitmap();

		return this.bitmap;
	}

	static public function disposeBitmaps():Void
	{
		while( __bitmapList.length > 0 )
		{
			var bitmap :BitmapData = __bitmapList.pop();
			bitmap.dispose();
		}
	}

	// ______________________________________________________________________ PRIVATE

	private function initBitmap( asset:MovieClip, transparent:Boolean ):MovieClip
	{
		this.movieTransparent = transparent || false;

		return asset;
	}

	static private var __bitmapList :Object = new Array();
}