import mx.core.UIComponent;
import mx.controls.DateField;

class DateCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var getDataLabel;
	var intID;


    function DateCellRenderer()
    {
		
    }

    function createChildren(Void) : Void
    {
		createClassObject(DateField, 'v2',0,{_x: 1, _y:0});
		
		v2.addEventListener("change", this);
		v2.addEventListener("open", this);
		
		size();
	}
	
	function change(obj)
	{
		var date = obj.target.selectedDate;
		var year = date.getFullYear();
		var month = date.getMonth();
		var day = date.getDate();
		
		listOwner.editField(getCellIndex().itemIndex, getDataLabel(), year + '-' + month + '-' + day);
		listOwner.dispatchEvent({type:'cellEdit', target:listOwner});
	}
	
	function open()
	{
		listOwner.selectedIndex = getCellIndex().itemIndex;
		listOwner.dispatchEvent('change', listOwner);
	}

    function setValue(str:String, item:Object, sel:Boolean) : Void
    {
		v2._visible = (item != undefined);
		v2.selectedDate = new Date(str.split('-')[0], str.split('-')[1],str.split('-')[2]);
    }

    function getPreferredHeight(Void) : Number
    {
		return 22;
    }

    function getPreferredWidth(Void) : Number
    {
        return owner.__width;
    }
	
	function size(Void) : Void
    {
		v2._y = __height / 2 - v2._height / 2;
      	v2.setSize(__width - 4, 22);
    }
}