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

// __________________________________________________________________________ MOVIE ASSET MATERIAL

import org.papervision3d.core.utils.AssetLibrary;
import org.papervision3d.materials.MovieMaterial;

import flash.display.BitmapData;


/**
* The MovieAssetMaterial class creates a texture from a MovieClip library symbol.
*
* The texture can be animated and/or transparent.
*
* The MovieClip's content needs to be top left aligned with the registration point.
*
* A material is extra that you assign to objects or faces, so that they appear a certain way when rendered. Materials affect the line and fill colors.
*
* Materials create greater realism in a scene. A material describes how an object reflects or transmits light. You assign materials to individual objects or a selection of faces; a single object can contain different materials.
*
*/
class org.papervision3d.materials.MovieAssetMaterial extends MovieMaterial
{

	// ______________________________________________________________________ NEW

	/**
	* The MovieAssetMaterial class creates a texture from a MovieClip library id.
	*
	* @param	id					The linkage name of the MovieClip symbol in the library.
	* @param	transparent			[optional] - If it's not transparent, the empty areas of the MovieClip will be of fill32 color. Default value is false.
	* @param	initObject			[optional] - An object that contains additional properties with which to populate the newly created material.
	*/

	function MovieAssetMaterial( id:String, transparent:Boolean, attachedMovieContainer:MovieClip, initObject:Object )
	{
		super( id, transparent, initMovieContainer( attachedMovieContainer, initObject ) );
	}


	// ______________________________________________________________________ CREATE BITMAP

	private function createBitmap( asset:String ):BitmapData
	{
		// Remove previous bitmap
		if( this._texture != asset )
		{
			var prevMovie:MovieClip = AssetLibrary.getAsset( this._texture );

			if( AssetLibrary.subAsset( this._texture ) == 0 )
				prevMovie.removeMovieClip();
		}

		// Retrieve from library or...
		var movie:MovieClip = AssetLibrary.getAsset( asset );

		// ...attachMovie
		if( ! movie )
		{
			movie = movieContainer.attachMovie( asset, asset, movieContainer.getNextHighestDepth() );

			if( movie )
			{
				// Movie attached ok
				movie._x = 99999;
				movie._y = 99999;
				movie._visible = false;
			}
		}

		// Add to library
		AssetLibrary.addAsset( asset, movie );

		// Create Bitmap
		return super.createBitmap( movie );
	}


	// ______________________________________________________________________ PRIVATE

	private function initMovieContainer( container:MovieClip, initObject:Object ):Object
	{
		container = container || _root; // Dodgy, but we've got to attach somewhere! Any ideas welcome.

		movieContainer = container.createEmptyMovieClip( "movieContainer", container.getNextHighestDepth() );

		// Hide it
		movieContainer._x = 99999;
		movieContainer._y = 99999;
		movieContainer._visible = false;

		return initObject;
	}


	// ______________________________________________________________________ PRIVATE VAR

	static private var movieContainer :MovieClip;
}