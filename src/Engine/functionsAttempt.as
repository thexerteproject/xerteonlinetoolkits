//failed attempt to add function support - the issue is scope, particularly wrt arguments - cannot create local variables 
//within anonymous functions dynamically, and in any case, the function block will execute within the engine's scope, not the function's scope
//we could live with it, but each function definition would create global variables (with engine scope) for each argument defined, when the function is created
//i.e. function myFunction(score, name){ ..etc..} would create engine level vars called score and name when the function definition was found in the script.
//I don't think this is what we want.

//we could set args = arguments and address args[i] in the function body (i.e. only setting one, resettable, engine scoped var called 'args', and leave the arguments in the braces as reference
//but it is a long way from the script standards people are used to and will be confusing.
//better to use script icons as before and not allow the function keyword to be used to define functions.
//could use script icon properties to describe the arguments if a reference is needed. Shame. Some useful code here.
if (element.nodeName == 'SCR' && params.isFunc != '1'){//support old files with script function icons
	//function support notes....
	//does the scr contain the string 'function'?
	//is it really a function, and not just the text 'function' somewhere in the code?
	//if so, find it's name (function funcName(){ .. code.. } only format supported?
	//strip out the functions from the script and create them
	//append any non func defn code to the scriptStr to execute
	//then execute it once all functions created
	var code = element.firstChild.nodeValue;
	var blockIndex = -1;
	var resultScript = "";

	//find all functions...
	while (code.indexOf('function', blockIndex + 1) != -1){
		//get function name
		var funcStart = code.indexOf('function', blockIndex + 1);
		//is it a real function - not just text
		if (funcStart == 0 || code.substr(funcStart - 1, 1) == '\r'){//check these assumptions
			var nameStart = funcStart + 9;
			var nameEnd = code.indexOf('(', nameStart);
			var funcName = code.substring(nameStart, nameEnd);
			
			//collect any script...
			resultScript += code.substring(blockIndex + 1, funcStart);
			
			//create an array of arguments following the function name
			var argsStart = nameEnd + 1;
			var argsEnd = code.indexOf(')', argsStart);
			var argsList = code.substring(argsStart, argsEnd);
			var argsArray = argsList.split(','); //no spaces between arguments a requirement
			
			//find the index of the final closing curly brace...
			blockIndex = argsEnd + 1;
			var openCount = 1;
			while (openCount != 0){
				blockIndex++;
				if (code.charAt(blockIndex) == '{') openCount++;
				if (code.charAt(blockIndex) == '}') openCount--;
			}
			
			//support returning values from last line only - ???
			var retStart = code.lastIndexOf('return') + 6;
			var retEnd = code.indexOf(';', retStart);
			var returnStr = code.substring(retStart, retEnd);

			//create a uniqueID to store the function
			var count = functionCount();
			var funcID = 'func'+count;
			var funcCode = code.substring(argsEnd + 2, blockIndex - 1);
			set(funcID, funcCode);
			
			//create the function
			this[funcName] = function(){
				//setup the arguments - these have global scope! Do we really want this collision issue??
				for (var i = 0; i < arguments.callee.args.length; i++){
					engine[arguments.callee.args[i]] = arguments[i];
				}
				//execute the function - but which script to execute?
				script(engine[arguments.callee.code], engine);
				return expression(arguments.callee.returnStr, engine);
			}
			//store the code and returStr as properties of the function - which we can access with 'callee'
			this[funcName].code = funcID;
			this[funcName].args = argsArray;
			this[funcName].returnStr = returnStr;

		} else { //it wasn't a function - move on
			resultScript += code.substring(blockIndex + 1, funcStart + 9);
			blockIndex = funcStart + 8;
		}
	}
	
	//if no functions found, then append all the code, else append from blockIndex
	resultScript += code.substr(blockIndex + 1, code.length - 1);
	//and execute the script...
	script(resultScript, this);
}

//leave support for the old way of defining functions
if (element.nodeName == 'SCR' && params.isFunc == '1'){ 
	//make a uniqueID to store the string...
	var funcID = UniqueID();
	set(funcID, element.firstChild.nodeValue);
	
	//then make the function with the same name as the SCR name:
	this[params.name] = function(){
		this.args = arguments;
		script(eval(funcID), _level0.engine); //execute the function string in the engine context
	}
}
