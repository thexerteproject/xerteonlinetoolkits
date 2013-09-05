import mx.core.UIComponent;
import mx.controls.NumericStepper;

class NumericCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var getDataLabel;
	var intID;
	var initVis;
	
    function NumericCellRenderer()
    {
		//empty constructor - create children is called by the listOwner to initialise
    }

    function createChildren(Void) : Void
    {
		var dg = _parent._parent._parent;	//listOwner is undefined at this point...
		var colIndex = this._name.substr(5);
		var opts = dg.rendererOptions[colIndex].split('|');

		createClassObject(NumericStepper, 'v2',0,{_x: 1, _y:0});
		
		v2.minimum = Number(opts[0]);
		v2.maximum = Number(opts[1]);
		v2.stepSize = Number(opts[2]);

		v2.addEventListener("change", this);
		v2.addEventListener("focusIn", this);
		
		v2.doLater(this, 'load');
		
		size();
	}
	
	function load(){
		v2._visible = initVis;
	}
	
	function change(obj){
		listOwner.editField(getCellIndex().itemIndex, getDataLabel(), obj.target.value);
		listOwner.dispatchEvent({type:'cellEdit', target:listOwner});
	}
	
	function focusIn()
	{
		 listOwner.selectedIndex = getCellIndex().itemIndex;
	}

    function setValue(str:String, item:Object, sel:Boolean) : Void
    {
		initVis = (item != undefined);
		v2._visible = (item != undefined);
		v2.value = Number(str);
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