import mx.core.UIComponent;
import mx.controls.TextArea;


class MultilineCellRenderer extends UIComponent
{
    var v2;
	var owner;
    var listOwner;
	var getCellIndex;
	var getDataLabel;
	var intID;


    function MultilineCellRenderer()
    {
    }

    function createChildren(Void) : Void
    {
		var dg = _parent._parent._parent;	//WTF? listOwner is undefined at this point...
		var colIndex = this._name.substr(5);
		
		
		
		createClassObject(TextArea, 'v2',0,{_x: -1, _y:2,restrict:'^<>"',wordWrap:true});
		v2.doLater(this, "doLater");
		v2.addEventListener("change", this);
		v2.addEventListener("focusIn", this);
		
		if ( dg.rendererOptions[colIndex] == 'false' ){
			v2.editable = false;
		}
	}
	
	function doLater(){
		v2.vScrollPolicy = 'auto';
		size();
	}
	
	function change(obj){
		listOwner.editField(getCellIndex().itemIndex, getDataLabel(), obj.target.text);
		listOwner.dispatchEvent({type:'cellEdit', target:listOwner});
	}
	
	function focusIn(obj){
		listOwner.selectedIndex = getCellIndex().itemIndex;
	}

    function setValue(str:Boolean, item:Object, sel:Boolean) : Void
    {
		v2._visible = (item != undefined);
		v2.text = str;
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
      	v2.setSize(__width, __height - 4);
    }
}