/***********************************************************************
 * collection.js: Run queries on Experience API data
 *
 * Initialize the ADL.Collection class with a list of xAPI statements,
 * then run SQL-style queries over the data, e.g. where, select, count.
 *
 * Comes in two versions: CollectionSync and CollectionAsync.
 ***********************************************************************/
"use strict";

// guarantee window.ADL, even in a worker
try {
	window.ADL = window.ADL || {};
}
catch(e){
	var window = {'ADL': {}};
}

// figure out script path if available
try {
	var workerScript = document.querySelector('script[src*="xapicollection"]').src;
}
catch(e){}

// poly-fill array checking
if(!Array.isArray){
	Array.isArray = function(obj){
		return obj.length >= 0 && !obj['length'];
	}
}

if(!String.prototype.reverse){
	String.prototype.reverse = function(){
		var ret = '';
		for(var i=this.length-1; i>=0; i--)
			ret += this.charAt(i);
		return ret;
	}
}

/*
 * Client scope
 */

(function(ADL){

	/*
	 * Retrieves some deep value at path from an object
	 */

	function parseXPath(path)
	{
		// break xpath into individual keys
		var parts;
		if(Array.isArray(path)){
			parts = path;
		}
		else
		{
			/*parts = path.split('.');
			for(var i=0; i<parts.length;){
				if(parts[i].slice(-1) === '\\')
					parts.splice(i, 2, parts[i].slice(0,-1)+'.'+parts[i+1]);
				else
					i++;
			}*/
			parts = [];

			// sanitize escaping (RtL for open brackets, LtR for close)
			var subpath = path
				.reverse()
				.replace('[[', '\x0E')
				.reverse()
				.replace(']]', '\x0F');

			while( subpath )
			{
				// pull the next part from the front of the path
				// if bracket, read to close bracket. if no bracket, read to dot or open bracket
				var match = /^(?:([^\[\.]+)|\[([^\]]+)\])\.?/.exec(subpath);
				//console.log(match);
				if( !match ){
					console.error('Invalid xpath:', path);
					return null;
				}
				else {
					var part = (match[1] || match[2] || '').replace('\x0E', '[').replace('\x0F', ']');
					parts.push( part );
					subpath = subpath.slice(match[0].length);
				}
			}
			//console.log(parts);
		}

		return parts;
	}

	function getVal(path,obj)
	{
		// if nothing to search, return null
		if(obj === undefined){
			return null;
		}

		// if no descent, just return object
		else if(path.length === 0){
			return obj;
		}

		else {
			var parts = parseXPath(path);
			
			// fetch deep path
			var scoped = parts[0], rest = parts.slice(1);
			if( scoped === '*' )
			{
				var ret = [], keys = [];

				if(Array.isArray(obj)){
					for(var i=0; i<obj.length; i++) keys.push(i);
				}
				else {
					keys = Object.keys(obj);
				}

				for(var i=0; i<keys.length; i++){
					var keyout = getVal(rest, obj[keys[i]]);
					if(Array.isArray(keyout))
						ret.push.apply(ret,keyout);
					else
						ret.push(keyout);
				}
				
				return ret;
			}
			else {
				return getVal(rest, obj[scoped]);
			}
		}
	}

	/*
	 * Set some deep value in an object
	 */
	function setVal(obj,path,value)
	{
		var parts = parseXPath(path);

		if(!obj){
			obj = {};
		}

		if(parts.length === 1){
			obj[parts[0]] = value;
		}
		else {
			if(obj[parts[0]] !== undefined)
				obj[parts[0]] = setVal(obj[parts[0]], parts.slice(1), value);
			else
				obj[parts[0]] = setVal({}, parts.slice(1), value);
		}

		return obj;
	}

	/*************************************************************
	 * CollectionSync - the core processor of statements
	 *
	 * This is where the magic happens. CollectionSync is initialized
	 * with an array of statements, processes those statements
	 * based on the method called, and returns a new CollectionSync
	 * object containing the results of the query.
	 *************************************************************/

	function CollectionSync(data){
		if(Array.isArray(data)){
			this.contents = data.slice();
		}
		else if(data instanceof CollectionSync){
			this.contents = data.contents.slice();
			this.parent = data;
		}
		else {
			this.contents = [];
		}
	}

	CollectionSync.prototype.exec = function(cb){
		cb(this.contents);
		return this.parent;
	}

	CollectionSync.prototype.save = function(){
		return new CollectionSync(this);
	}

	CollectionSync.prototype.append = function(data){
		this.contents = this.contents.concat(data);
		return this;
	}

	/*
	 * Generate a CSV based on the contents of the collection
	 * Returns a CSV string
	 */
	CollectionSync.prototype.toCSV = function()
	{
		function sanitize(str){
			if( typeof str === 'object' ) str = JSON.stringify(str);
			if( typeof str === 'string' ) str = str.replace(/"/g, '""');
			return '"' + str + '"';
		}

		if(this.contents.length > 0)
		{
			var ret = '';
			var headers = Object.keys(this.contents[0]);
			ret += headers.map(sanitize).join(',') + '\r\n';

			for(var i=0; i<this.contents.length; i++){
				ret += headers.map(function(h){
					return sanitize(this.contents[i][h]);
				}.bind(this))
				.join(',') + '\r\n';
			}
			return ret;
		}
		else {
			return '';
		}
	}



	/*
	 * Filter out data entries not matching the query expression
	 */
	CollectionSync.prototype.where = function(query)
	{
		/*
		 * Query format example
		 *   stmts.where('verb.id = passed or verb.id = failed and result.score.raw >= 50');
		 * 
		 * Query grammar:
		 *   value := parseInt | parseFloat | "(.*)" | /(.*)/i?
		 *   xpath := [A-Za-z0-9_]+(\.[A-za-z0-9_]+)*
		 *   cond := <xpath> (=|!=|>|<|>=|<=) <value>
		 *   andGrp := <expr> 'and' <expr> | <cond>
		 *   orGrp := <expr> 'or' <expr> | <andGrp>
		 *   expr := '(' <expr> ')' | <orGrp>
		 */

		var PARSE_ERROR = NaN;

		function parseWhere(str)
		{
			// expr := '(' <expr> ')' | <orGrp>
			function expr(str)
			{
				// check for parens
				var match = /^\s*\((.*)\)\s*$/.exec(str);
				if(match){
					return expr(match[1]);
				}
				else {
					return orGrp(str);
				}
			}
		
			// check if a string has the same number of left and right parens
			function matchedParens(str){
				var level = 0;
				for(var i=0; i<str.length; i++){
					if(str[i] === '('){
						level++;
					}
					else if(str[i] === ')'){
						level--;
					}
				}
				return level === 0;
			}
		
			// orGrp := <expr> 'or' <expr> | <andGrp>
			function orGrp(str)
			{
				// loop over each possible combo of or arguments
				var parts = str.split(/\bor\b/);
				var expr1 = '', expr2 = '';
				for(var i=1; i<parts.length; i++)
				{
					var tempexpr1 = parts.slice(0,i).join('or');
					var tempexpr2 = parts.slice(i).join('or');
		
					// if both args have matched parens, continue
					if( tempexpr1 != '' && matchedParens(tempexpr1)
						&& tempexpr2 != '' && matchedParens(tempexpr2)
					){
						expr1 = tempexpr1;
						expr2 = tempexpr2;
						break;
					}
				}
		
				// parse the two operands
				if( expr1 && expr2 )
				{
					var part1 = expr(expr1);
					var part2 = expr(expr2);
		
					if( part1 && part2 )
						return {or: [part1, part2]};
					else
						return PARSE_ERROR;
				}
				// or was not found, so try ands
				else {
					var ret = andGrp(str);
					if(ret) return ret;
					else return PARSE_ERROR;
				}
			}
		
			// andGrp := <expr> 'and' <expr> | <cond>
			function andGrp(str)
			{
				// loop over each possible combo of and arguments
				var parts = str.split(/\band\b/);
				var expr1 = '', expr2 = '';
				for(var i=1; i<parts.length; i++)
				{
					var tempexpr1 = parts.slice(0,i).join('and');
					var tempexpr2 = parts.slice(i).join('and');
		
					// if both args have matched parens, continue
					if( tempexpr1 != '' && matchedParens(tempexpr1)
						&& tempexpr2 != '' && matchedParens(tempexpr2)
					){
						expr1 = tempexpr1;
						expr2 = tempexpr2;
						break;
					}
				}
		
				// parse operands
				if( expr1 && expr2 )
				{
					var part1 = expr(expr1);
					var part2 = expr(expr2);
		
					if( part1 && part2 )
						return {and: [part1, part2]};
					else
						return PARSE_ERROR;
				}
				// no and found, try cond
				else {
					var ret = cond(str);
					if(ret) return ret;
					else return PARSE_ERROR;
				}
			}
		
			// cond := <xpath> (=|!=|>|<|>=|<=) <value>
			function cond(str)
			{
				// check for an operator
				var match = /^\s*(.*?)\s*(!=|>=|<=|=|>|<)\s*(.*)\s*$/.exec(str);
				if(match)
				{
					// parse operands
					var part1 = xpath(match[1]);
					var part2 = value(match[3]);
					if( part1 )
					{
						if( part2 instanceof RegExp ){
							if( match[2] === '=' )
								return {op:'re',xpath:part1,value:part2};
							else if( match[2] === '!=' )
								return {op:'nre',xpath:part1,value:part2};
							else {
								console.error('Regex comparison only supports = and !=');
								return PARSE_ERROR;
							}
		
						}
						else {
							// parse operator
							switch(match[2]){
								case  '=':  return {op: 'eq',xpath:part1,value:part2};
								case '!=':  return {op:'neq',xpath:part1,value:part2};
								case  '<':  return {op: 'lt',xpath:part1,value:part2};
								case '<=':  return {op:'leq',xpath:part1,value:part2};
								case  '>':  return {op: 'gt',xpath:part1,value:part2};
								case '>=':  return {op:'geq',xpath:part1,value:part2};
								default: return PARSE_ERROR;
							}
						}
					}
					// fail if operator or operand doesn't parse
					else return PARSE_ERROR;
				}
				else return PARSE_ERROR;
			}
		
			// xpath := [A-Za-z0-9_]+(\.[A-za-z0-9_]+)*
			function xpath(str){
				var match = /^\s*([^\.]+(?:\.[^\.]+)*)\s*$/.exec(str);
				if(match)
					return match[1];
				else return PARSE_ERROR;
			}
		
			// value := parseInt | parseFloat | "(.*)"
			function value(str){
				var val = null;
				str = str.trim();
				var isnan = Number.isNaN || isNaN;
				if( /^0[0-7]+$/.test(str) && !isnan(val = parseInt(str,8)) ){
					return val;
				}
				else if( /^\d+$/.test(str) && !isnan(val = parseInt(str,10)) ){
					return val;
				}
				else if( /^0x[0-9a-f]+$/i.test(str) && !isnan(val = parseInt(str,16)) ){
					return val;
				}
				else if(!isnan(val = parseFloat(str))){
					return val;
				}
				else if(val = /^\s*(["'])(.*)\1\s*$/.exec(str)){
					return val[2];
				}
				else if(val = /^\s*\/(.*)\/(i?)\s*$/.exec(str)){
					return new RegExp(val[1], val[2]);
				}
				else if(str === 'null'){
					return null;
				}
				else if(str === 'true' || str === 'false'){
					return str === 'true';
				}
				else return PARSE_ERROR;
			}
		
			var ret = expr(str);
			return ret != PARSE_ERROR ? ret : null;
		}
		
		/*
		 * Evaluate the parse tree generated by parseWhere
		 */

		function evalConditions(parse, stmt)
		{
			// check for missing logical operands
			if(Array.isArray(parse.and) && parse.and.length === 0){
				return true;
			}
			else if(Array.isArray(parse.or) && parse.or.length === 0){
				return false;
			}
		
			// check for conditions without wildcard, and if so evaluate
			else if(parse.op && !/\.\*\.?/.test(parse.xpath))
			{
				switch(parse.op){
					case 'eq': return getVal(parse.xpath,stmt) === parse.value;
					case 'neq': return getVal(parse.xpath,stmt) !== parse.value;
					case 'geq': return getVal(parse.xpath,stmt) >= parse.value;
					case 'leq': return getVal(parse.xpath,stmt) <= parse.value;
					case 'lt': return getVal(parse.xpath,stmt) < parse.value;
					case 'gt': return getVal(parse.xpath,stmt) > parse.value;
					case 're': return parse.value.test( getVal(parse.xpath,stmt) );
					case 'nre': return !parse.value.test( getVal(parse.xpath,stmt) );
					default: return false;
				}
			}
			// check for conditions with wildcard
			else if(parse.op && /\.\*\.?/.test(parse.xpath))
			{
				var values = getVal(parse.xpath,stmt);
				if(!values)
					return false;

				// loop over each returned value
				for(var i=0; i<values.length; i++)
				{
					var result;
					if(parse.op === 'eq')       result = values[i] === parse.value;
					else if(parse.op === 'neq') result = values[i] !== parse.value;
					else if(parse.op === 'geq') result = values[i] >= parse.value;
					else if(parse.op === 'leq') result = values[i] <= parse.value;
					else if(parse.op === 'lt')  result = values[i] < parse.value;
					else if(parse.op === 'gt')  result = values[i] > parse.value;
					else if(parse.op === 're')  result = parse.value.test( values[i] );
					else if(parse.op === 'nre') result = !parse.value.test( values[i] );
					else result = false;

					if(result)
						return true;
				}

				return false;
			}

			// check for and, and if so evaluate
			else if(parse.and)
			{
				// evaluate first operand
				if( !evalConditions(parse.and[0], stmt) )
					return false;
				// evaluate remaining operands
				else
					return evalConditions({and: parse.and.slice(1)}, stmt);
			}
			// check for or, and if so evaluate
			else if(parse.or)
			{
				// evaluate first operand
				if( evalConditions(parse.or[0], stmt) )
					return true;
				// evaluate remaining operands
				else
					return evalConditions({or: parse.or.slice(1)}, stmt);
			}

			// fail for any other structures. shouldn't happen
			else {
				return false;
			}
		}

		/*
		 * Execute the giant functions above
		 */

		// no-op if no query
		if( !query ) return this;
	
		// parse the query, abort filter if query didn't parse
		var parse = parseWhere(query);
		if( !parse ){
			console.error('Invalid where expression: '+query);
			return;
		}

		// for each entry in the dataset
		for(var i=0; i<this.contents.length; i++)
		{
			// remove from dataset if it doesn't match the conditions
			if( !evalConditions(parse, this.contents[i]) ){
				this.contents.splice(i--,1);
			}
		}
	
		// return the filtered data
		return this;
	}
	
	/*
	 * Perform numeric or string computations on the dataset
	 * and write the result to another field
	 */
	CollectionSync.prototype.math = function(dest, expr, level)
	{
		// check for recursive depth
		if(level && level > 0)
		{
			var data = this.contents;
			for(var i=0; i<data.length; i++){
				var subdata = new CollectionSync(data[i].data);
				subdata.math(dest, expr, level-1);
				data[i].data = subdata.contents;
			}
		}
		else
		{
			var ptree = MathParser.parse(expr);

			for(var i=0; i<this.contents.length; i++)
			{
				var data = this.contents[i];
				for(var path in ptree.xpaths){
					ptree.xpaths[path] = getVal(path, data);
				}

				try {
					setVal(data, dest, ptree.evaluate());
				}
				catch(e){
					console.log(e);
				}
			}
		}

		// return the computed data
		return this;
	}


	/*
	 * Pick out certain fields from each entry in the dataset
	 * syntax of selector := xpath ['as' alias] [',' xpath ['as' alias]]*
	 */
	CollectionSync.prototype.select = function(selector, level)
	{
		// check for recursive depth
		if(level && level > 0)
		{
			var data = this.contents;
			for(var i=0; i<data.length; i++){
				var subdata = new CollectionSync(data[i].data);
				subdata.select(selector, level-1);
				data[i].data = subdata.contents;
			}
		}
		else
		{
			// parse selector
	
			// for each field to be selected
			var cols = [];
			var xpaths = selector.split(',');
			// check for escaped commas
			for(var i=0; i<xpaths.length;){
				if(xpaths[i].slice(-1) === '\\')
					xpaths.splice(i, 2, xpaths[i].slice(0,-1)+','+xpaths[i+1]);
				else
					i++;
			}

			for( var i=0; i<xpaths.length; i++ )
			{
				// break into an xpath and an optional alias
				var parts = xpaths[i].split(' as ');
				cols.push({
					'xpath': parts[0].trim(),
					'alias': parts[1] ? parts[1].trim() : null
				});
			}
	
			// pick out selected fields
	
			// loop over entries in dataset
			var data = this.contents;
			var ret = [];
			for(var i=0; i<data.length; i++)
			{
				var row = {};
				// for each selection field
				for(var j=0; j<cols.length; j++){
					// save as old name, or alias if provided
					setVal(row, cols[j].alias || cols[j].xpath, getVal(cols[j].xpath, data[i]));
				}
				ret.push(row);
			}
	
			// return the selection
			this.contents = ret;
		}

		return this;
	}

	/*
	 * Form a relation between two fields in the data
	 */
	CollectionSync.prototype.relate = function(keypath, valuepath, level)
	{
		var data = this.contents;

		// check for recursion
		if( level && level > 0 )
		{
			// loop over datasets
			for(var i=0; i<data.length; i++){
				var subdata = new CollectionSync(data[i].data);
				subdata.relate(keypath, valuepath, level-1);
				data[i].data = subdata.contents;
			}
		}
		else
		{
			// loop over datasets
			for(var i=0; i<data.length; i++)
			{
				for(var j=0; j<data[i].data.length; j++){
					var key = getVal(keypath, data[i].data[j]);
					var val = getVal(valuepath, data[i].data[j]);
					data[i][key] = val;
				}
			}
		}

		return this;
	}

	/*
	 * Exactly what it sounds like
	 * Return some continuous subset of the data
	 */
	CollectionSync.prototype.slice = function(start,end)
	{
		if(end === null)
			end = undefined;
		this.contents = this.contents.slice(start,end);
		return this;
	}
	
	/*
	 * Sort dataset by given path
	 */
	CollectionSync.prototype.orderBy = function(path, direction)
	{
		var data = this.contents;

		// figure out ascending or descending
		if(direction === 'descending' || direction === 'desc')
			direction = -1;
		else
			direction = 1;

		data.sort(function(a,b){
			var aVal = getVal(path,a), bVal = getVal(path,b);

			// guarantee case insensitivity
			if(aVal.toLowerCase) aVal = aVal.toLowerCase();
			if(bVal.toLowerCase) bVal = bVal.toLowerCase();

			// any value is greater than null
			if(aVal!=null && bVal==null)
				return 1 * direction;
			else if(aVal==null && bVal!=null)
				return -1 * direction;

			// check equivalence
			else if(aVal == bVal)
				return 0;

			// all else fails, do a simple comparison
			else
				return (aVal<bVal ? -1 : 1) * direction;
		});

		return this;
	}

	/*
	 * Group with continuous values
	 */
	CollectionSync.prototype._groupByRange = function(path, range)
	{
		// validate range
		if( !(Array.isArray(range) && range.length === 3 && range[2]%1 === 0) )
			return this.groupBy(path);

		/*
		 * Generate range dividers
		 */

		// determine type of values
		var start = range[0], end = range[1], increment = range[2];
		var value, next;
		// values are date strings
		if( typeof(start) === 'string' && typeof(end) === 'string' && Date.parse(start) && Date.parse(end) ){
			value = function(x){
				return Date.parse(x);
			};
			next = function(x,i){
				var d = new Date(Date.parse(x)+i);
				return d.toISOString();
			};
		}
		// values are generic strings
		else if( typeof(start) === 'string' && typeof(end) === 'string' ){
			value = function(x){
				return x.charAt(0).toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
			};
			next = function(x,i){
				return String.fromCharCode(x.charAt(0).toLowerCase().charCodeAt(0) + i);
			};
		}
		// all other types
		else {
			value = function(x){
				return x;
			};
			next = function(x,i){
				return x+i;
			};
		}

		// make sure bounds are reachable
		var bounds = [];
		if( (value(end)-value(start))*increment <= 0 ){
			console.error('Group range is open, cannot generate groups!');
			console.log(JSON.stringify(range));
			bounds = [start,end];
		}
		// flip bounds if end < start
		else if( value(start) > value(end) ){
			groupByRange(path, [end,start,-increment]);
			dataStack.push( dataStack.pop().reverse() );
			return;
		}
		else {
			// create boundary array
			for(var i=start; value(i)<value(end); i=next(i,increment)){
				bounds.push(i);
			}
			bounds.push(end);
		}

		/*
		 * Group by range
		 */

		// create groups by boundary
		var ret = [];
		for(var i=0; i<bounds.length-1; i++){
			ret.push({
				'group': bounds[i]+'-'+bounds[i+1],
				'groupStart': bounds[i],
				'groupEnd': bounds[i+1],
				'data': []
			});
		}

		// divide up data by group
		var data = this.contents;
		for(var i=0; i<data.length; i++)
		{
			var groupVal = value(getVal(path,data[i]));
			for(var j=0; j<ret.length; j++){
				if( value(ret[j].groupStart) <= groupVal && (
					groupVal < value(ret[j].groupEnd) || j==ret.length-1 && groupVal==value(ret[j].groupEnd)
				) )
					ret[j].data.push(data[i]);
			}
		}

		this.contents = ret;
		return this;
	}


	/*
	 * Group with discrete values
	 */
	CollectionSync.prototype.groupBy = function(path, range)
	{
		if(range)
			return this._groupByRange(path, range);

		var data = this.contents;

		// if data is already grouped, group the groups
		if( data[0] && data[0].group && data[0].data )
		{
			for(var i=0; i<data.length; i++)
			{
				var subgroup = new CollectionSync(data[i].data);
				subgroup.groupBy(path);
				data[i].data = subgroup.contents;
			}
		}
		else
		{
			// add each data entry to its respective group
			var groups = {};
			for(var i=0; i<data.length; i++)
			{
				var groupVal = getVal(path,data[i]);
	
				// if group field isn't found, 
				if( !groupVal ){
					continue;
				}
				// no group for found value, create one
				else if( !groups[groupVal] ){
					groups[groupVal] = [data[i]];
				}
				// add to existing group
				else {
					groups[groupVal].push(data[i]);
				}
			}
	
			// flatten groups
			var ret = [];
			for(var i in groups){
				ret.push({
					'group': i,
					'data': groups[i]
				});
			}
	
			this.contents = ret;
		}

		return this;
	}


	/*
	 * Take grouped data and return number of entries in each group
	 */
	CollectionSync.prototype.count = function(level)
	{
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}
		// if it's grouped and deep checking is requested, descend
		else if(level && level > 0){
			for(var i=0; i<data.length; i++){
				data[i].data = (new CollectionSync(data[i].data)).count(level-1).contents;
			}
			return this;
		}

		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add count and sample
			group.count = group.data.length;
			group.sample = group.data[0];
			ret.push(group);
		}
		
		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return total of values of entries in each group
	 */
	CollectionSync.prototype.sum = function(path,level)
	{
		if( !path )
			return this;

		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}
		// if it's grouped and deep checking is requested, descend
		else if(level && level > 0){
			for(var i=0; i<data.length; i++){
				data[i].data = (new CollectionSync(data[i].data)).sum(path, level-1).contents;
			}
			return this;
		}


		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var sum = 0;
			for(var j=0; j<data[i].data.length; j++){
				sum += getVal(path, data[i].data[j]);
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add sum and sample
			group.sum = sum;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return average of values of entries in each group
	 */
	CollectionSync.prototype.average = function(path,level)
	{
		if( !path )
			return this;

		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}
		// if it's grouped and deep checking is requested, descend
		else if(level && level > 0){
			for(var i=0; i<data.length; i++){
				data[i].data = (new CollectionSync(data[i].data)).average(path, level-1).contents;
			}
			return this;
		}


		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var sum = 0;
			for(var j=0; j<data[i].data.length; j++){
				sum += getVal(path, data[i].data[j]);
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add average and sample
			group.average = group.data.length>0 ? sum/group.data.length : 0;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return minimum of values of entries in each group
	 */
	CollectionSync.prototype.min = function(path,level)
	{
		if( !path ) return this;
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		var ret = [];
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}
		// if it's grouped and deep checking is requested, descend
		else if(level && level > 0){
			for(var i=0; i<data.length; i++){
				data[i].data = (new CollectionSync(data[i].data)).min(path, level-1).contents;
			}
			return this;
		}


		// loop over each group
		for(var i=0; i<data.length; i++)
		{
			var min = Infinity;
			for(var j=0; j<data[i].data.length; j++){
				min = Math.min(min, getVal(path, data[i].data[j]));
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add min and sample
			group.min = min === Infinity ? 0 : min;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return maximum of values of entries in each group
	 */
	CollectionSync.prototype.max = function(path,level)
	{
		if( !path ) return this;
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}
		// if it's grouped and deep checking is requested, descend
		else if(level && level > 0){
			for(var i=0; i<data.length; i++){
				data[i].data = (new CollectionSync(data[i].data)).max(path, level-1).contents;
			}
			return this;
		}


		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var max = -Infinity;
			for(var j=0; j<data[i].data.length; j++){
				max = Math.max(max, getVal(path, data[i].data[j]));
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add max and sample
			group.max = max === -Infinity ? 0 : max;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}


	/*****************************************************************
	 * Collection class - asynchronous version of CollectionSync
	 *
	 * For any decently-sized dataset, CollectionSync will lock up the
	 * UI for an unnecessary amount of time. The CollectionAsync class
	 * exposes the same API, but wraps that functionality in a thread
	 * so the UI remains responsive.
	 *****************************************************************/


	function CollectionAsync(data)
	{
		this._callbacks = {};

		if( !window.Worker ){
			throw new Error('Your browser does not support WebWorkers, and cannot use the CollectionAsync class. Use CollectionSync instead.');
		}

		this._worker = new Worker(workerScript);
		this._worker.onmessage = function(evt)
		{
			var data = CollectionAsync.deserialize(evt.data);
			if( this._callbacks[data[0]] ){
				this._callbacks[data[0]](data[1]);
				delete this._callbacks[data[0]];
			}
		}.bind(this);

		var payload = CollectionAsync.serialize(['push',data]);
		try {
			this._worker.postMessage(payload, [payload]);
		}
		catch(e){
			this._worker.postMessage(payload);
		}

		if( payload.byteLength > 0 ){
			console.log('Warning: Your browser does not support WebWorker transfers. Performance of this site may suffer as a result.');
		}
	}

	CollectionAsync.serialize = function(obj)
	{
		var json = JSON.stringify(obj);
		var buf = new ArrayBuffer(2*json.length);
		var view = new Uint16Array(buf);
		for(var offset=0; offset<json.length; offset++){
			view[offset] = json.charCodeAt(offset);
		}
		return buf;
	};

	CollectionAsync.deserialize = function(buffer)
	{
		var json = '';
		var intBuffer = new Uint16Array(buffer);
		for(var i=0; i<intBuffer.length; i+=1000)
			json += String.fromCharCode.apply(null, intBuffer.subarray(i,i+1000));
		return JSON.parse(json);
	}

	CollectionAsync.prototype.exec = function(cb)
	{
		// generate random callback id, check for duplicates
		var id;
		while( this._callbacks[id = Math.floor( Math.random() * 65536 )] );

		this._callbacks[id] = cb;
		this._worker.postMessage(CollectionAsync.serialize(['exec', id]));
		return this;
	}

	CollectionAsync.prototype.append = function(data)
	{
		var payload = CollectionAsync.serialize(['append',data]);
		try {
			this._worker.postMessage(payload, [payload]);
		}
		catch(e){
			this._worker.postMessage(payload);
		}

		return this;
	}

	function proxyFactory(name){
		return function(){
			var args = Array.prototype.slice.call(arguments);
			this._worker.postMessage(CollectionAsync.serialize([name].concat(args)));
			return this;
		}
	}

	CollectionAsync.prototype.save    = proxyFactory('save');
	CollectionAsync.prototype.where   = proxyFactory('where');
	CollectionAsync.prototype.math    = proxyFactory('math');
	CollectionAsync.prototype.select  = proxyFactory('select');
	CollectionAsync.prototype.relate  = proxyFactory('relate');
	CollectionAsync.prototype.slice   = proxyFactory('slice');
	CollectionAsync.prototype.orderBy = proxyFactory('orderBy');
	CollectionAsync.prototype.groupBy = proxyFactory('groupBy');
	CollectionAsync.prototype.count   = proxyFactory('count');
	CollectionAsync.prototype.sum     = proxyFactory('sum');
	CollectionAsync.prototype.average = proxyFactory('average');
	CollectionAsync.prototype.min     = proxyFactory('min');
	CollectionAsync.prototype.max     = proxyFactory('max');

	ADL.CollectionSync = CollectionSync;
	ADL.CollectionAsync = CollectionAsync;
	ADL.Collection = CollectionSync;

}(window.ADL));


/*
 * Thread-specific scope
 */
(function(CollectionAsync, CollectionSync){

	var db = null;

	try {
		onmessage = function(evt)
		{
			var data = CollectionAsync.deserialize(evt.data);

			if( data[0] === 'exec' )
			{
				var cbHandle = data[1];
				if(db){
					db = db.exec(function(data){
						var payload = CollectionAsync.serialize([cbHandle, data]);
						try {
							postMessage(payload, [payload]);
						}
						catch(e){
							postMessage(payload);
						}
					});
				}
				else {
					postMessage(CollectionAsync.serialize([cbHandle, 'error','nodata']));
				}
			}
			else if( data[0] === 'push' ){
				var newdb = new CollectionSync(data[1], db);
				db = newdb;
			}
			else {
				// execute the function at [0] with [1-n] as args
				db = db[data[0]].apply(db, data.slice(1));
			}
		};
	}
	catch(e){
		if( e.message !== 'onmessage is not defined' ){
			throw e;
		}
	}

}(window.ADL.CollectionAsync, window.ADL.CollectionSync));


/*
 * Node.js export code
 */
try {
	exports.CollectionSync = window.ADL.CollectionSync;
}
catch(e){
	if( ! /'?exports'? is (?:not |un)defined/.test(e.message) )
		throw e;
}

