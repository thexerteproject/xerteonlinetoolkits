 /* Created to allow us to listen for key combinations.
*
* @author Michael Avila
* @version 1.0
*/
class KeyDetection
{
	// a list of all the key codes that have been pressed
	private var keys_pressed : Array;
	// a multi-dimensional list of all of our key combinations
	private var key_combinations : Array;
	// objects listening to this detection
	private var listeners : Array;
	/* Constructor */
	public function KeyDetection ()
	{
		keys_pressed = new Array ();
		key_combinations = new Array ();
		listeners = new Array ();
		// allow this object to listen for events from the key object
		Key.addListener (this);
	}
	/* Registers an object to listen for events from the KeyDetection class
	*
	* @param The object that will listen for the events
	*/
	public function addListener (listener : Object) : Void
	{
		for (var i : Number = 0; i < listeners.length; i ++)
		{
			if (listeners [i] == listener) return;
		}
		listeners.push (listener);
	}
	/* Unregisters an object that is listening for events from the KeyDetection class
	*
	* @param The object you wish to remove from the listeners list
	*/
	public function removeListener (listener : Object) : Void
	{
		for (var i : Number = 0; i < listeners.length; i ++)
		{
			if (listeners [i] == listener) listeners.splice (i, 1);
		}
	}
	/* Adds a key combination to listen for
	*
	* @param The name you are giving this combination.  Note that this is how you will identify which combination
	* 		  has been pressed.
	* ...
	* @param The key codes that are part of this combination.  Note that they will need to be pressed in the order
	* 		  that you list them in order for the combination to fire successfully.
	*
	* @usage <pre>var key_detector = new KeyDetection();
	* 			   key_detector.addCombination("undo", Key.CONTROL, 90);
	* </pre>
	*
	*/
	public function addCombination (name : String, keyCode1 : Number, keyCode2 : Number) : Void
	{
		key_combinations.push (arguments);
	}
	
	
	// invokes the onKeyCombination event on all listeners
	private function invokeOnKeyCombination (combo_name : String ) : Void
	{
		for (var i : Number = 0; i < listeners.length; i ++)
		{
			listeners [i].onKeyCombination (combo_name);
		}
	}
	private function onKeyDown ()
	{
		var key : Number = Key.getCode ();
		cleanKeysPressed ();
		if (key != keys_pressed [keys_pressed.length - 1])
		{
			keys_pressed.push (key);
		}
		checkCombinations ();
	}
	private function checkCombinations ()
	{
		for (var j : Number = 0; j < key_combinations.length; j ++)
		{
			for (var i : Number = 0; i < keys_pressed.length; i ++)
			{
				if (keys_pressed [i] == key_combinations [j][i + 1])
				{
					if (i == key_combinations [j].length - 2)
					{
						invokeOnKeyCombination (key_combinations [j][0]);
						return;
					}
				} else
				{
					break;
				}
			}
		}
	}
	private function cleanKeysPressed ()
	{
		for (var i : Number = 0; i < keys_pressed.length; i ++)
		{
			if ( ! Key.isDown (keys_pressed [i]))
			{
				keys_pressed.splice (i, (keys_pressed.length - i));
			}
		}
	}
}
