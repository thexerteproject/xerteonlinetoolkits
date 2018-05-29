
%lex

%%

"-"?[0-9]+(\.[0-9]+)?	return 'NUMBER';
"\""[^"]+"\""		return 'STRING';
"$("[^\)]+")"		return 'VALUE_XPATH';
"$|"[^|]+"|"		return 'LENGTH_XPATH';
"${"[^\}]+"}"		return 'SUM_XPATH';
"$["[^|]+"|-"?[0-9]+(",-"?[0-9]+)?"]"	return 'SLICE_XPATH';

"+"					return 'PLUS';
"-"					return 'MINUS';
"*"					return 'TIMES';
"/"					return 'DIVIDED_BY';
"("					return 'OPEN_PAREN';
")"					return 'CLOSE_PAREN';
<<EOF>>				return 'END';
[ \t\n]				;

/lex

%left PLUS MINUS
%left TIMES DIVIDED_BY
%left UMINUS

%start expression

%%

expr:
	OPEN_PAREN expr CLOSE_PAREN		{ $$ = $2; }
	| MINUS expr %prec UMINUS		{ $$ = {op:'negate',value:$2}; }
	| add_op						{ $$ = $1; }
	;

add_op:
	expr PLUS expr					{ $$ = {op:'add',left:$1,right:$3}; }
	| expr MINUS expr				{ $$ = {op:'subtract',left:$1,right:$3}; }
	| mult_op						{ $$ = $1; }
	;

mult_op:
	expr TIMES expr					{ $$ = {op:'multiply',left:$1,right:$3}; }
	| expr DIVIDED_BY expr			{ $$ = {op:'divide',left:$1,right:$3}; }
	| value							{ $$ = $1; }
	;

value:
	NUMBER							{ $$ = {op:'literal',value:parseFloat(yytext)}; }
	| STRING						{ $$ = {op:'literal',value:yytext.slice(1,-1)}; }
	| xpath_op						{ $$ = $1; }
	;

xpath_op:
	VALUE_XPATH						{ $$ = {op:'xpath',value:yytext.slice(2,-1)}; }
	| LENGTH_XPATH					{ $$ = {op:'lengthof',value:{op:'xpath',value:yytext.slice(2,-1)}}; }
	| SUM_XPATH						{ $$ = {op:'sum',value:{op:'xpath',value:yytext.slice(2,-1)}}; }
	| SLICE_XPATH 					%{
										var data = yytext.slice(2,-1);
										data = data.split('|');
										$$ = {op:'slice',value:{op:'xpath',value:data[0]}};
										data = data[1].split(',');
										if(isNaN($$.start = parseInt(data[0])))
											$$.start = undefined;
										if(isNaN($$.end = parseInt(data[1])))
											$$.end = undefined;
									%}
	;

expression:
	expr END %{

		var ret = {
			xpaths: {}
		};

		function findXPaths(obj){
			if(!obj){
				return null;
			}
			else if(obj.op === 'xpath'){
				ret.xpaths[obj.value] = null;
			}
			else if(obj.left && obj.right){
				findXPaths(obj.left);
				findXPaths(obj.right);
			}
			else {
				findXPaths(obj.value);
			}
		}

		findXPaths($1);

		ret.evaluate = function(){
			return (function evaluate(parse)
			{
				if(!parse)
					return null;
				
				else if(parse.op === 'literal')
					return parse.value;
				
				else if(parse.op === 'xpath'){
					if(ret.xpaths[parse.value] === null){
						throw 'No value for xpath '+parse.value;
					}
					else return ret.xpaths[parse.value];
				}

				else if(parse.op === 'add')
					return evaluate(parse.left) + evaluate(parse.right);
				
				else if(parse.op === 'subtract')
					return evaluate(parse.left) - evaluate(parse.right);

				else if(parse.op === 'multiply')
					return evaluate(parse.left) * evaluate(parse.right);

				else if(parse.op === 'divide')
					return evaluate(parse.left) / evaluate(parse.right);

				else if(parse.op === 'negate')
					return -evaluate(parse.value);

				else if(parse.op === 'sum'){
					var val = evaluate(parse.value);
					if(val.reduce)
						return evaluate(parse.value).reduce(function(sum,val){return sum+val;},0);
					else
						return null;
				}

				else if(parse.op === 'lengthof')
					return evaluate(parse.value).length || null;

				else if(parse.op === 'slice'){
					var val = evaluate(parse.value);
					if(val.slice)
						return val.slice(parse.start,parse.end);
					else
						return null;
				}

				else
					throw 'Unknown operation: '+parse.op;
			})($1);
		};

		return ret;
	%}
	;
