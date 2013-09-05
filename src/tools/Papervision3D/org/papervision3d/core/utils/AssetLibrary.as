/*
 *  PAPER    ON   ERVIS  NPAPER ISION  PE  IS ON  PERVI IO  APER  SI  PA
 *  AP  VI  ONPA  RV  IO PA     SI  PA ER  SI NP PE     ON AP  VI ION AP
 *  PERVI  ON  PE VISIO  APER   IONPA  RV  IO PA  RVIS  NP PE  IS ONPAPE
 *  ER     NPAPER IS     PE     ON  PE  ISIO  AP     IO PA ER  SI NP PER
 *  RV     PA  RV SI     ERVISI NP  ER   IO   PE VISIO  AP  VISI  PA  RV3D
 *  ______________________________________________________________________
 *  papervision3d.org + blog.papervision3d.org + osflash.org/papervision3d
 */

/*
 * Copyright 2006-2007 (c) Carlos Ulloa Matesanz, noventaynueve.com.
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
//                                                           AssetLibrary

import flash.display.BitmapData;

import org.papervision3d.Papervision3D;
import org.papervision3d.materials.MovieMaterial;

class org.papervision3d.core.utils.AssetLibrary
{
	static private var __assetList :Object = new Object();
	
	//function AssetLibrary()	{}

	static public function getAsset( id:String )
	{
		return __assetList[ id ];
	}


	static public function addAsset( id:String, asset ):Number
	{
		var entry:Object = __assetList[ id ];

		if( entry )
		{
			entry.count++;
		}
		else
		{
			entry = new Object();
			entry.asset = asset;
			entry.count = 1;
			__assetList[ id ] = entry;
		}
		return entry.count;
	}


	static public function subAsset( id:String ):Number
	{
		var entry:Object = __assetList[ id ];

		if( entry.count )
		{
			entry.count--;

			if( entry.count == 0 )
			{
				disposeAsset( entry.asset );
				delete entry;
				return 0;
			}
			else return entry.count;
		}
		else return -1;
	}
	
	static public function cleanup()
	{
		for( var i:String in __assetList )
		{
			disposeAsset( __assetList[i].asset );
			delete __assetList[i];
		}

		__assetList = new Object();
		
		MovieMaterial.disposeBitmaps();

		Papervision3D.log( "Papervision3D AssetLibrary.cleanup" );
	}

	static private function disposeAsset( asset )
	{
		if( typeof( asset ) == "movieclip" )
		{
			asset.removeMovieClip();
		}
		else if( asset instanceof BitmapData )
		{
			asset.dispose();
		}
		else
		{
			Papervision3D.log( "Papervision3D AssetLibrary.disposeAsset ERROR" );
		}
	}
}