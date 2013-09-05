import mx.core.UIComponent;

class IconCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var getDataLabel;
	var intID;
	var initVis;
	
    function IconCellRenderer()
    {
		//empty constructor - create children is called by the listOwner to initialise
    }

    function createChildren(Void) : Void
    {
		createEmptyMovieClip('v2',0);
	}

    function setValue(str:String, item:Object, sel:Boolean) : Void
    {
		v2._visible = (item != undefined);
		v2.attachMovie(str, 'mc',0);
		size();
    }

    function getPreferredHeight(Void) : Number
    {
       return 22;//owner.__height;
    }
	
    function getPreferredWidth(Void) : Number
    {
        return owner.__width;
    }
	
	function size(Void) : Void
    {
		v2._x = __width / 2 - v2._width / 2;
		v2._y = __height / 2 - v2._height / 2;
    }
}