import mx.core.UIComponent
import mx.controls.CheckBox

class CheckCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var  getDataLabel;
	
    function CheckCellRenderer()
    {
    }

    function createChildren(Void) : Void
    {
		createClassObject(CheckBox, 'v2',0,{_x:__width / 2 - 10, _y:5});
		v2.label = "";
		v2.addEventListener("click", this);
        size();
    }
	function click(obj){
		listOwner.selectedIndex = getCellIndex().itemIndex;
		listOwner.editField(getCellIndex().itemIndex, getDataLabel(),obj.target.selected.toString());
		listOwner.dispatchEvent({type:'cellEdit', target:listOwner});
	}

    function setValue(str:Boolean, item:Object, sel:Boolean) : Void
    {
        v2._visible = (item != undefined);
		v2.selected = (str == 'true');
    }

    function getPreferredHeight(Void) : Number
    {
       return owner.__height;
    }

    function getPreferredWidth(Void) : Number
    {
        return owner.__width;
    }
	
	function size(Void) : Void
    {
		v2._x = __width / 2 - 10;
		v2._y = __height / 2 - 5;
		v2.setSize(__width, __height);
    }
}