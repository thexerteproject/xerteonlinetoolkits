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
//                                              DisplayObject3D: Camera3D

import org.papervision3d.core.Number3D;
import org.papervision3d.core.geom.Viewport;
import org.papervision3d.core.proto.DisplayObject3D;

/**
* The CameraObject3D class.
*
*/
class org.papervision3d.core.proto.CameraObject3D extends DisplayObject3D
{
	// __________________________________________________________________________
	//                                                                     PUBLIC

	/**
	* This value specifies the scale at which the 3D objects are rendered. Higher values magnify the scene, compressing distance. Use it in conjunction with focus.
	*/
	public var zoom :Number;


	/**
	* This value is a positive number representing the distance of the observer from the front clipping plane, which is the closest any object can be to the camera. Use it in conjunction with zoom.
	* <p/>
	* Higher focus values tend to magnify distance between objects while allowing greater depth of field, as if the camera had a wider lenses. One result of using a wide angle lens in proximity to the subject is an apparent perspective distortion: parallel lines may appear to converge and with a fisheye lens, straight edges will appear to bend.
	* <p/>
	* Because different lenses generally require a different camera�subject distance to preserve the size of a subject, changing the angle of view can indirectly distort perspective, changing the apparent relative size of the subject and foreground.
	*/
	public var focus :Number;


	/**
	* A Boolean value that determines whether the 3D objects are z-depth sorted between themselves when rendering.
	*/
	public var sort :Boolean;


	/**
	* A Viewport object that when crop is active, contains the region of the screen to crop to.
	*/
	public var viewport :Viewport;
	
	/**
	* A {@link Number3D} object that specifies the desired position of the camera in 3D space. Only used when calling update().
	*/
//	public var goto :Number3D;

	/**
	* A {@link Number3D} object that specifies the desired rotation of the camera in 3D space. Only used when calling update().
	*/
//	public var gotoRotation :Number3D;


	/**
	* The default z position of a new camera.
	*/
	public static var DEFAULT_Z :Number = -1000;

	/**
	* The default z position of a new camera.
	*/
	public static var DEFAULT_ZOOM :Number = 3;

	/**
	* The default z position of a new camera.
	*/
	public static var DEFAULT_FOCUS :Number = 500;


	/**
	* [internal-use] A Number3D object that stores the sin of the camera's 3D angle. Internal use only.
	*/
	public var sin :Number3D;

	/**
	* [internal-use] A Number3D object that stores the cos of the camera's 3D angle. Internal use only.
	*/
	public var cos :Number3D;


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
	public function CameraObject3D( zoom:Number, focus:Number, initObject:Object )
	{
		super( initObject );

		this.z = DEFAULT_Z; //So we start with a valid camera setup.

		this.zoom  = zoom  || DEFAULT_ZOOM;
		this.focus = focus || DEFAULT_FOCUS;

		this.sort = ( initObject.sort != false );

		this.sin = new Number3D();
		this.cos = new Number3D();
		
		viewport = new Viewport();
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
		var rotX :Number = this._rotationX;
		var rotY :Number = this._rotationY;
		var rotZ :Number = this._rotationZ;

		var cos :Number3D = this.cos;
		var sin :Number3D = this.sin;

		cos.x = Math.cos( rotX );
		sin.x = Math.sin( rotX );
		cos.y = Math.cos( rotY );
		sin.y = Math.sin( rotY );
		cos.z = Math.cos( rotZ );
		sin.z = Math.sin( rotZ );
	}
}