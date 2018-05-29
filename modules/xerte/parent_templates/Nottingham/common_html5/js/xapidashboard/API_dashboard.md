# xAPI Dashboard API Reference

There are several classes necessary to create charts, and they are documented below. From a high level, the `XAPIDashboard` class retrieves, stores, and distributes your xAPI data, the `Chart` class encapsulates a particular visualization that uses the Dashboard data, and the `ADL` global object contains helper functions necessary for the use of the other two classes.


## XAPIDashboard class

Used to query the LRS and generate visualizations from the returned xAPI data.

### Constructor

#### new ADL.XAPIDashboard(container)

Creates a new instance of the XAPIDashboard. Used to fetch statements from an LRS and generate charts.

**Arguments:**

`container` (`String`)(optional)  
The default container for charts generated for this dashboard. If omitted, the `container` option must be specified per chart.


### Properties

<a id='data'></a>
#### data

Type: `ADL.Collection`

Stores the statements retrieved by the [fetchAllStatements](#fetchAllStatements) and [addStatements](#addStatements) methods. Is also used as the database for generated graphs.



### Methods

<a id='addStatements'></a>
#### addStatements(statementArray)

Adds new statements to the `data` object.

**Arguments:**

`statementArray` (`Array`)  
An array of statements to be added

**Returns:**

*(nothing)*



<a id='clearSavedStatements'></a>
#### clearSavedStatements()

Empties the `data` object.

**Arguments:**

*(none)*

**Returns:**

*(nothing)*



<a id='fetchAllStatements'></a>
#### fetchAllStatements(query, [wrapper], [callback])

Fetches statements from an LRS until no `more` are returned, and stores them in the `data` object.

**Arguments:**

`query` (`Object`)  
An object containing [xAPI query arguments](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#stmtapiget)

`wrapper` (`XAPIWrapper`)(optional)  
The instance of the XAPIWrapper to use for querying.
Defaults to the global `ADL.XAPIWrapper` if omitted.

`callback` (`function(data)`)(optional)  
A function that is called once all statements have been fetched from the LRS.
Is passed the Collection of fetched statements (i.e. [data](#data)).

**Returns:**

*(nothing)*

<a id='createBarChart'></a>
#### createBarChart(options)

Equivalent to [createChart](#createChart)("barChart", options).


<a id='createChart'></a>
#### createChart(type, options)

Generates an SVG chart or HTML table of the given `type` using the `options` specified.

**Arguments:**

`type` (`string`)  
Determines what kind of chart is generated. For SVG charts, type must be one of `lineChart`, `barChart`, `pieChart`, or `multiBarChart`. For an HTML table, type must be `table`.


`options` (`Object`)  
An object containing some/all of the following properties:

* `container` (`String`)(optional)

	A CSS-style selector indicating where in the DOM the chart should be placed. If omitted, the chart is placed in the default location for this dashboard (from the Dashboard constructor).
	
* `pre` (`function(data, event)` or `String`)(optional)

	Preprocesses the raw xAPI data however the user chooses. Takes in a Collection of statements, and must output another Collection, usually some filtered subset of the input (e.g. `return data.where(...);`). All Collection methods are available, but the system will break if `exec` is called at this stage.
	
	If this chart is a "child" chart, the second argument to the `pre` function (the `event` parameter) will contain a d3 click event object. Use this object to determine what was clicked in the parent chart and filter the data appropriately. Most significantly, `event.in` contains the name of the bar, or the x-value of the point, clicked on.
	
	If the `pre` field is a string, it is assumed to be a query string suitable for passing into `Collection.where()`.
	
	

* `aggregate` (`Function`)

	Processes the xAPI data into a format consumable by the chart backend. Generally provided by an ADL generator function like `ADL.average`. E.g.
	
	```javascript
	"aggregate": ADL.average("result.score.raw")
	```
	
	See [Aggregate functions](#aggregateFunctions) for more about this field.
	
* `groupBy` (`String`)

	Indicates that the aggregate function should be called for each group of statements with the same value for the field specified by this property. You can think of this as the *x* axis on the chart, whereas the result of the aggregate function is the *y* axis.
	
	For example, if you wanted to know how many times each actor is mentioned, you could say `aggregate: ADL.count(), groupBy: "actor.mbox"` or something similar, and would get a chart with a bar for each actor, and the bar's height would correspond to the number of statements that actor had.

	You can refer to the grouped-by field with the xpath `group`, and the xAPI statement group members are in the `data` array.
	
* `innerGroupBy` (`String`) (optional)

	Organizes data into subgroups by performing an additional `groupBy`. If this option is not used with `multiAggregate`, then it is ignored.
	
	Example:
	```javascript
	groupBy: 'actor.name', 
	innerGroupBy: 'object.definition.name.en-US'
	aggregate: ADL.multiAggregate(ADL.select('result.score.raw'))
	```
	
	| Name   | Object   | Score 
	| ---    | ---      | --- 
	| Ashley | Test 1   | 86    
	|        | Test 2   | 95    
	| Ben    | Test 1   | 92
	|        | Test 2   | 89
	
* `range` (`Object`)

	Modifies the `groupBy` option by allowing similar values to be grouped instead of just equal values. The value of this property must be an object containing `start`, `end`, and `increment` properties. The value space between `start` and `end` will be divided up into groups of size `increment`.
	
	Works for three value types: numbers, strings, and ISO-formatted date strings. The type of `start` and `end` should match the type of the value being compared (the value of the field given by `groupBy`).
	
	For numeric types like test scores, you can group into grade brackets by 10's:
	
	```javascript
	groupBy: "result.score.raw",
	range: {
		start: 60,
		end: 100,
		increment: 10
	}
	```
	
	For string types, this will group by first letter into groups a-h, i-p, q-x, and y-z:
	
	```javascript
	groupBy: "actor.name",
	range: {
		start: "a",
		end: "z",
		increment: 8
	}
	```

	Finally, for date string types, this will group into days, where increment is in milliseconds:
	
	```javascript
	groupBy: "timestamp",
	range: {
		start: "2014-04-21",
		end: "2014-05-21",
		increment: 1000*60*60*24
	}
	```

	This option adds two extra fields to the group, in addition to that added by `groupBy`: the `groupStart` and `groupEnd` fields, which correspond to the bounds of the interval used for that group.

* `rangeLabel` (`String`)

	Specifies the field used for the label on the graph. The most common use case for this is to use the display name for a verb or activity on the graph label instead of the ID. This option has a special case for the fields `groupStart` and `groupEnd`, which can be referred to simply as `start` or `end`.

	Example:

	```javascript
	groupBy: 'object.id',
	rangeLabel: 'data.0.object.definition.name.en-US'
	```

* `post` (`function(data, event)`)(optional)

	Processes the data after everything has been aggregated and prepared for the chart, where `data` is a Collection object containing the series to be drawn to the chart. Use this function to operate on the chart data. For example, you could sort the bars of a bar graph by height from here. May optionally return the processed data.

* `process` (`function(data, event, opts)`)(optional)

	Bypasses the pre, aggregate, and post options and handles all processing and data formatting that would have otherwise been handled internally by the Chart and Dashboard. This option is generally not needed for most use cases and should only be used by more advanced users. This option is currently ignored in charts that use `multiAggregate`.

	The `data` argument is simply the same Collection of statements given to or fetched by the Dashboard and may be operated on in arbitrary ways (filtering, aggregating, grouping, etc.). The `opts` object is this chart's configuration options object (the same one that includes this `process` function) from which you can access `groupBy`, `range`, `child`, and other properties. The `opts.cb` callback *must* be called and given an array of objects that have `in` and `out` keys. The `in` key is used as a way to label its respective `out` value, which must always be a number. For example:
	
	```javascript
	process: function(data, event, opts){
		opts.cb([{in: 'count1', out: 90}, {in: 'count2', out: 47}]);
	}
	```
	
	This generates a trivial chart where the charted value at `count1` is 90 and the value at `count2` is 47. To take a similar action using the provided `data` Collection:
	
	```javascript
	process: function(data, event, opts){
		data.where('actor.name != null')
		.groupBy('actor.name')
		.count()
		.orderBy('count', 'desc')
		.select('group as in, count as out')
		.exec(opts.cb);	
	}
	```
	
	Note that in this example, the process function is handling filtering (`pre`), grouping (`groupBy`), aggregating, ordering according to the results of the aggregation (`post`), selecting the `in` and `out` keys, and running `exec` with `opts.cb` given as a callback function. For more information about how these functions work, refer to the [Collection API documentation](API_collection.md).

* `customize` (`function(nvd3chart)`)(optional)

	Change the appearance and behavior of the chart by calling nvd3's format functions. See the [nvd3](http://nvd3.org/index.html) documentation for more details.
	
* `child` (`Array`)(optional)

	Pass click event data from this chart into these "child" charts when a data point is clicked on. Used to "drill into" the data further, and examine derivative relationships.
	
	This property should contain an array of `Chart` objects. They will be redrawn when this chart is clicked on.
	
* `smoothTransition` (`Boolean`)(optional)

	If `true`, this chart is not cleared before being redrawn by its parent. While this produces a smooth transition between this chart's current state and its final state, it is also the cause of bugs with tooltip positioning. 
	
	If `false`, this chart is cleared before being redrawn by its parent. This produces a subtle flicker as the container is cleared and refilled, but it elimates bugs related to tooltip positioning.
	
	This property is `false` by default. It has no effect on Tables.

**Returns:**

The instance of the [Chart](#chart) class created by the function call. Must call `draw()` or hook it to another chart before the chart will be displayed.


<a id='createLineChart'></a>
#### createLineChart(options)

Equivalent to [createChart](#createChart)("lineChart", options).

<a id='createMultiBarChart'></a>
#### createMultiBarChart(options)

Equivalent to [createChart](#createChart)("multiBarChart", options).

<a id='createPieChart'></a>
#### createPieChart(options)

Equivalent to [createChart](#createChart)("pieChart", options).

<a id='createTable'></a>
#### createTable(options)

Equivalent to [createChart](#createChart)("table", options).



<a id='chart'></a>
## Chart class

### Constructors

Do not construct this class directly. Instead, use the Dashboard methods.

### Properties

`event` (NVD3 Event)  
If this chart is a child chart, this contains the event that caused the `draw()` call.

`parent` (`Chart`)  
If this chart is a child chart, this contains a reference to the parent chart.

`child` (`Array`)  
If this chart has children, then this contains an Array containing references to the child charts.

### Methods

#### clear()

Erases the chart from its container.

**Arguments:**

*(none)*

**Returns:**

*(nothing)*

<a id='draw'></a>
#### draw()

Perform all requisite data processing, generate the chart, and place it in its container.

**Arguments:**

*(none)*

**Returns:**

*(nothing)*

#### getCSVDataURI()

Generates a data URI from the results of [getCSVDataString](#getcsvdatastring)().

**Arguments:**

*(none)*

**Returns:**

A data URI string of CSV data which can be used in the same way any other URI/URL is used.

<a id='getcsvdatastring'></a>
#### getCSVDataString()

Generates comma-separated values (CSV) from the aggregate data used to generate this chart. If downloaded (or copy-pasted), the returned CSV string can be directly imported into any application that supports the CSV format.

**Arguments:**

*(none)*

**Returns:**

A CSV string.

#### getSVGDataURI()

Generates a data URI containing the Base64-encoded contents of the svg generated by calling [draw](#draw)(). This function simply copies the svg as it stands in the DOM, and returns it as a data URI. This method does not work with Tables and support is very limited for LineCharts.

**Arguments:**

*(none)*

**Returns:**

A data URI string of the drawn SVG document which can be used in the same way any other URI/URL is used. If downloaded or copy and pasted, then the exported data can be imported into any application that supports SVGs.



<a id='aggregateFunctions'></a>
## Aggregate functions

These functions are all found under the `ADL` namespace, and perform different calculations over xAPI data. These compose a key component of the charting infrastructure.

### ADL.average(xpath)

Will group the data based on the `groupBy` and `range` options to the chart, and map the average value of the members' `xpath` fields to the y-axis of the resulting chart.

**Arguments:**

`xpath` (`String`)  
The field to average. 

### ADL.count()

Will group the data based on the `groupBy` and `range` options to the chart, and map the sizes of the groups to the y-axis of the resulting chart.

**Arguments:**

*(none)*


### ADL.max(xpath)

Will group the data based on the `groupBy` and `range` options to the chart, and map the maximum value of the members' `xpath` fields to the y-axis of the resulting chart.

**Arguments:**

`xpath` (`String`)  
The field to find the maximum of. 



### ADL.min(xpath)

Will group the data based on the `groupBy` and `range` options to the chart, and map the minimum value of the members' `xpath` fields to the y-axis of the resulting chart.

**Arguments:**

`xpath` (`String`)  
The field to find the minimum of. 


### ADL.multiAggregate([xpath], fn1, fn2, fn3, ...)

Can only be used for chart types that support the simultaneous display of multiple streams of data. Currently, the only chart types that support this are `multiBarChart` and `table`. 

`multiAggregate` will call each of the provided aggregation functions and pass the optional `xpath` string to functions that are *passed by reference*. If `xpath` is omitted and an aggregation does not specify its own `xpath`, then an error is logged and that aggregation function is not included in the chart.

Examples:

```javascript
groupBy: 'actor.name',
aggregate: ADL.multiAggregate('result.score.raw', ADL.min, ADL.max, ADL.average)
		
```

```javascript
groupBy: 'actor.name',
aggregate: ADL.multiAggregate('result.score.raw', ADL.min, ADL.max, ADL.select('verb.display.en-US'))
		
```

```javascript
groupBy: 'actor.name',
aggregate: ADL.multiAggregate(ADL.min('result.score.raw'), ADL.average('result.score.raw'), ADL.select('verb.display.en-US'))
```

**Arguments:**

`xpath` (`String`)(optional)  
The field given to an aggregation function reference. 

`fn1, fn2, fn3, ...` (`Aggregation Function`)  
An arbitrary number of aggregation functions to run.


### ADL.select(xpath)

Will group the data based on the `groupBy` and `range` options to the chart, and will select the specified `xpath` value from the *first* xAPI statement in each group. Useful if outputting raw data is desired.

**Arguments:**

`xpath` (`String`)  
The field to select. 


### ADL.sum(xpath)

Will group the data based on the `groupBy` and `range` options to the chart, and map the total value of the members' `xpath` fields to the y-axis of the resulting chart.

**Arguments:**

`xpath` (`String`)  
The field to total. 
