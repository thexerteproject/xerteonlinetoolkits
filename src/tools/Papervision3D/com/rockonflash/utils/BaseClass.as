import com.blitzagency.xray.logger.XrayLog;
import com.gskinner.events.GDispatcher;
/**
 * @author John Grden
 */
class com.rockonflash.utils.BaseClass 
{
	// Public Properties:
	public var addEventListener:Function;
	public var removeEventListener:Function;
	public var removeAllEventListeners:Function;
// Private Properties:
	private var dispatchEvent:Function;
	private var log:XrayLog;
	
	function BaseClass()
	{
		GDispatcher.initialize(this);
		log = new XrayLog();
	}	
}