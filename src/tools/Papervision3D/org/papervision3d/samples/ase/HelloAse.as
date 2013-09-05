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

import org.papervision3d.cameras.FreeCamera3D;
import org.papervision3d.materials.BitmapMaterial;
import org.papervision3d.objects.Ase;
import org.papervision3d.scenes.Scene3D;

import flash.display.BitmapData;

class org.papervision3d.samples.ase.HelloAse extends MovieClip 
{
	// _______________________________________________________________________
	//                                                                  vars3D
	var container :MovieClip;
	var scene     :Scene3D;
	var camera    :FreeCamera3D;
	var sphere    :Ase;

	// _______________________________________________________________________
	//                                                                    Main
	function HelloAse()
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

		// Create scene
		scene = new Scene3D( container );

		// Create camera
		camera = new FreeCamera3D();

		// Create material
		var texture  :BitmapData = BitmapData.loadBitmap( "Bitmap" );
		var material :BitmapMaterial = new BitmapMaterial( texture );

		material.oneSide = true; // Make it single sided

		// Load sphere
		sphere = new Ase( material, "world.ase", .2 );
		sphere.rotationX = 45;

		// Include in scene
		scene.push( sphere );
	}

	// _______________________________________________________________________
	//                                                                    Loop
	function loop3D()
	{
		sphere.rotationY = container._xmouse /3;
		sphere.rotationX = container._ymouse /3;

		// Render
		scene.renderCamera( camera );
	}
}