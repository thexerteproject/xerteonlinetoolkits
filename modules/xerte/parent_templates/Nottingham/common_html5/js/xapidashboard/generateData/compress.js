var uglify = require('uglify-js2'),
	lz = require('lz-string');

var data = '';
process.stdin.on('readable', function(){
	var chunk = process.stdin.read();
	if(chunk)
		data += chunk;
});

process.stdin.on('end', function(){
	var stmts = JSON.parse(data);
	var lib = uglify.minify('lz-string-1.3.3.js');
	var output = lib.code+'window.statements=JSON.parse(LZString.decompressFromBase64("'+lz.compressToBase64(JSON.stringify(stmts))+'"));';
	process.stdout.write(output);
});
