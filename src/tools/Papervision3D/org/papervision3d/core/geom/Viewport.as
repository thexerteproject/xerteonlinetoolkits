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
//                                                             Viewport3D

/**
* The Vertex3D constructor lets you create 3D vertices.
*/
class org.papervision3d.core.geom.Viewport
{
	/**
	* An Number that sets the max Y screen coordinate of the render.
	*/
	public var top :Number;

	/**
	* An Number that sets the min Y screen coordinate of the render.
	*/
	public var bottom :Number;

	/**
	* An Number that sets the max X screen coordinate of the render.
	*/
	public var right :Number;

	/**
	* An Number that sets the min X screen coordinate of the render.
	*/
	public var left :Number;

	/**
	* Creates a new Viewport object.
	*
	* @param	top		The max Y screen coordinate of the render.
	* @param	bottom	The min Y screen coordinate of the render.
	* @param	right	The max X screen coordinate of the render.
	* @param	left	The min X screen coordinate of the render.
	*
	*/
	public function Viewport( top:Number, bottom:Number, right:Number, left:Number )
	{
		this.top    = top    || 0;
		this.bottom = bottom || 0;
		this.right  = right  || 0;
		this.left   = left   || 0;
	}
}