# xAPI Collection API Reference

## Table of Contents

* [A Word About XPaths](#xpaths)
* Constructors
	* [new Collection([statements])](#constructor)
* Properties
	* [contents](#contents)
* Methods
	* [append](#append)
	* [save](#save)
	* [exec](#exec)
	* [toCSV](#tocsv)
	* [where](#where)
	* [select](#select)
	* [math](#math)
	* [relate](#relate)
	* [slice](#slice)
	* [orderBy](#orderBy)
	* [groupBy](#groupBy)
	* [count](#count)
	* [sum](#sum)
	* [average](#average)
	* [min](#min)
	* [max](#max)

## ADL.Collection

The `Collection` Class is designed to run advanced SQL-like queries over a body of [Experience API](http://www.adlnet.gov/tla/experience-api/faq/)-formatted activity statements. Simply load statements into the class by passing an array into the constructor or using the `append` method, and use the API documented below to map and filter through the statements.

There are two implementations of this class, `CollectionSync` and `CollectionAsync`. Their APIs are the same, but the Async class runs the queries in a worker thread. The downside of this is that the statements must be serialized and passed into the worker, which can be slow. On the other hand, the UI does not lock up for heavy queries like the synchronous version will. However, since in most cases the serialization of the data is an order of magnitude slower than the actual processing, we generally recommend using the synchronous version.

<a id='xpaths'></a>
## A Word About XPaths

Many parts of this class use what are called xpaths. These are strings that indicate a path into the data structure to find a particular value. They are composed of a period-delineated list of object keys. The syntax will be familiar for anyone that has used a C-like language like Javascript.

If you prefer, you can use bracket notation for keys too. Everything between the brackets is considered part of the key, so you can use this as an escape if your key contains periods. Double brackets are treated as a single literal bracket.

**Note**: The previously supported syntax of using backslashes to escape literal periods (e.g. `\\.`) is no longer supported. Use bracket notation instead.

For example, if you had an object like this:

```javascript
{
	"level1": {
		"level.2": [
			{
				"level3": some_value
}]}}
```

You could reference the value `some_value` using either of the following:

* `level1[level.2].0.level3`
* `level1[level.2][0].level3`

Each dot or bracket set indicates a nested object with the given key. Notice that the object under level 2 is an array. In this case, the key is an integer instead of a string, but the pattern holds otherwise.

If any part of the xpath is not found in the object, then `null` is returned.

All xpaths are evaluated relative to each top-level object in the Collection.

## Constructors

<a id='constructor'></a>
### new Collection([statements])

**Arguments:**

`statements` (`Array`) (optional)  
An array of xAPI statements to be processed.

**Returns:**

An instantiated Collection class (either sync or async, see [introduction](#)).



## Properties

<a id='contents'></a>
### contents (CollectionSync only)

Type: `Array`

The contents of the current dataset. This is the same data as would be passed into the callback of [exec](#exec), but may be more convenient than `exec` for `CollectionSync` users.


## Methods


<a id='append'></a>
### append(statements)

**Arguments:**

`statements` (`Array`)  
An array of xAPI statements to be added to the collection.

**Returns:**

A reference to the collection with the new data appended to the end of the old dataset.


<a id='save'></a>
### save()

Takes a snapshot of the current data in the collection, and stores it for use after the next [exec](#exec).

**Arguments:**

*(none)*

**Returns:**

A reference to the collection containing the latest data.


<a id='exec'></a>
### exec(callback)

Calls the provided callback with the results of the query.

**Arguments:**

`callback` (`Function`)  
A function that is passed the results of the query (an array of objects).

**Returns:**

A reference to the collection containing the previous set of data.


<a id='tocsv'></a>
### toCSV() (CollectionSync only)

Generate a comma-separated value string from the top level of the collection. Each property of the top-level objects (xAPI statements or groups) will become a column in the resulting CSV string. If the property value is an object, it will be converted to JSON and treated as a string.

The output of this function is suitable for importing into Microsoft Excel or similar analytics tools.

For example:

```javascript
var a = new Collection([{'name': 'Steven', 'age': 25},{'name': 'John', 'age': 35]);
a.toCSV()
>>> "name","age"
    "Steven","25"
    "John","35"
```

**Arguments:**

*None*

**Returns:**

A CSV string representation of the current dataset.

<a id='where'></a>
### where(query)

Filter the contents of the collection by some query, and return the filtered results collection.

`where` queries use a similar syntax to the SQL SELECT WHERE clause. You specify one or more conditions that, if met by a datum, will cause that datum to be in the result set.

Each condition consists of a field, a comparator, and a value. The field must be an xpath. The comparator can only be one of `>,>=,<,<=,=,!=`, where they have the same meaning as in Javascript. The value can be either a literal string (anything between two quotes), a number, a regular expression (anything between two forward slashes), or one of the special tokens `true`, `false`, or `null`. Note that the operators are strongly typed, so `"5" != 5`. Also note that only `=` and `!=` are valid comparisons against a regular expression.

You can use `and`, `or`, and parentheses to combine different conditions in any way you wish. For example:

```javascript
stmts.where(
	'actor.name = "Steven" and ('+
		'verb.id = "http://adlnet.gov/expapi/verbs/passed"'+
		' or '+
		'verb.id = "http://adlnet.gov/expapi/verbs/failed"'+
	')'
)
```

Or more compactly, using a regular expression:

```javascript
stmts.where('actor.name = "Steven" and verb.id = /(passed|failed)$/')
```

`where` also supports a special xpath syntax: the wildcard `"*"`. Use it to match all objects at a given depth. For example, if you wanted to match statements who had a given activity in the context regardless of its relationship or position, you could use:

```javascript
stmts.where('context.contextActivities.*.*.id = "some_activity"')
```

instead of:

```javascript
stmts.where('context.contextActivities.parent.0.id = "some_activity"'+
	' or context.contextActivities.grouping.0.id = "some_activity"'+
	' or context.contextActivities.grouping.1.id = "some_activity"'+
	...
```

**Arguments:**

`query` (`String`)  
The query expression used to filter the data.

**Returns:**

A reference to the collection containing the latest data.


<a id='select'></a>
### select(fields, [level])

For each item in the dataset, pick out the requested fields and return them.

**Arguments:**

`fields` (`String`)  
The comma-delineated list of selection field xpaths. Each field can also use an alias via the `as` keyword. For example:

```javascript
stmts.select('group, count as value');
>>> [{group: 'someGroupId', value: 42}, ...]
```

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the collection containing the newly reduced datasets.

<a id='math'></a>
### math(resultPath, expression, [level])

Evaluate some mathematical operation `expression` on a statement or group of statements, and store the result in the field identified by `resultPath`.

Expressions use the standard mathematical syntax, with the basic arithmetic operators and literals (parentheses for grouping, *, /, +, -, integers, floats), as well as some special xpath syntax:

* `$(xpath)` returns the actual value at the xpath.
* `$|xpath|` returns the length of the value at the xpath for arrays or strings, or *undefined* for anything else.
* `${xpath}` returns the sum total of the elements within the value of the xpath if the xpath points to an array, or *null* otherwise.
* `$[xpath|start,end]` applies the *slice* operation to the value of the xpath if the value is a string or an array. *start* and *end* must be integers, and *end* is optional.

For example:

```javascript
var a = new Collection([{'score':5, 'of':8},{'score':8, 'of':10}]);
a.math('percentile', '( $(score)/$(of) ) * 100')
>>> [
	{'score': 5, 'of': 8,  'percentile': 62.5},
	{'score': 8, 'of': 10, 'percentile': 80}
]
```

This method also supports basic string manipulation. You can include literal strings by putting them in double quotes, and the slice, length, and addition operators all support strings.

```javascript
var a = new Collection([{'givenName': 'John', 'familyName': 'Smith'}])
a.math('fullName', '$(givenName) + " " + $(familyName)')
>>> [
	{'givenName': 'John', 'familyName': 'Smith', 'fullName': 'John Smith'}
]
```

**Arguments:**

`resultPath` (`String`)  
The xpath where you want the result of the expression stored.

`expression` (`String`)  
An expression that follows the grammar described above.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the collection containing the newly computed fields.


<a id='relate'></a>
### relate(keypath, valuepath, [level])

Roll array-based values up into an indexed object. Given an array of objects, choose two fields from each object and map them into a key-value pair in the parent object.

For example, if you had a group with student scores like so:

```javascript
[{
	"group": "90-100",
	"data": [{
		"name": "Alice",
		"score": 92
	},{
		"name": "Cassandra",
		"score": 97
	},{
		"name": "Michael",
		"score": 95
	}]
}]
```

You could run `collection.relate("name","score","data")` and end up with:

```javascript
[{
	"group": "90-100",
	"Alice": 92,
	"Cassandra": 97,
	"Michael": 95,
	"data": [...]
}]
```

**Arguments:**

`keypath` (`String`)  
The path to the value that will be used as the key in the resulting mapping.

`valuepath` (`String`)  
The path to the value that will be used as the value in the resulting mapping.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the collection containing the newly indexed datasets.


<a id='slice'></a>
### slice(start, [end])

Just like the `Array` function of the same name, throw out all data except for those whose position in the dataset falls between `start` and `end`.

**Arguments:**

`start` (integer)  
The beginning of the selection. Data at this index will be included in the result.

`end` (integer)(optional)  
The end of the selection. Data at this index will NOT be included in the result. If omitted, all data after `start` will be included.

**Returns:**

A reference to the collection containing the newly reduced data.

<a id='orderBy'></a>
### orderBy(field, [direction])

Sort the data by the given field, in the given direction.

**Arguments:**

`field` (`String`)  
The xpath of the field to be sorted by. E.g. `object.id`.

`direction` (`String`)(optional)  
If equal to "descending" or "desc", will sort the data from high to low. Otherwise will sort from low to high.

**Returns:**

A reference to the collection containing the newly sorted data.

<a id='groupBy'></a>
### groupBy(field, [intervals])

Divide the contents of the collection into groups based on the value of each datum's `field`. If `intervals` is supplied, the grouping is based on if the value falls within a range, otherwise the data will be grouped by simple equality.

For example:

```javascript
var stmts = new ADL.Collection([
	{name: "Alice", age: 14},
	{name: "Bob", age: 34},
	{name: "Bob", age: 50}
]);

stmts.groupBy('name')
>>> [{
	group: "Alice",
	data: [{name: "Alice", age: 14}]
},{
	group: "Bob",
	data: [{name: "Bob", age: 34},{name: "Bob", age: 50}]
}]

stmts.groupBy('age', [0,40,20])
>>> [{
	group: "0-20",
	groupStart: 0,
	groupEnd: 20,
	data: [{name: "Alice", age: 14}]
},{
	group: "20-40",
	groupStart: 20,
	groupEnd: 40,
	data: [{name: "Bob", age: 34}]
}]
	
```

Notice that in the second example using `intervals`, the datum that fell outside the bounds was not included in the result at all.

**Arguments:**

`field` (`String`)  
The xpath to the field on which the data will be grouped. E.g. `"actor.mbox"`.

`intervals` (`Array`)(optional)  
A 3-length array describing how the data should be divided. `intervals` must contain these exact three elements: a `start` value, an `end` value, and the `increment`. The value space between `start` and `end` is divided into groups of size `increment`, and each item in the collection is assigned a group based on if its `field` value is within the bounds of the group.

If `start` and `end` are numeric, then groups are determined by simple addition (e.g. `[1,4,1]` -> 1-2,2-3,3-4). If they are strings, then the first letter will be used and incremented by `increment` letters (e.g. `["a","z",13]` -> a-n,n-z ). If `start` and `end` are ISO Date strings, then `increment` represents a length of time in milliseconds.

**Returns:**

A reference to the collection containing the newly created groups.


<a id='count'></a>
### count([level])

Determine the number of items in each group, or in the whole collection if not grouped.

**Arguments:**

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the resulting collection.


<a id='sum'></a>
### sum(field, [level])

Determine the total value of each group's data, or all data if not grouped.

**Arguments:**

`field` (`String`)  
An xpath indicating a field in each piece of data to be added to the total.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the collection.

<a id='average'></a>
### average(field, [level])

Determine the average value of each group's data, or all data if not grouped.

**Arguments:**

`field` (`String`)  
An xpath indicating a field in each piece of data to be averaged.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the resulting collection.

<a id='min'></a>
### min(field, [level])

Determine the minimum value of each group's data, or all data if not grouped.

**Arguments:**

`field` (`String`)  
An xpath indicating a field in each piece of data to be compared against the minimum.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the resulting collection.


<a id='max'></a>
### max(field, [level])

Determine the minimum value of each group's data, or all data if not grouped.

**Arguments:**

`field` (`String`)  
An xpath indicating a field in each piece of data to be compared against the maximum.

`level` (`int`) (optional)  
If supplied, will descend *level* levels into each member of each group, and run the operation in each member's scope, so all xpaths will be relative to that member. This should only be used in conjunction with multiple `groupBy`s.

**Returns:**

A reference to the resulting collection.
