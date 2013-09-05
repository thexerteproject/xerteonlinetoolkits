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
//                                                               NumberUV


/**
* The NumberUV class represents a value in a texture UV coordinate system.
*
* Properties u and v represent the horizontal and vertical texture axes respectively.
*
*/
class org.papervision3d.core.NumberUV
{
	/**
	* The horizontal coordinate value.
	*/
	public var u: Number;

	/**
	* The vertical coordinate value.
	*/
	public var v: Number;

	/**
	* Creates a new NumberUV object whose coordinate values are specified by the u and v parameters. If you call this constructor function without parameters, a NumberUV with u and v properties set to zero is created.
	*
	* @param	u	The horizontal coordinate value. The default value is zero.
	* @param	v	The vertical coordinate value. The default value is zero.
	*/
	public function NumberUV( u: Number, v: Number )
	{
		this.u = u || 0;
		this.v = v || 0;
	}


	/**
	* Returns a new NumberUV object that is a clone of the original instance with the same UV values.
	*
	* @return	A new NumberUV instance with the same UV values as the original NumberUV instance.
	*/
	public function clone():NumberUV
	{
		return new NumberUV( this.u, this.v );
	}


	/**
	* Returns a NumberUV object with u and v properties set to zero.
	*
	* @return A NumberUV object.
	*/
	static public function get ZERO():NumberUV
	{
		return new NumberUV( 0, 0 );
	}


	/**
	* Returns a string value representing the UV values in the specified NumberUV object.
	*
	* @return	A string.
	*/
	public function toString(): String
	{
		return 'u:' + u + ' v:' + v;
	}
}