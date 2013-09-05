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
//                                                  DisplayObject3D: Mesh

import org.papervision3d.core.geom.Face3D;
import org.papervision3d.core.geom.Vertex3D;
import org.papervision3d.core.NumberUV;
import org.papervision3d.core.Number3D;
import org.papervision3d.core.proto.CameraObject3D;
import org.papervision3d.core.proto.MaterialObject3D;
import org.papervision3d.core.proto.SceneObject3D;
import org.papervision3d.objects.Points;

/**
* The Mesh DisplayObject3D class lets you create and display solid 3D objects made of vertices and triangular polygons.
*/
class org.papervision3d.objects.Mesh extends Points
{
	public function get material():MaterialObject3D
	{
		return this._material;
	}

	public function set material( newMaterial:MaterialObject3D )
	{
		transformUV( newMaterial );
		this._material = newMaterial;
	}


	/**
	* An array of Face3D objects for the faces of the mesh.
	*/
	public var faces      :Array;

	/**
	* A Boolean value that indicates whether random coloring is enabled. Typically used for debug purposes. Defaults to false.
	*/
	public var showFaces  :Boolean;

	/**
	* A Boolean value that determines whether the object's triagles are z-depth sorted between themselves when rendering.
	*/
	public var sortFaces  :Boolean;


	// ___________________________________________________________________________________________________
	//                                                                                               N E W
	// NN  NN EEEEEE WW    WW
	// NNN NN EE     WW WW WW
	// NNNNNN EEEE   WWWWWWWW
	// NN NNN EE     WWW  WWW
	// NN  NN EEEEEE WW    WW

	/**
	* Creates a new Mesh object.
	*
	* The Mesh DisplayObject3D class lets you create and display solid 3D objects made of vertices and triangular polygons.
	* <p/>
	* @param	material	A Material3D object that contains the material properties of the object.
	* <p/>
	* @param	vertices	An array of Vertex3D objects for the vertices of the mesh.
	* <p/>
	* @param	faces		An array of Face3D objects for the faces of the mesh.
	* <p/>
	* @param	initObject	[optional] - An object that contains user defined properties with which to populate the newly created DisplayObject3D.
	* <p/>
	* It includes x, y, z, rotationX, rotationY, rotationZ, scaleX, scaleY scaleZ and a user defined extra object.
	* <p/>
	* If extra is not an object, it is ignored. All properties of the extra field are copied into the new instance. The properties specified with extra are publicly available.
	* <ul>
	* <li><b>sortFaces</b>: Z-depth sorting when rendering. Some objects might not need it. Default is false (faster).</li>
	* <li><b>showFaces</b>: Use only if each face is on a separate MovieClip container. Default is false.</li>
	* </ul>
	*
	*/
	public function Mesh( material:MaterialObject3D, vertices:Array, faces:Array, initObject:Object )
	{
		super( vertices, initObject );

		this.faces     = faces || new Array();
		this._material = material || MaterialObject3D.DEFAULT;

		this.sortFaces = (initObject.sortFaces != false);
		this.showFaces = initObject.showFaces  || false;
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
	*
	* This is the first step in the process of representing three dimensional shapes two dimensionally.
	*
	* @param	camera	Camera3D object to render from.
	*/
	public function project( camera :CameraObject3D )
	{
		// Vertices
		super.project( camera );

		// Faces
		var faces        :Array  = this.faces;
		var screenZs     :Number = 0;
		var visibleFaces :Number = 0;

		var viewTop    :Number  = camera.viewport.top;
		var viewBottom :Number  = camera.viewport.bottom;
		var viewRight  :Number  = camera.viewport.right;
		var viewLeft   :Number  = camera.viewport.left;

		var vertex0 :Vertex3D, vertex1 :Vertex3D, vertex2 :Vertex3D, vis :Boolean;
		var screen0 :Number3D, screen1 :Number3D, screen2 :Number3D;
	
		var face:Object;
		
		for( var i:Number = 0; face = faces[i]; i++ )
		{
			vertex0 = face.vertices[0];
			vertex1 = face.vertices[1];
			vertex2 = face.vertices[2];

			vis = ( Number(vertex0.visible) + Number(vertex1.visible) + Number(vertex2.visible) ) == 3;

			screen0 = vertex0.screen;
			screen1 = vertex1.screen;
			screen2 = vertex2.screen;

			// Top
			if( vis && viewTop )
				vis = (screen0.y > viewTop || screen1.y > viewTop || screen2.y > viewTop);

			// Bottom
			if( vis && viewBottom )
				vis = (screen0.y < viewBottom || screen1.y < viewBottom || screen2.y < viewBottom);
			
			// Right
			if( vis && viewRight )
				vis = (screen0.x < viewRight || screen1.x < viewRight || screen2.x < viewRight);

			// Left
			if( vis && viewLeft )
				vis = (screen0.x > viewLeft || screen1.x > viewLeft || screen2.x > viewLeft);

			face.isVisible = vis;

			if( vis )
			{
				screenZs += face.screenZ = ( screen0.z + screen1.z + screen2.z ) /3;
				visibleFaces++;
			}
		}

		this._visibleNow = ( visibleFaces > 0 );

		if( this._visibleNow )
			this.screenZ = screenZs / visibleFaces;
		else
			this.screenZ = 0;
	}

	// ___________________________________________________________________________________________________
	//                                                                                         R E N D E R
	// RRRRR  EEEEEE NN  NN DDDDD  EEEEEE RRRRR
	// RR  RR EE     NNN NN DD  DD EE     RR  RR
	// RRRRR  EEEE   NNNNNN DD  DD EEEE   RRRRR
	// RR  RR EE     NN NNN DD  DD EE     RR  RR
	// RR  RR EEEEEE NN  NN DDDDD  EEEEEE RR  RR

	/**
	* Render object.
	*
	* @param	scene	Stats object to update.
	*/
	public function render( scene :SceneObject3D )
	{
		if( this._visibleNow )
		{
			var faces:Array = this.faces;

			// Z Sort
			if( this.sortFaces )
				faces.sortOn( 'screenZ', Array.DESCENDING | Array.NUMERIC );

			// Render
			var container      :MovieClip        = this._container || scene.container;
			var objectMaterial :MaterialObject3D = this._material;
			var showFaces      :Boolean          = this.showFaces;
			var rendered       :Number           = 0;

			var face :Face3D;

			for( var i:Number = 0; face = faces[i]; i++ )
			{
				if( face.isVisible )
					rendered += face.render( container, objectMaterial, showFaces );
			}

			// Update stats
			scene.stats.rendered += rendered;
		}
	}

	/**
	* Planar projection from the specified plane.
	*
	* @param	u	The texture horizontal axis. Can be "x", "y" or "z". The default value is "x".
	* @param	v	The texture vertical axis. Can be "x", "y" or "z". The default value is "x".
	*/
	public function projectTexture( u:String, v:String )
	{
		u = u || "x";
		v = v || "y";

		var faces :Array  = this.faces;

		var bBox  :Object = this.boundingBox();
		var minX  :Number = bBox.min[u];
		var sizeX :Number = bBox.size[u];
		var minY  :Number = bBox.min[v];
		var sizeY :Number = bBox.size[v];

		var objectMaterial :MaterialObject3D = this._material;

		for( var i:String in faces )
		{
			var myFace     :Face3D = faces[Number(i)];
			var myVertices :Array  = myFace.vertices;

			var a :Vertex3D = myVertices[0];
			var b :Vertex3D = myVertices[1];
			var c :Vertex3D = myVertices[2];

			var uvA :NumberUV = new NumberUV( (a[u] - minX) / sizeX, (a[v] - minY) / sizeY );
			var uvB :NumberUV = new NumberUV( (b[u] - minX) / sizeX, (b[v] - minY) / sizeY );
			var uvC :NumberUV = new NumberUV( (c[u] - minX) / sizeX, (c[v] - minY) / sizeY );

			myFace.uv = [ uvA, uvB, uvC ];

			if( objectMaterial.bitmap )
				myFace.transformUV( objectMaterial );
		}
	}


	public function transformUV( material:MaterialObject3D )
	{
		if( material.bitmap )
			for( var i:String in this.faces )
				faces[i].transformUV( material );
	}


	private var _visibleNow :Boolean;

	private var _material   :MaterialObject3D;
}