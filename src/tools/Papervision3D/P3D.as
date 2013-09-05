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
import org.papervision3d.objects.Plane;
import org.papervision3d.scenes.MovieScene3D;

class P3D extends MovieClip 
{
	// _______________________________________________________________________
	//                                                                  vars3D
	var plane	  :Plane;
	var container :MovieClip;
	var scene     :MovieScene3D;
	var camera    :Camera3D;


	// _______________________________________________________________________
	//                                                                    Main
	function P3D()
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
		scene = new MovieScene3D( container );

		// Create camera
		camera = new Camera3D();
		camera.z = -2000;
		camera.zoom = 1;
		camera.focus = 500;

		// Create material
		var material :BitmapAssetMaterial = new BitmapAssetMaterial( "Bitmap" );
		material.oneSide = false; // Make it double sided

		plane = new Plane( material );
		
		plane.x = 0;
		plane.y = 0;
		plane.z = -100;
		
		// Include in scene
		scene.push( plane );
		
		plane.container.onRelease = function(){
			this._y += 200;
		}
	}

	// _______________________________________________________________________
	//                                                                    Loop
	function loop3D()
	{
		if (plane.z > -1500)
		{
			plane.rotationX += 20;
			plane.z -= 25;
		}

		// Render
		scene.renderCamera( camera );
	}
}