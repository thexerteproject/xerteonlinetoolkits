package r1.util
{
import mx.logging.targets.LineFormattedTarget;
import mx.logging.LogEvent;
import mx.core.mx_internal;
import r1.deval.IOutput;

use namespace mx_internal;

public class TextComponentLogger extends LineFormattedTarget implements IOutput
{
	private var host:Object;
	private var property:String;
	public  var limit:int;

	public function TextComponentLogger(host:Object, property:String="text", limit:int=2048) {
		super();
		this.host = host;
		this.property = property;
		this.limit = limit;
	}

	override mx_internal function internalLog(msg:String):void {
		var s:String = host[property];
		if (s == '') {
			s = msg;
		} else {
			if (s.length >= limit)
				s = s.substring(s.length - limit);
			s = s + '\n' + msg;
		}
		host[property] = s;
	}
}
}
