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
//                                                                Scene3D

import org.papervision3d.core.proto.DisplayObject3D;
import org.papervision3d.scenes.Scene3D;

/**
* Scene3D
* The Scene3D class lets you create, manipulate and display 3D objects.
*
*/
class org.papervision3d.scenes.MovieScene3D extends Scene3D
{
	/**
	* [internal-use] Maximum depth level used when rendering objects with their own MovieClip.
	*/
	public static var MAX_DEPTH :Number = 1000;


	// ___________________________________________________________________________________________________
	//                                                                           P A P E R V I S I O N 3 D
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* The Papervision3D class lets you create, manipulate and display 3D objects.
	*
	* @param	container	The MovieClip that you draw into when rendering. If not defined, each object must have it's own private container.
	*
	*/
	public function MovieScene3D( container:MovieClip )
	{
		super( container );

		this.containerList = new Array();
	}


	/**
	* Includes an DisplayObject3D or a Material3D element in the scene.
	*
	* @param	sceneElement	Element to add.
	*/
	public function push( sceneElement )
	{
		super.push( sceneElement );

		if( sceneElement instanceof DisplayObject3D )
		{
			sceneElement.container = container.createEmptyMovieClip( "Object" + objects.length, container.getNextHighestDepth() );
			this.containerList.push( sceneElement.container );
		}
	}


	// ___________________________________________________________________________________________________
	//                                                                           R E N D E R   C A M E R A
	// RRRRR  EEEEEE NN  NN DDDDD  EEEEEE RRRRR
	// RR  RR EE     NNN NN DD  DD EE     RR  RR
	// RRRRR  EEEE   NNNNNN DD  DD EEEE   RRRRR
	// RR  RR EE     NN NNN DD  DD EE     RR  RR
	// RR  RR EEEEEE NN  NN DDDDD  EEEEEE RR  RR CAMERA

	/**
	* Generates an image from the camera's point of view and the active models of the scene.
	*
	* @param	camera		Camera3D object to render from.
	*/
	public function renderObjects( sort:Boolean )
	{
		var objectsLength :Number = objects.length;

		// Clear object container
		var gfx           :MovieClip;
		var containerList :Array = this.containerList;
		var i             :Number = 0;

		// Clear all known object
		while( gfx = containerList[i++] ) gfx.clear();

		// Render
		var p       :DisplayObject3D;
		var objects :Array  = this.objects;
		i = objects.length;

		if( sort )
		{
			while( p = objects[--i] )
			{
				if( p.visible )
				{
					p.container.swapDepths( MAX_DEPTH - i );
					p.render( this );
				}
			}
		}
		else
		{
			while( p = objects[--i] )
			{
				if( p.visible )
				{
					p.render( this );
				}
			}
		}

		// Update stats
		var stats:Object  = this.stats;
		stats.performance = getTimer() - stats.performance;
	}

	private var containerList :Array;
}