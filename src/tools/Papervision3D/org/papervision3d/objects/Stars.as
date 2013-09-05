// ______________________________________________________________________________

// PAPER     ON    ERVIS   NPAPER  ISION   PE  IS  ON   PERVI  IO   APER   SI  PA
// AP  VI   ONPA   RV  IO  PA      SI  PA  ER  SI  NP  PE      ON  AP  VI  ION AP
// PERVI   ON  PE  VISIO   APER    IONPA   RV  IO  PA   RVIS   NP  PE  IS  ONPAPE
// ER      NPAPER  IS      PE      ON  PE   ISIO   AP      IO  PA  ER  SI  NP PER
// RV      PA  RV  SI      ERVISI  NP  ER    IO    PE  VISIO   AP   VISI   PA  RV

// PAPERVISION 5 Alpha
// Carlos Ulloa Matesanz

// C4RL054321@gmail.com
// www.noventaynueve.com
// noventaynueve.com/blog



import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.objects.Points;
import org.papervision3d.Papervision3D;

import flash.display.BitmapData;
import flash.geom.Point;


/**
* The Stars DisplayObject3D class lets you create and display 3D starfields.
* <p/>
*/
class org.papervision3d.objects.Stars extends Points
{
	/**
	* A Material3D object that contains the material properties of the triangle.
	*/
	public var material   :MaterialObject3D;

	/**
	* The number of stars.
	*/
	public var quantity :Number;

	/**
	* The width.
	*/
	public var width :Number;

	/**
	* Height
	*/
	public var height :Number;

	/**
	* Depth
	*/
	public var depth :Number;


	/**
	* Default size of Plane if not texture is defined.
	*/
	static public var DEFAULT_SIZE :Number = 1000;

	/**
	* Default size of Plane if not texture is defined.
	*/
	static public var DEFAULT_STAGE_WIDTH :Number = 2048;
	static public var DEFAULT_STAGE_HEIGHT :Number = 2048;


	/**
	* Size of the stage.
	*/
	public var stageWidth  :Number;

	/**
	* Size of the stage.
	*/
	public var stageHeight :Number;



	private var _bdCanvas :BitmapData;

	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Create new Stars object.
	* <p/>
	* @param	material	A Material3D object that contains the material properties of the object.
	* <p/>
	* @param	width		Width.
	* <p/>
	* @param	height		Height.
	* <p/>
	* @param	depth		Depth.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined data object.
	* <p/>
	* If data is not an object, it is ignored. All properties of the data field are copied into the new instance. The properties specified with data are publicly available.
	*/
	public function Stars( material:MaterialObject3D, target:MovieClip, quantity:Number, width:Number, height:Number, depth:Number, initObject:Object )
	{
		if( target instanceof MovieClip )
		{
			super( new Array(), initObject );

			this.material = material || MaterialObject3D.DEFAULT;

			this.quantity = quantity || DEFAULT_SIZE;

			this.width  = width  || DEFAULT_SIZE;
			this.height = height || DEFAULT_SIZE;
			this.depth  = depth  || DEFAULT_SIZE;

			this.stageWidth  = initObject.stageWidth  || DEFAULT_STAGE_WIDTH;
			this.stageHeight = initObject.stageHeight || DEFAULT_STAGE_HEIGHT;

			//buildStars2Cube();
			buildStars2Radius();

			_bdCanvas = new BitmapData( this.stageWidth, this.stageHeight, false, 0x00000000 );
			_bdCanvas.copyPixels( this.material.bitmap, this.material.bitmap.rectangle, new Point( 0, 0 ) );

			// Attach bitmap to canvas
			var canvas :MovieClip = target;
			canvas.attachBitmap( _bdCanvas, canvas.getNextHighestDepth() );
			canvas._x = 0;
			canvas._y = 0;

			this.screenZ = 66666666; // Backdrop
		}
		else if( Papervision3D.VERBOSE )
			trace( "Stars: Canvas not found" );
	}

	private function buildStars2Cube()
	{
		var quantity:Number = this.quantity;
		var vertices:Array = this.vertices;

		var width  :Number = this.width;
		var height :Number = this.height;
		var depth  :Number = this.depth;

		var width2  :Number = width /2;
		var height2 :Number = height /2;
		var depth2  :Number = depth /2;

		// Vertices
		for( var i:Number = 0; i < quantity; i++ )
		{
			var x :Number = Math.random() * width  - width2;
			var y :Number = Math.random() * height - height2;
			var z :Number = Math.random() * depth  - depth2;

			var v :Vertex3D = new Vertex3D( x, y, z );
			v.extra = new Object();
			v.extra.color =(Math.floor( 0x60 + 0x80 * Math.random() ) << 24) + 0xFFFFFF;

			vertices.push( v );
		}
	}
	
	private function buildStars2Radius():Void
	{
		var quantity:Number = this.quantity;
		var vertices:Array = this.vertices;
		var radius:Number = depth;
		var radius2:Number = radius/2;
		
		var x, y, z:Number;
		
		for( var i:Number = 0; i < quantity; i++ )
		{
			do
			{
				x = Math.random() * radius - radius2;
				y = Math.random() * radius - radius2;
				z = Math.random() * radius - radius2;
			}
			while( x*x+y*y+z*z > radius2*radius2 );
		
			var v :Vertex3D = new Vertex3D( x, y, z );
			v.extra = new Object();
			v.extra.color =(Math.floor( 0x60 + 0x80 * Math.random() ) << 24) + 0xFFFFFF;
			vertices.push( v );
		}
	}

	public function render( scene :Papervision3D )
	{
		// Clear bitmap
		var sW2: Number = this.stageWidth /2;
		var sH2: Number = this.stageHeight /2;

		var bd:BitmapData = this._bdCanvas;
		bd.fillRect( bd.rectangle, 0x00000000 );
		bd.copyPixels( this.material.bitmap, this.material.bitmap.rectangle, new Point( 0, 0 ) );

		// Paint stars
		var vertices:Array = this.vertices;
		var pixels :Number = 0;

		var color :Number = material.fillColor == undefined ? 0xFFFFFF : material.fillColor;
		var v:Vertex3D;
		for( var i:Number = 0; v = vertices[i]; i++ )
		{
			if( v.visible)
			{
				_bdCanvas.setPixel( sW2 + v.screen.x, sH2 + v.screen.y, v.extra.color );
				pixels++;
			}
		}
	}
}