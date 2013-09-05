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
//                                              DisplayObject3D: Camera3D


import org.papervision3d.core.Number3D;
import org.papervision3d.core.proto.CameraObject3D;
import org.papervision3d.core.proto.DisplayObject3D;

/**
* The Camera3D class lets you specify how to present a scene from a particular point of view.
* <p/>
* Camera3D objects simulate still-image, motion picture, or video cameras in the real world. When rendering, the 3D objects are drawn as if you were looking through its lens.
*
*/
class org.papervision3d.cameras.Camera3D extends CameraObject3D
{
	// __________________________________________________________________________
	//                                                                     PUBLIC

	/**
	* A {@link DisplayObject3D} object that specifies the current position of the camera's target in 3D space.
	* <p/>
	* If null, rotationX and rotationY must be manually adjusted when aiming the camera, while rotationZ (camera roll) is always manual. The default value is {@link DisplayObject3D}.ZERO, the coordinate system origin.
	*/
	public var target :DisplayObject3D;


	/**
	* A {@link Number3D} object that specifies the desired position of the camera in 3D space. Only used when calling update().
	*/
	public var goto :Number3D;

	/**
	* A {@link Number3D} object that specifies the desired rotation of the camera in 3D space. Only used when calling update().
	*/
//	public var gotoRotation :Number3D;

	/**
	* A {@link Number3D} object that specifies the desired position of the camera's target in 3D space. Only used when calling update().
	*/
//	public var gotoTarget :Number3D;

	// __________________________________________________________________________
	//                                                                      N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* The Camera3D constructor lets you set up the view of a scene that will be rendered.
	*
	* Its position can be specified in the initObject. The default value of z is DEFAULT_Z.
	*
	* @param	target		[optional] - A {@link DisplayObject3D} object that specifies the current position of the camera's target in 3D space.
	* <p/>
	* If null, rotationX and rotationY must be manually adjusted when aiming the camera, while rotationZ (camera roll) is always manual. The default value is DisplayObject3D.ZERO, the origin of the 3D coordinate system.
	* <p/>
	* @param	zoom		[optional] - This value specifies the scale at which the 3D objects are rendered. Higher values magnify the scene, compressing distance. Use it in conjunction with focus. The default value is 2.
	* <p/>
	* @param	focus		[optional] - This value is a positive number representing the distance of the observer from the front clipping plane, which is the closest any object can be to the camera. Use it in conjunction with zoom. The default value is 100.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined data object.
	* <p/>
	* If data is not an object, it is ignored. All properties of the data field are copied into the new instance. The properties specified with data are publicly available.
	*
	* <ul>
	* <li><b>sort</b>: A Boolean value that determines whether the 3D objects are z-depth sorted between themselves when rendering. The default value is true.</li>
	* </ul>
	*/
	public function Camera3D( target:DisplayObject3D, zoom:Number, focus:Number, initObject:Object )
	{
		super( zoom, focus, initObject );
		this.target = target || DisplayObject3D.ZERO;

		this.goto = new Number3D( this.x, this.y, this.z );
//		this.goTarget = new Number3D( this.target.x, this.target.y, this.target.z );
	}

	// ___________________________________________________________________________________________________
	//                                                                                   T R A N S F O R M
	// TTTTTT RRRRR    AA   NN  NN  SSSSS FFFFFF OOOO  RRRRR  MM   MM
	//   TT   RR  RR  AAAA  NNN NN SS     FF    OO  OO RR  RR MMM MMM
	//   TT   RRRRR  AA  AA NNNNNN  SSSS  FFFF  OO  OO RRRRR  MMMMMMM
	//   TT   RR  RR AAAAAA NN NNN     SS FF    OO  OO RR  RR MM M MM
	//   TT   RR  RR AA  AA NN  NN SSSSS  FF     OOOO  RR  RR MM   MM

	/**
	* Transform coordinates from the world reference frame to the observer's one.
	*
	*/
	public function transform()
	{
		var target  :DisplayObject3D = this.target;
		var targetX :Number = target.x - this.x;
		var targetY :Number = target.y - this.y;
		var targetZ :Number = target.z - this.z;

		this._rotationY = Math.atan2( targetX, targetZ );
		this._rotationX = Math.atan2( targetY, Math.sqrt( targetZ * targetZ + targetX * targetX ));
//		this._rotationZ = Math.atan2( targetX, targetY );

		super.transform();
	}

	// ___________________________________________________________________________________________________
	//
	// UU  UU PPPPP  DDDDD    AA   TTTTTT EEEEEE
	// UU  UU PP  PP DD  DD  AAAA    TT   EE
	// UU  UU PPPPP  DD  DD AA  AA   TT   EEEE
	// UU  UU PP     DD  DD AAAAAA   TT   EE
	//  UUUU  PP     DDDDD  AA  AA   TT   EEEEEE

	/**
	* Hovers the camera around as the user moves the mouse, without changing the distance to the target. This greatly enhances the 3D illusion.
	*
	* @param	type	Type of movement.
	* @param	mouseX	Indicates the x coordinate of the mouse position in relation to the container MovieClip.
	* @param	mouseY	Indicates the y coordinate of the mouse position in relation to the container MovieClip.
	*/
	public function hover( type:Number, mouseX:Number, mouseY:Number )
	{
		var target   :DisplayObject3D = this.target;
		var goto     :Number3D = this.goto;
//		var gotoTarget :Number3D = this.gotoTarget;

		switch( type )
		{
			case 0:
				// Sphere mapped camera (free)
				var camSpeed :Number = 8;
				var dX       :Number = goto.x - target.x;
				var dZ       :Number = goto.z - target.z;

				var ang      :Number = Math.atan2( dZ, dX );
				var dist     :Number = Math.sqrt( dX*dX + dZ*dZ );
				var xMouse   :Number = 0.5 * mouseX;

				var camX :Number = dist * Math.cos( ang - xMouse );
				var camZ :Number = dist * Math.sin( ang - xMouse );
				var camY :Number = goto.y - 300 * mouseY;

				this.x -= (this.x - camX) /camSpeed;
				this.y -= (this.y - camY) /camSpeed;
				this.z -= (this.z - camZ) /camSpeed;
				break;

			case 1:
				var camSpeed :Number = 8;
				this.x -= (this.x - 1000 * mouseX) /camSpeed;
				this.y -= (this.y - 1000 * mouseY) /camSpeed;
//				this.z -= (this.z - ) /camSpeed;
				break;

/*
			// BROKEN
			case ???:
				// Sphere mapped camera (fixed)
				var dX = cam.pos.gx - cam.target.x;
				var dZ = cam.pos.gz - cam.target.z;
				ang -= ( ang - (Math.atan2( dZ, dX ) - mouseX/300) ) /camSpeed;
				dist -= ( dist - Math.sqrt( dX*dX + dZ*dZ ) ) /camSpeed;
				var camX = dist * Math.cos( ang );
				var camZ = dist * Math.sin( ang );
				var camY = -mouseY/3;

				cam.pos.x = camX;
				cam.pos.y -= (cam.pos.y - (camY + cam.pos.gy) ) /camSpeed;
				cam.pos.z = camZ;
				break;
*/
		}
	}
}