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

/**
 * @author John Grden
 */
 
import org.papervision3d.cameras.FreeCamera3D;
import org.papervision3d.materials.WireframeMaterial;
import org.papervision3d.objects.Stars;
import org.papervision3d.scenes.Scene3D;
import com.rockonflash.papervision3d.as2.utils.ObjectController;
 
class org.papervision3d.samples.stars.HelloStars extends MovieClip 
{
	// 3D
	private var scene     	:Scene3D;
	private var camera    	:FreeCamera3D;
	private var stars	  	:Stars;	
	private var starCanvas	:MovieClip;
	
	function HelloStars() 
	{
		super();
		
		init3D();
		
		this.onEnterFrame = loop3D;
	}
	
	public function init3D():Void
	{
		//starCanvas = canvas;
		
		// Create scene
		scene = new Scene3D( starCanvas);

		// Create camera
		camera = new FreeCamera3D();
		camera.zoom = 1.5;
		camera.focus = 500;
		camera.rotationY = 45;
		camera.rotationX = 30;
		camera.z = -4000;

		// Create material
		var material:WireframeMaterial = new WireframeMaterial(0xffffff, 100);

		// create Stars
		stars = new Stars(material, starCanvas, 1000, 640, 480, 7500, {});

		// Include in scene
		scene.push( stars );
		
		// objectController allows mouse click and drag controll as well as basic X and Z movement with arrows
		ObjectController.getInstance().registerControlObject(camera);
	}
	
	// _______________________________________________________________________
	//                                                                    Loop
	function loop3D()
	{
		// Render
		scene.renderCamera( camera );
	}

}