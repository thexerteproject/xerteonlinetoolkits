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
//                                                        DisplayObject3D


import org.papervision3d.core.Number3D;
import org.papervision3d.core.proto.CameraObject3D;
import org.papervision3d.core.proto.SceneObject3D;

/**
* The DisplayObject3D class is at the root of the Papervision3D object class hierarchy.
* <p/>
* The DisplayObject3D class is the base class for all objects, not only those that can be rendered, but also the camera and its target. The Papervision3D class manages all objects displayed.
* <p/>
* The DisplayObject3D class supports basic functionality like the x, y and z position of an object, as well as rotationX, rotationY, rotationZ. It also supports more advanced properties of the object such as visible, and scaleX, scaleY and scaleZ. [TODO: transformation matrix.]
* <p/>
* DisplayObject3D is not an abstract base class; therefore, you can call DisplayObject3D directly. Invoking new DisplayObject() creates a new empty object in 3D space, like when you createEmptyMovieClip(). All 3D display objects inherit from the DisplayObject class. You can create a custom subclass of the DisplayObject class, or also extend a subclass of the DisplayObject class.
* <p/>
* Some properties previously used in the ActionScript 1.0 and 2.0 MovieClip classes (such as _x, _y, _xscale, _yscale and others) have equivalents in the DisplayObject3D class that are renamed as in ActionScript 3.0, so that they no longer begin with the underscore (_) character.
* <p/>
* It serves as the prototype for classes that extend the DisplayObject3D class. These classes are in org.papervision3D.objects package.
*
*/
class org.papervision3d.core.proto.DisplayObject3D
{
	/**
	* Indicates if the angles are expressed in degrees (true) or radians (false). The default value is true, degrees.
	*/
	public static var DEGREES :Boolean = true;

	/**
	* Indicates if the scales are expressed in percent (true) or from zero to one (false). The default value is false, i.e. units.
	*/
	public static var PERCENT :Boolean = false;


	/**
	* An Number that sets the X coordinate of a object relative to the scene coordinate system.
	*/
	public var x :Number;

	/**
	* An Number that sets the Y coordinate of a object relative to the scene coordinates.
	*/
	public var y :Number;

	/**
	* An Number that sets the Z coordinate of a object relative to the scene coordinates.
	*/
	public var z :Number;


	// ___________________________________________________________________________________________________
	//                                                                                     R O T A T I O N

	/**
	* Specifies the rotation around the X axis from its original orientation.
	*/
	public function get rotationX():Number
	{
		if( DEGREES ) return rad2deg( this._rotationX );
		else return this._rotationX;
	}

	public function set rotationX( rot:Number )
	{
		if( DEGREES ) this._rotationX = deg2rad( rot );
		else this._rotationX = rot;

		this._rotation = true;
	}
/*
	public function get tilt():Number
	{
		return this.rotationX;
	}

	public function set tilt( rot:Number )
	{
		this.rotationX = rot;
	}
*/

	/**
	* Specifies the rotation around the Y axis from its original orientation.
	*/
	public function get rotationY():Number
	{
		if( DEGREES ) return rad2deg( this._rotationY );
		else return this._rotationY;
	}

	public function set rotationY( rot:Number )
	{
		if( DEGREES ) this._rotationY = deg2rad( rot );
		else this._rotationY = rot;

		this._rotation = true;
	}
/*
	public function get pan():Number
	{
		return this.rotationY;
	}

	public function set pan( rot:Number )
	{
		this.rotationY = rot;
	}
*/

	/**
	* Specifies the rotation around the Z axis from its original orientation.
	*/
	public function get rotationZ():Number
	{
		if( DEGREES ) return rad2deg( this._rotationZ );
		else return this._rotationZ;
	}

	public function set rotationZ( rot:Number )
	{
		if( DEGREES ) this._rotationZ = deg2rad( rot );
		else this._rotationZ = rot;

		this._rotation = true;
	}
/*
	public function get roll():Number
	{
		return this.rotationZ;
	}

	public function set roll( rot:Number )
	{
		this.rotationZ = rot;
	}
*/

	private function rad2deg( rad:Number ):Number
	{
		return 180 * rad / Math.PI;
	}

	private function deg2rad( deg:Number ):Number
	{
		return Math.PI * deg / 180;
	}

	// ___________________________________________________________________________________________________
	//                                                                                           S C A L E
	/**
	* Sets the 3D scale as applied from the registration point of the object.
	*/
	public function get scale():Number
	{
		if( this._scaleX == this._scaleY && this._scaleX == this._scaleZ )
			if( PERCENT ) return this._scaleX * 100;
			else return this._scaleX;
		else return NaN;
	}

	public function set scale( scale:Number )
	{
		if( PERCENT ) scale /= 100;

		this._scaleX = this._scaleY = this._scaleZ = scale;

		this._scale = true;
	}


	/**
	* Sets the scale along the local X axis as applied from the registration point of the object.
	*/
	public function get scaleX():Number
	{
		if( PERCENT ) return this._scaleX * 100;
		else return this._scaleX;
	}

	public function set scaleX( scale:Number )
	{
		if( PERCENT ) this._scaleX = scale / 100;
		else this._scaleX = scale;

		this._scale = true;
	}

	/**
	* Sets the scale along the local Y axis as applied from the registration point of the object.
	*/
	public function get scaleY():Number
	{
		if( PERCENT ) return this._scaleY * 100;
		else return this._scaleY;
	}

	public function set scaleY( scale:Number )
	{
		if( PERCENT ) this._scaleY = scale / 100;
		else this._scaleY = scale;

		this._scale = true;
	}

	/**
	* Sets the scale along the local Z axis as applied from the registration point of the object.
	*/
	public function get scaleZ():Number
	{
		if( PERCENT ) return this._scaleZ * 100;
		else return this._scaleZ;
	}

	public function set scaleZ( scale:Number )
	{
		if( PERCENT ) this._scaleZ = scale / 100;
		else this._scaleZ = scale;

		this._scale = true;
	}


	/**
	* Whether or not the display object is visible.
	* <p/>
	* A Boolean value that indicates whether the object is projected, transformed and rendered. A value of false will effectively ignore the object. The default value is true.
	*/
	public var visible :Boolean;


	/**
	* An object that contains user defined properties.
	* <p/>
	* All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	*/
	public var extra :Object;


	/**
	* The MovieClip that you draw into when rendering. Use only when the object is rendered in its own unique MovieClip.
	*/
	public function get container():MovieClip
	{
		return this._container;
	}

	public function set container( gfx:MovieClip )
	{
		gfx.displayObject3D = this;
		this._container = gfx;
	}


	/**
	* The scene where the object belongs.
	*/
	public var scene :SceneObject3D;


	/**
	* Returns a DiplayObject3D object positioned in the center of the 3D coordinate system (0, 0 ,0).
	*/
	static public function get ZERO():DisplayObject3D
	{
		return new DisplayObject3D( {x:0, y:0, z:0} );
	}

	/**
	* Relative directions.
	*/
	static public var FORWARD  :Number3D = new Number3D(  0,  0,  1 );
	static public var BACKWARD :Number3D = new Number3D(  0,  0, -1 );
	static public var LEFT     :Number3D = new Number3D( -1,  0,  0 );
	static public var RIGHT    :Number3D = new Number3D(  1,  0,  1 );
	static public var UP       :Number3D = new Number3D(  0, -1,  0 );
	static public var DOWN     :Number3D = new Number3D(  0,  1,  0 );

//	public var omatrix :Matrix4;
//	public var ematrix :Matrix4;

	/**
	* [internal-use] The depth (z coordinate) of the transformed object's center. Also known as the distance from the camera. Used internally for z-sorting.
	*/
	public var screenZ :Number;

	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* The DisplayObject3D constructor lets you create generic 3D objects.
	*
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	*
	* <ul>
	* <li><b>x</b></b>: An Number that sets the X coordinate of a object relative to the scene coordinate system.</li>
	* <p/>
	* <li><b>y</b>: An Number that sets the Y coordinate of a object relative to the scene coordinate system.</li>
	* <p/>
	* <li><b>z</b>: An Number that sets the Z coordinate of a object relative to the scene coordinate system.</li>
	* <p/>
	* <li><b>rotationX</b>: Specifies the rotation around the X axis from its original orientation.</li>
	* <p/>
	* <li><b>rotationY</b>: Specifies the rotation around the Y axis from its original orientation.</li>
	* <p/>
	* <li><b>rotationZ</b>: Specifies the rotation around the Z axis from its original orientation.</li>
	* <p/>
	* <li><b>scaleX</b>: Sets the scale along the local X axis as applied from the registration point of the object.</li>
	* <p/>
	* <li><b>scaleY</b>: Sets the scale along the local Y axis as applied from the registration point of the object.</li>
	* <p/>
	* <li><b>scaleZ</b>: Sets the scale along the local Z axis as applied from the registration point of the object.</li>
	* <p/>
	* <li><b>visible</b>: Whether or not the display object is visible.
	* <p/>
	* A Boolean value that indicates whether the object is projected, transformed and rendered. A value of false will effectively ignore the object. The default value is true.</li>
	* <p/>
	* <li><b>extra</b>: An object that contains user defined properties.
	* <p/>
	* All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.</li>
	* </ul>
	*/
	public function DisplayObject3D( initObject:Object )
	{
		this.x = initObject.x || 0;
		this.y = initObject.y || 0;
		this.z = initObject.z || 0;

		rotationX = (initObject.rotationX || 0 );
		rotationY = (initObject.rotationY || 0 );
		rotationZ = (initObject.rotationZ || 0 );
		this._rotation = (this._rotationX == 0  &&  this._rotationY == 0  &&  this._rotationZ == 0);

		var scaleDefault:Number = PERCENT? 100 : 1;
		scaleX = initObject.scaleX || scaleDefault;
		scaleY = initObject.scaleY || scaleDefault;
		scaleZ = initObject.scaleZ || scaleDefault;
		this._scale = (this._scaleX == 1  &&  this._scaleY == 1  &&  this._scaleZ == 1);

		this.extra = initObject.extra;

		this.container = initObject.container;

		this.visible = (initObject.visible != false);

//		this.omatrix = Matrix4.createIdentity();
//		this.ematrix = Matrix4.createIdentity();
	}


	// ___________________________________________________________________________________________________
	//                                                                                       P R O J E C T
	// PPPPP  RRRRR   OOOO      JJ EEEEEE  CCCC  TTTTTT
	// PP  PP RR  RR OO  OO     JJ EE     CC  CC   TT
	// PPPPP  RRRRR  OO  OO     JJ EEEE   CC       TT
	// PP     RR  RR OO  OO JJ  JJ EE     CC  CC   TT
	// PP     RR  RR  OOOO   JJJJ  EEEEEE  CCCC    TT

	/**
	* Projects three dimensional coordinates onto a two dimensional plane to simulate the relationship of the camera to subject.
	* <p/>
	* This is the first step in the process of representing three dimensional shapes two dimensionally.
	*
	* @param	camera	Camera3D object to render from.
	*/
	public function project( camera :CameraObject3D ) {}

	// ___________________________________________________________________________________________________
	//                                                                                         R E N D E R
	// RRRRR  EEEEEE NN  NN DDDDD  EEEEEE RRRRR
	// RR  RR EE     NNN NN DD  DD EE     RR  RR
	// RRRRR  EEEE   NNNNNN DD  DD EEEE   RRRRR
	// RR  RR EE     NN NNN DD  DD EE     RR  RR
	// RR  RR EEEEEE NN  NN DDDDD  EEEEEE RR  RR

	/**
	* Draws the object into the MovieClip container.
	*
	* @param	scene	A Papervision3D object that contains the current scene.
	*/
	public function render( scene :SceneObject3D ) {}

	// ___________________________________________________________________________________________________

	public function moveForward  ( distance:Number ) { translate( distance, FORWARD  ); }
	public function moveBackward ( distance:Number ) { translate( distance, BACKWARD ); }
	public function moveLeft     ( distance:Number ) { translate( distance, LEFT     ); }
	public function moveRight    ( distance:Number ) { translate( distance, RIGHT    ); }
	public function moveUp       ( distance:Number ) { translate( distance, UP       ); }
	public function moveDown     ( distance:Number ) { translate( distance, DOWN     ); }

	public function translate( distance:Number, axis:Number3D )
	{
		var vector:Number3D = axis.clone();

		rotate( vector );

		this.x += distance * vector.x;
		this.y += distance * vector.y;
		this.z += distance * vector.z;
	}

	public function rotate( vector:Number3D )
	{
		var x0 :Number = vector.x;
		var y0 :Number = vector.y;
		var z0 :Number = vector.z;

		var rx   :Number = this._rotationX;
		var ry   :Number = this._rotationY;
		var rz   :Number = this._rotationZ;
		var cosX :Number = Math.cos( rx );
		var sinX :Number = Math.sin( rx );
		var cosY :Number = Math.cos( ry );
		var sinY :Number = Math.sin( ry );
		var cosZ :Number = Math.cos( rz );
		var sinZ :Number = Math.sin( rz );

		var x1 :Number = x0 * cosZ - y0 * sinZ;
		var y1 :Number = y0 * cosZ + x0 * sinZ;

		var x2 :Number = x1 * cosY - z0 * sinY;
		var z1 :Number = z0 * cosY + x1 * sinY;

		var y2 :Number = y1 * cosX - z1 * sinX;
		var z2 :Number = z1 * cosX + y1 * sinX;

		vector.x = x2;
		vector.y = y2;
		vector.z = z2;
	}

	// ___________________________________________________________________________________________________

	/**
	* Returns a string value representing the three-dimensional values in the specified Number3D object.
	*
	* @return	A string.
	*/
	public function toString(): String
	{
		return 'x:' + Math.round(this.x) + ' y:' + Math.round(this.y) + ' z:' + Math.round(this.z);
	}

	// ___________________________________________________________________________________________________
	//                                                                                       P R I V A T E

	private var _rotation  :Boolean;
	private var _rotationX :Number;
	private var _rotationY :Number;
	private var _rotationZ :Number;

	private var _scale  :Boolean;
	private var _scaleX :Number;
	private var _scaleY :Number;
	private var _scaleZ :Number;

	private var _container :MovieClip;
}