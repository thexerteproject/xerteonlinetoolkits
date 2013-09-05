/*
Copyright (c) 2007 John Grden

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

import org.papervision3d.core.proto.DisplayObject3D;
 
class com.rockonflash.papervision3d.as2.utils.ObjectController 
{
	private static var _instance:ObjectController;
	public static function getInstance():ObjectController
	{
		if(_instance == undefined) _instance = new ObjectController();
		return _instance;
	}
	
	private var currentRotationObj:DisplayObject3D;
	
	private var arrowLeft		:Boolean;
	private var arrowUp			:Boolean;
	private var arrowRight		:Boolean;
	private var arrowDown		:Boolean;
	
	private var lastX			:Number;
	private var lastY			:Number;
	private var difX			:Number;
	private var difY			:Number;
	
	private var isMouseDown		:Boolean;
	
	private var si				:Number;
	
	private var movementInc		:Number = 1;
	
	function ObjectController()
	{
		// constructor
		Mouse.addListener(this);
		Key.addListener(this);
		si = setInterval(this, "updateMovements", 25);
	}
	
	public function registerControlObject(obj:DisplayObject3D):Void
	{
		currentRotationObj = obj;
	}
	
	private function updateLastRotation():Void
	{
		lastX = _level0._xmouse;
		lastY = _level0._ymouse;
	}
	
	private function updateDif():Void
	{
		difX = Number(_level0._xmouse - lastX);
		difY = Number(_level0._ymouse - lastY);
	}
	
	private function onMouseDown():Void
	{
		updateLastRotation();
		isMouseDown = true;
	}
	
	private function onMouseMove():Void
	{
		updateMovements();
	}
	
	private function onMouseUp():Void
	{
		isMouseDown = false;
		updateLastRotation();
	}
	
	private function onKeyDown():Void 
		{
			/*
			37 // left
			38 // up
			39 // right
			40 // down
			*/
			try
			{
				movementInc += movementInc*.1;
				_global.tt("keyDown", Key.getCode());
				switch(Key.getCode())
				{
					case 37:
						arrowLeft = true;
					break;
					
					case 38:
						arrowUp = true;
					break;
					
					case 39:
						arrowRight = true;
					break;
					
					case 40:
						arrowDown = true;
					break;
				}
				
			}catch(e:Error)
			{
				trace("keyDown error");
			}
		}
		
		private function onKeyUp():Void 
		{
			movementInc = 1;
			try
			{
				switch(Key.getCode())
				{
					case 37:
						arrowLeft = false;
					break;
					
					case 38:
						arrowUp = false;
					break;
					
					case 39:
						arrowRight = false;
					break;
					
					case 40:
						arrowDown = false;
					break;
				}
			}catch(e:Error)
			{
				trace("keyDown error");
			}
		}
		
		private function handleKeyStroke():Void
		{
			var inc:Number = 5 + movementInc;
			
			if(arrowLeft) currentRotationObj.x -= inc;
			if(arrowUp) currentRotationObj.z += inc;
			if(arrowRight) currentRotationObj.x += inc;
			if(arrowDown) currentRotationObj.z -= inc;
		}
	
	private function updateMovements():Void
	{
		updateDif();
		handleKeyStroke();
		
		if(!isMouseDown) return;
		
		try
		{
			var posx:Number = difX;
			var posy:Number = difY;
			
			posx = posx > 360 ? posx % 360 : posx;
			posy = posy > 360 ? posy % 360 : posy;
			
			currentRotationObj.rotationX -= posy/5;
			currentRotationObj.rotationY -= posx/5;
			
			if(difX != 0) lastX = _level0._xmouse;
			if(difY != 0) lastY = _level0._ymouse;
		}catch(e:Error)
		{
			trace("handleMouseMove failed");
		}
	}
}