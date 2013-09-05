import mx.core.UIComponent;
import mx.controls.ComboBox;


class ComboCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var getDataLabel;
	var intID;


    function ComboCellRenderer()
    {
    }

    function createChildren(Void) : Void
    {
		var dg = _parent._parent._parent;	//WTF? listOwner is undefined at this point...
		var colIndex = this._name.substr(5);
		
		createClassObject(ComboBox, 'v2',0,{_x: 1, _y:0});
		v2.addEventListener("change", this);
		v2.addEventListener("open", this);
		
		//set up the options
		var opts = dg.rendererOptions[colIndex].split('|');
		for (var i = 0; i < opts.length; i++){
			v2.addItem(opts[i]);
		}
		size();
	}
	
	function open()
	{
		listOwner.selectedIndex = getCellIndex().itemIndex;
		listOwner.dispatchEvent('change', listOwner);
	}
	
	function change(obj){
		listOwner.editField(getCellIndex().itemIndex, getDataLabel(), obj.target.selectedItem.label);
		listOwner.dispatchEvent({type:'cellEdit', target:listOwner});
	}

    function setValue(str:Boolean, item:Object, sel:Boolean) : Void
    {
		v2._visible = (item != undefined);
		
		//find the default value
		for (var i = 0;i < v2.dataProvider.length; i++){
			if (v2.dataProvider[i].label == str){
				v2.selectedIndex = i;
				break;
			}
		}
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
      	v2.setSize(__width - 4, __height);
    }
}