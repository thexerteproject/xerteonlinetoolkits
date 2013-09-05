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
Copyright (c) 2007 Carlos Ulloa

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import org.papervision3d.cameras.Camera3D;
import org.papervision3d.materials.BitmapAssetMaterial;
import org.papervision3d.scenes.MovieScene3D;
import org.papervision3d.objects.Plane;

class org.papervision3d.samples.hotspot.HelloHotspot extends MovieClip 
{
	// _______________________________________________________________________
	//                                                                  vars3D
	var container :MovieClip;
	var scene     :MovieScene3D;
	var camera    :Camera3D;


	// _______________________________________________________________________
	//                                                                    Main
	function HelloHotspot()
	{
		init3D();

		this.onEnterFrame = loop3D;
	}


	// _______________________________________________________________________
	//                                                                  Init3D
	function init3D()
	{
		// Create container movieclip and center it
		container = this.createEmptyMovieClip( "container", this.getNextHighestDepth() );
		container._x = 320;
		container._y = 240;

		// Create MovieScene for hotspot mode
		// This scene renders each object in a separate movie clip, so you can add events to them easily.
		// This movie clip is called container.
		scene = new MovieScene3D( container );

		// Create camera
		camera = new Camera3D();
		camera.z = -2000;
		camera.zoom = 1;
		camera.focus = 500;

		// Create material
		var material :BitmapAssetMaterial = new BitmapAssetMaterial( "Bitmap" );
		material.oneSide = false; // Make it double sided

		// Create Planes x50
		var radius:Number = 2500;

		for( var i:Number = 0; i < 50; i++ )
		{
			var plane :Plane = new Plane( material, 1.5 );

			// Randomize position
			plane.x = Math.random() * radius - radius/2;
			plane.y = Math.random() * radius - radius/2;
			plane.z = Math.random() * radius - radius/2;

			// Randomize rotation
			plane.rotationX = Math.random() * 360;
			plane.rotationY = Math.random() * 360;
			plane.rotationZ = Math.random() * 360;

			// Include in scene
			scene.push( plane );

			var container:MovieClip = plane.container;
			container._alpha = 50;

			container.onRollOver = function()
			{
				this._alpha = 100;
				this.displayObject3D.scaleX = this.displayObject3D.scaleY = 1.5;
			};

			container.onRollOut = container.onReleaseOutside = function()
			{
				this._alpha = 50;
				this.displayObject3D.scaleX = this.displayObject3D.scaleY = 1;
			};

			container.onPress = function()
			{
				this.displayObject3D.visible = false;
			};
		}
	}

	// _______________________________________________________________________
	//                                                                    Loop
	function loop3D()
	{
		// Some easing for the camera
		camera.x -= (camera.x + container._xmouse) /8;
		camera.y -= (camera.y + container._ymouse) /8;

		// Render
		scene.renderCamera( camera );
	}
}