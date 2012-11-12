rloObject = function(w,h,rloFile,xmlPath,xmlFile,site,link_id){

  var rloWidth = w;
  var rloHeight = h;
  var rloFile = rloFile
  var rloID = rloFile.substr(0, rloFile.lastIndexOf('.')).replace(/[^a-zA-Z0-9]+/g,'');
  var scorm = false;
  var templateData =xmlFile;
  var templatePath = rloFile.substr(0, rloFile.lastIndexOf('/') + 1);


  if (navigator.appName && navigator.appName.indexOf("Microsoft") != -1 &&
    navigator.userAgent.indexOf("Windows") != -1 && navigator.userAgent.indexOf("Windows 3.1") == -1) {
    document.write('<SCRIPT LANGUAGE=VBScript\> \n');
    document.write('on error resume next \n');
    document.write('Sub ' + rloID + '_FSCommand(ByVal command, ByVal args)\n');
    document.write('  call ' + rloID + '_DoFSCommand(command, args)\n');
    document.write('end sub\n');
    document.write('</SCRIPT\> \n');

    //flag the browser
    browser = 'ie';
  } else {
    browser = 'mozilla'; //no voice or speech capabilities
  }

  function getLocation(){
    var loc;
    var searchStr;

    searchStr = document.location.search.toString();
    searchStr = searchStr.substr(1);

    templateData = searchStr.split('&')[1].split('=')[1];
    loc = templateData.substr(0, templateData.lastIndexOf('/') + 1);

    return loc;
  }
  var FileLocation = xmlPath;

function resizeRLO(w,h){
	
}

  document.write('<script language = "JavaScript">');
  document.write('function ' + rloID + '_DoFSCommand(command, args){');
  document.write('if (command == "messageBox"){');
  document.write('alert(args);');
  document.write('return true;');
  document.write('}');
  document.write('if (command == "resize"){');
  document.write('  document.getElementById("rlo'+ rloID + '").style.width = args.substr(0, args.indexOf(","))+"px";    ');
  document.write('  document.getElementById("rlo'+ rloID + '").style.height = args.substr(args.indexOf(",") + 1, args.length)+"px";    ');
  document.write('}');

  document.write('if (command == "fullscreen"){');
  document.write('  document.getElementById("rlo'+ rloID + '").style.width = "100%";    ');
  document.write('  document.getElementById("rlo'+ rloID + '").style.height = "100%";    ');
  document.write('}');

  document.write('if (command == "speak"){');
  document.write('  VoiceObj.Speak(args, 3);');
  document.write('}');
  document.write('if (command == "stopTTS"){');
  document.write('  VoiceObj.Speak("", 2);');
  document.write('}'); 
  document.write('}');
  document.write('</script>  ');

  document.writeln('<div id="rlo' + rloID + '"style="padding:0px; width:' + rloWidth + 'px; height:' + rloHeight + 'px;"');

  document.writeln('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"   Codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" WIDTH="'+rloWidth+'" HEIGHT="'+rloHeight+'" id="' + rloID + '" ALIGN="middle">');
  document.writeln('<param name="movie" value="MainPreloader.swf" />');
  document.writeln('<param name="quality" value="high" />');
  document.writeln('<param name="scale" value="showAll" />');
  document.writeln('<param name="salign" value="T" />');
  document.writeln('<param name="bgcolor" value="#ffffff" />');
  document.writeln('<param name="allowScriptAccess" value="always" />');
  document.writeln('<param name="seamlessTabbing" value="0" />');
  document.writeln('<param name="flashVars" value="File=' + rloFile + '&FileLocation=' + FileLocation + '&scorm=' + scorm + '&browser=' + browser + '&templateData=' + templateData + '&templatePath=' + templatePath + '&site_url=' + site + '&linkID=' + link_id + '"/>');
  document.writeln('<embed src="MainPreloader.swf" allowScriptAccess="always" quality="high" scale="showAll" salign="T" bgcolor="#ffffff"  WIDTH="100%" HEIGHT="100%" NAME="' + rloID + '" ALIGN="middle" TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" flashVars="File=' + rloFile + '&FileLocation=' + FileLocation + '&scorm=' + scorm + '&browser=' + browser + '&templateData=' + templateData + '&templatePath=' + templatePath + '&site_url=' + site + '&linkID=' + link_id + '"/>');

  document.writeln('</object>');
  document.writeln('</div>');
}
function getUrlParam(pairName){
var searchString = location.search;
var pairVal = "";

searchString = searchString.substring(1);

var nvPairs = searchString.split("&");

  for (i = 0; i < nvPairs.length; i++)
  {
     var nvPair = nvPairs[i].split("=");
	 if (nvPair[0] == pairName){
	   pairVal = nvPair[1];
	 }  
  }
  return pairVal;
}
