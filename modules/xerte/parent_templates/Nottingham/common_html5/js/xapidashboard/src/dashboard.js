"use strict";

(function(ADL){
	
	var XAPIDashboard = function(container){
		this.container = container;
		try {
			this.data = new ADL.Collection();
		}
		catch(e){
			this.data = new ADL.CollectionSync();
		}
	}

	XAPIDashboard.prototype.fetchAllStatements = function(query, wrapper, cb){
		var self = this, statementsArr = [];
		if( !wrapper || typeof(wrapper) === 'function' ){
			if(typeof(wrapper) === 'function' && !cb)
				cb = wrapper;
			wrapper = ADL.XAPIWrapper;
		}

		wrapper.getStatements(query, null, function getMore(r){
			var response = JSON.parse(r.response);
			
			self.data.append(response.statements);

			if(response.more){
				wrapper.getStatements(null, response.more, getMore);
			}
			else {
				cb(self.data);
			}
		});
	};
	
	XAPIDashboard.prototype.clearSavedStatements = function(){
		
		//Update to support async collections!
		this.statements = new ADL.Collection();
	};
	
	XAPIDashboard.prototype.addStatements = function(statementsArr){
	
		if(statementsArr.response){
			try{
				statementsArr = JSON.parse(statementsArr.response).statements;
			}
			catch(e){
				console.error("Error parsing JSON data", statementsArr.response);
				return;
			}
		}
		this.data.append(statementsArr);
	};
	
	// default aggregator requires opts.xField
	// opts.aggregate, opts.pre, opts.post, opts.customize are optional functions
	XAPIDashboard.prototype.createChart = function(type, opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		switch(type){
			case "barChart": opts.chart = new ADL.BarChart(opts); break;
			case "lineChart": opts.chart = new ADL.LineChart(opts); break;
			case "pieChart": opts.chart = new ADL.PieChart(opts); break;
			case "multiBarChart": opts.chart = new ADL.MultiBarChart(opts); break;
			case "linePlusBarChart": opts.chart = new ADL.LinePlusBarChart(opts); break;
			case "table": opts.chart = new ADL.Table(opts); break;
			default: opts.chart = new ADL.Chart(opts);
		}
		
		return opts.chart;
	}; 
	XAPIDashboard.prototype.createBarChart = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.BarChart(opts);
		return opts.chart;
	}; 
	XAPIDashboard.prototype.createLinePlusBarChart = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.LinePlusBarChart(opts);
		return opts.chart;
	}; 
	XAPIDashboard.prototype.createMultiBarChart = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.MultiBarChart(opts);
		return opts.chart;
	}; 
	XAPIDashboard.prototype.createLineChart = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.LineChart(opts);
		return opts.chart;
	};  
	XAPIDashboard.prototype.createPieChart = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.PieChart(opts);
		return opts.chart;
	};   
	XAPIDashboard.prototype.createTable = function(opts){
		opts.data = this.data;
		opts.container = opts.container ? opts.container : this.container;
		
		opts.chart = new ADL.Table(opts);
		return opts.chart;
	}; 
	
	/*
	 * Class methods to perform graph "formatting" operations
	 */	 
	ADL.select = function(xpath){		
		
		var innerFn = function(opts, join){
			if(!opts.groupBy){
				console.error("group has not been specified, aborting aggregation", opts);
				return;
			}
			
			opts.xpath = xpath;
			if(join !== true){
				var selectStr = 'group, ' + "data.0." + xpath + ' as $internalValue';
				if(opts.range){
					return opts.data = opts.data.groupBy(opts.groupBy, [opts.range.start, opts.range.end, opts.range.increment]).select(selectStr).exec(formatData);
				}
				else {
					return opts.data = opts.data.groupBy(opts.groupBy).select(selectStr).exec(formatData);
				}
			}
			
			else{
				return opts.data.contents.map(function(element){
					var retrieve = element.data[0];
					element[xpath] = xpathfn(xpath, retrieve);
				});
			}
			
			//Used as an intermediate callback for exec
			function formatData(data){
				for(var i = 0; i < data.length; i++){
					data[i].in = data[i].group;
					data[i].out = data[i]['$internalValue'];
					delete data[i].group;
					delete data[i].data;
				}
				
				opts.cb(data);
			}
		};
		
		innerFn._inner = true;
		innerFn._name = "select";
		return innerFn;
	};

	ADL.count = function(ignoreXpath){
		var innerFn = function(opts, join){
			if(!opts.groupBy){
				console.error("group has not been specified, aborting aggregation", opts);
				return;
			}
				
			var ret = opts.data;
			if(join !== true){
				var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
				var rangeLabel;
				if( opts.rangeLabel === 'start' )
					rangeLabel = 'groupStart';
				else if( opts.rangeLabel === 'end' )
					rangeLabel = 'groupEnd';
				else
					rangeLabel = opts.rangeLabel || 'group';
					
				return opts.data = ret.groupBy(opts.groupBy, range).count().select(rangeLabel+' as in, count as out').exec(opts.cb);
			}
			else {
				return ret.count(opts.groupByLevel);
			}

		};
		
		innerFn._inner = true;
		innerFn._name = "count";
		return innerFn;
	};	
	
	ADL.sum = function(xpath){
		var innerFn = function(opts, join){
			if(!opts.groupBy || !xpath){
				console.error("group or xpath has not been specified, aborting aggregation", opts);
				return;
			}
				
			opts.xpath = xpath;
			var ret = opts.data;
			if(join !== true){
				var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
				var rangeLabel;
				if( opts.rangeLabel === 'start' )
					rangeLabel = 'groupStart';
				else if( opts.rangeLabel === 'end' )
					rangeLabel = 'groupEnd';
				else
					rangeLabel = opts.rangeLabel || 'group';
					
				return opts.data = ret.groupBy(opts.groupBy, range).sum(xpath).select(rangeLabel+' as in, sum as out').exec(opts.cb);
			}
			else {
				return ret.sum(xpath, opts.groupByLevel);
			}

		};
		
		innerFn._inner = true;
		innerFn._name = "sum";
		return innerFn;
	};	
	
	ADL.min = function(xpath){
		var innerFn = function(opts, join){
			if(!opts.groupBy || !xpath){
				console.error("group or xpath has not been specified, aborting aggregation", opts);
				return;
			}
				
			opts.xpath = xpath;
			var ret = opts.data;
			if(join !== true){
				var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
				var rangeLabel;
				if( opts.rangeLabel === 'start' )
					rangeLabel = 'groupStart';
				else if( opts.rangeLabel === 'end' )
					rangeLabel = 'groupEnd';
				else
					rangeLabel = opts.rangeLabel || 'group';
					
				return opts.data = ret.groupBy(opts.groupBy, range).min(xpath).select(rangeLabel+' as in, min as out').exec(opts.cb);
			}
			else {
				return ret.min(xpath, opts.groupByLevel);
			}

		};
		
		innerFn._inner = true;
		innerFn._name = "min";
		return innerFn;
	};	
	
	ADL.max = function(xpath){
		var innerFn = function(opts, join){
			if(!opts.groupBy || !xpath){
				console.error("group or xpath has not been specified, aborting aggregation", opts);
				return;
			}
				
			opts.xpath = xpath;
			var ret = opts.data;
			if(join !== true){
				var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
				var rangeLabel;
				if( opts.rangeLabel === 'start' )
					rangeLabel = 'groupStart';
				else if( opts.rangeLabel === 'end' )
					rangeLabel = 'groupEnd';
				else
					rangeLabel = opts.rangeLabel || 'group';
					
				return opts.data = ret.groupBy(opts.groupBy, range).max(xpath).select(rangeLabel+' as in, max as out').exec(opts.cb);
			}
			else {
				return ret.max(xpath, opts.groupByLevel);
			}

		};
		
		innerFn._inner = true;
		innerFn._name = "max";
		return innerFn;
	};	
	
	ADL.average = function(xpath){
		var innerFn = function(opts, join){
			if(!opts.groupBy || !xpath){
				console.error("group or xpath has not been specified, aborting aggregation", opts);
				return;
			}
				
			opts.xpath = xpath;
			var ret = opts.data;
			if(join !== true){
				var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
				var rangeLabel;
				if( opts.rangeLabel === 'start' )
					rangeLabel = 'groupStart';
				else if( opts.rangeLabel === 'end' )
					rangeLabel = 'groupEnd';
				else
					rangeLabel = opts.rangeLabel || 'group';
					
				return opts.data = ret.groupBy(opts.groupBy, range).average(opts.xpath).select(rangeLabel+' as in, average as out').exec(opts.cb);
			}
			else {
				
				return ret.average(xpath, opts.groupByLevel);
			}

		};
		
		innerFn._inner = true;
		innerFn._name = "average";
		return innerFn;
	};	
	
	ADL.multiAggregate = function(xpath){
		
		var multi;
		if(typeof xpath === "string"){
			multi = Array.prototype.slice.call(arguments, 1);
		}
		else{
			multi = Array.prototype.slice.call(arguments, 0);
			xpath = null;
		}
		
		var innerFn = function(opts){
			if(!opts.groupBy){
				console.error("group has not been specified, aborting aggregation", opts);
				return;
			}
			
			opts.groupByLevel = opts.innerGroupBy ? 1 : 0;
			var range = opts.range ? [opts.range.start, opts.range.end, opts.range.increment] : null;
			opts.data = opts.groupByLevel > 0 ? opts.data.groupBy(opts.groupBy).groupBy(opts.innerGroupBy) : opts.data.groupBy(opts.groupBy);
			
			for( var i=0; i<multi.length; i++ ){
				
				//This is a reference directly to the inner function
				if(multi[i]._inner){
					multi[i](opts, true);
				}
				else if(xpath != null){
					multi[i](xpath)(opts, true);
				}
				else{
					console.error("If an xpath is not provided to multiAggregate, then it must be provided to each aggregation function");
				}
			}
			return opts.data = opts.data.exec(tempCb);
			
			function tempCb(data)
			{
				var colorRange = d3.scale.category10().range(),
					aggArr = [],
					ignoreKeys = ['data', 'group', 'sample'],
					g = 0,
					tempData = opts.groupByLevel > 0 ? data[0].data[0] : data[0];

				// create series from aggregate fields of data
				if(opts.groupByLevel == 0){
					for(var i in data[0]){
						if( ignoreKeys.indexOf(i) < 0 ){
							aggArr.push({key: i, values: [], color: colorRange[g]});
							g++;
						}
					}
				}
				else{
					var firstElem = data[0].data;
					for(var j = 0; j < firstElem.length; j++){
						for(var i in firstElem[j]){
							if( ignoreKeys.indexOf(i) < 0 ){
								var keyName =  firstElem[j].group + " " + i;
								
								//
								for(var z = 0; z < data.length; z++){
									if(data[z].data[j]){
										data[z].data[j][keyName] = data[z].data[j][i] == undefined ? 0 : data[z].data[j][i];
									}
									else{
										//Should anything be done when data is missing? Ex: group by test, second group by verb (pass/fail). Well,
										//it's possible for all students to pass a test, leaving that test without fail statements.
									}
								}
								
								aggArr.push({key: keyName, values: [], color: colorRange[g]});
								g++;
							}
						}
					}
				}
				
				// add data to series
				for(var i = 0; i < data.length; i++){
					var tempData = data[i], j = 0;
					
					do{
						if(opts.groupByLevel > 0) tempData = data[i].data[j];
						for(g = 0; g < aggArr.length; g++){
							if(tempData[aggArr[g].key] != undefined){
								aggArr[g].values.push({in: data[i].group, out: tempData[aggArr[g].key], series: g});
							}
						}
						
						j++;
					}
					while(opts.groupByLevel > 0 && data[i].data.length > j);
				}
				
				opts.cb(aggArr);
			}
		};
		
		innerFn._name = "multiAggregate";
		return innerFn;
	};	 
	
	ADL.XAPIDashboard = XAPIDashboard;
	ADL.$ = function(query){ return document.querySelector(query); };

})(window.ADL = window.ADL || {});

/*
 * xpath is used in select aggregation function. Temporarily copied here.
 * Retrieves some deep value at path from an object
 */
function xpath(path,obj)
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
		//var parts = /^([^\.]+)(?:\.(.+))?$/.exec(path);
		var parts;
		if(Array.isArray(path)){
			parts = path;
		}
		else {
			parts = path.split('.');
			var i=0;
			while(i<parts.length){
				if(parts[i].charAt(parts[i].length-1) === '\\')
					parts.splice(i, 2, parts[i].slice(0,-1)+'.'+parts[i+1]);
				else
					i++;
			}
		}

		var scoped = parts[0], rest = parts.slice(1);
		return xpath(rest, obj[scoped]);
	}
}

function xpathfn(x, obj){
	return xpath(x, obj);
}

/* nvd3 model.multibar extension -- changes default stacked behavior */

nv.models.multiBar = function() {
  "use strict";
  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var margin = {top: 0, right: 0, bottom: 0, left: 0}
    , width = 960
    , height = 500
    , x = d3.scale.ordinal()
    , y = d3.scale.linear()
    , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
    , getX = function(d) { return d.x }
    , getY = function(d) { return d.y }
    , forceY = [0] // 0 is forced by default.. this makes sense for the majority of bar graphs... user can always do chart.forceY([]) to remove
    , clipEdge = true
    , stacked = true
    , stackOffset = 'zero' // options include 'silhouette', 'wiggle', 'expand', 'zero', or a custom function
    , color = nv.utils.defaultColor()
    , hideable = false
    , barColor = null // adding the ability to set the color for each rather than the whole group
    , disabled // used in conjunction with barColor to communicate from multiBarHorizontalChart what series are disabled
    , delay = 1200
    , xDomain
    , yDomain
    , xRange
    , yRange
    , groupSpacing = 0.1
    , dispatch = d3.dispatch('chartClick', 'elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout')
    ;

  //============================================================


  //============================================================
  // Private Variables
  //------------------------------------------------------------

  var x0, y0 //used to store previous scales
      ;

  //============================================================


  function chart(selection) {
    selection.each(function(data) {
      var availableWidth = width - margin.left - margin.right,
          availableHeight = height - margin.top - margin.bottom,
          container = d3.select(this);

      if(hideable && data.length) hideable = [{
        values: data[0].values.map(function(d) {
        return {
          x: d.x,
          y: 0,
          series: d.series,
          size: 0.01
        };}
      )}];

      if (stacked)
        data = d3.layout.stack()
                 .offset(stackOffset)
                 .values(function(d){ return d.values })
                 .y(getY)
                 (!data.length && hideable ? hideable : data);


      //add series index to each data point for reference
      data.forEach(function(series, i) {
        series.values.forEach(function(point) {
          point.series = i;
        });
      });


      //------------------------------------------------------------
      // HACK for negative value stacking
      if (stacked)
        data[0].values.map(function(d,i) {
          var posBase = 0, negBase = 0;
          data.map(function(d) {
            var f = d.values[i]
            f.size = Math.abs(f.y);
            if (f.y<0)  {
              f.y1 = negBase;
              negBase = negBase - f.size;
            } else
            {
              f.y1 = f.size + posBase;
              posBase = posBase + f.size;
            }
          });
        });

      //------------------------------------------------------------
      // Setup Scales

      // remap and flatten the data for use in calculating the scales' domains
      var seriesData = (xDomain && yDomain) ? [] : // if we know xDomain and yDomain, no need to calculate
            data.map(function(d) {
              return d.values.map(function(d,i) {
                return { x: getX(d,i), y: getY(d,i), y0: d.y0, y1: d.y1 }
              })
            });

      x   .domain(xDomain || d3.merge(seriesData).map(function(d) { return d.x }))
          .rangeBands(xRange || [0, availableWidth], groupSpacing);

      //y   .domain(yDomain || d3.extent(d3.merge(seriesData).map(function(d) { return d.y + (stacked ? d.y1 : 0) }).concat(forceY)))
      y   .domain(yDomain || d3.extent(d3.merge(seriesData).map(function(d) { return d.y }).concat(forceY)))
          .range(yRange || [availableHeight, 0]);

      // If scale's domain don't have a range, slightly adjust to make one... so a chart can show a single data point
      if (x.domain()[0] === x.domain()[1])
        x.domain()[0] ?
            x.domain([x.domain()[0] - x.domain()[0] * 0.01, x.domain()[1] + x.domain()[1] * 0.01])
          : x.domain([-1,1]);

      if (y.domain()[0] === y.domain()[1])
        y.domain()[0] ?
            y.domain([y.domain()[0] + y.domain()[0] * 0.01, y.domain()[1] - y.domain()[1] * 0.01])
          : y.domain([-1,1]);


      x0 = x0 || x;
      y0 = y0 || y;

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Setup containers and skeleton of chart

      var wrap = container.selectAll('g.nv-wrap.nv-multibar').data([data]);
      var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-multibar');
      var defsEnter = wrapEnter.append('defs');
      var gEnter = wrapEnter.append('g');
      var g = wrap.select('g')

      gEnter.append('g').attr('class', 'nv-groups');

      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      //------------------------------------------------------------



      defsEnter.append('clipPath')
          .attr('id', 'nv-edge-clip-' + id)
        .append('rect');
      wrap.select('#nv-edge-clip-' + id + ' rect')
          .attr('width', availableWidth)
          .attr('height', availableHeight);

      g   .attr('clip-path', clipEdge ? 'url(#nv-edge-clip-' + id + ')' : '');



      var groups = wrap.select('.nv-groups').selectAll('.nv-group')
          .data(function(d) { return d }, function(d,i) { return i });
      groups.enter().append('g')
          .style('stroke-opacity', 1e-6)
          .style('fill-opacity', 1e-6);
      groups.exit()
        .transition()
        .selectAll('rect.nv-bar')
        .delay(function(d,i) {
             return i * delay/ data[0].values.length;
        })
          .attr('y', function(d) { return stacked ? y0(d.y0) : y0(0) })
          .attr('height', 0)
          .remove();
      groups
          .attr('class', function(d,i) { return 'nv-group nv-series-' + i })
          .classed('hover', function(d) { return d.hover })
          .style('fill', function(d,i){ return color(d, i) })
          .style('stroke', function(d,i){ return color(d, i) });
      groups
          .transition()
          .style('stroke-opacity', 1)
          .style('fill-opacity', .75);


      var bars = groups.selectAll('rect.nv-bar')
          .data(function(d) { return (hideable && !data.length) ? hideable.values : d.values });

      bars.exit().remove();


      var barsEnter = bars.enter().append('rect')
          .attr('class', function(d,i) { return getY(d,i) < 0 ? 'nv-bar negative' : 'nv-bar positive'})
          .attr('x', function(d,i,j) {
              return stacked ? 0 : (j * x.rangeBand() / data.length )
          })
          .attr('y', function(d) { return y0(stacked ? d.y0 : 0) })
          .attr('height', 0)
          .attr('width', x.rangeBand() / (stacked ? 1 : data.length) )
          .attr('transform', function(d,i) { return 'translate(' + x(getX(d,i)) + ',0)'; })
          ;
      bars
          .style('fill', function(d,i,j){ return color(d, j, i);  })
          .style('stroke', function(d,i,j){ return color(d, j, i); })
          .on('mouseover', function(d,i) { //TODO: figure out why j works above, but not here
            d3.select(this).classed('hover', true);
            dispatch.elementMouseover({
              value: getY(d,i),
              point: d,
              series: data[d.series],
              pos: [x(getX(d,i)) + (x.rangeBand() * (stacked ? data.length / 2 : d.series + .5) / data.length), y(getY(d,i) + (stacked ? d.y0 : 0))],  // TODO: Figure out why the value appears to be shifted
              pointIndex: i,
              seriesIndex: d.series,
              e: d3.event
            });
          })
          .on('mouseout', function(d,i) {
            d3.select(this).classed('hover', false);
            dispatch.elementMouseout({
              value: getY(d,i),
              point: d,
              series: data[d.series],
              pointIndex: i,
              seriesIndex: d.series,
              e: d3.event
            });
          })
          .on('click', function(d,i) {
            dispatch.elementClick({
              value: getY(d,i),
              point: d,
              series: data[d.series],
              pos: [x(getX(d,i)) + (x.rangeBand() * (stacked ? data.length / 2 : d.series + .5) / data.length), y(getY(d,i) + (stacked ? d.y0 : 0))],  // TODO: Figure out why the value appears to be shifted
              pointIndex: i,
              seriesIndex: d.series,
              e: d3.event
            });
            d3.event.stopPropagation();
          })
          .on('dblclick', function(d,i) {
            dispatch.elementDblClick({
              value: getY(d,i),
              point: d,
              series: data[d.series],
              pos: [x(getX(d,i)) + (x.rangeBand() * (stacked ? data.length / 2 : d.series + .5) / data.length), y(getY(d,i) + (stacked ? d.y0 : 0))],  // TODO: Figure out why the value appears to be shifted
              pointIndex: i,
              seriesIndex: d.series,
              e: d3.event
            });
            d3.event.stopPropagation();
          });
      bars
          .attr('class', function(d,i) { return getY(d,i) < 0 ? 'nv-bar negative' : 'nv-bar positive'})
          .transition()
          .attr('transform', function(d,i) { return 'translate(' + x(getX(d,i)) + ',0)'; })

      if (barColor) {
        if (!disabled) disabled = data.map(function() { return true });
        bars
          .style('fill', function(d,i,j) { return d3.rgb(barColor(d,i)).darker(  disabled.map(function(d,i) { return i }).filter(function(d,i){ return !disabled[i]  })[j]   ).toString(); })
          .style('stroke', function(d,i,j) { return d3.rgb(barColor(d,i)).darker(  disabled.map(function(d,i) { return i }).filter(function(d,i){ return !disabled[i]  })[j]   ).toString(); });
      }


      if (stacked)
          bars.transition()
            .delay(function(d,i) {

                  return i * delay / data[0].values.length;
            })
            .attr('height', function(d,i) {
              return Math.max(Math.abs(y(d.y + (stacked ? d.y0 : 0)) - y((stacked ? d.y0 : 0))),1);
            })
            .attr('x', function(d,i) {
                  return stacked ? 0 : (d.series * x.rangeBand() / data.length )
            })
			.attr('y', function(d,i) {
                return getY(d,i) < 0 ?
                        y(0) :
                        y(0) - y(getY(d,i)) < 1 ?
                          y(0) - 1 :
                        y(getY(d,i)) || 0;
            })
            .attr('height', function(d,i) {
                return Math.max(Math.abs(y(getY(d,i)) - y(0)),1) || 0;
            });
      else
          bars.transition()
            .delay(function(d,i) {
                return i * delay/ data[0].values.length;
            })
            .attr('x', function(d,i) {
              return d.series * x.rangeBand() / data.length
            })
            .attr('width', x.rangeBand() / data.length)
            .attr('y', function(d,i) {
                return getY(d,i) < 0 ?
                        y(0) :
                        y(0) - y(getY(d,i)) < 1 ?
                          y(0) - 1 :
                        y(getY(d,i)) || 0;
            })
            .attr('height', function(d,i) {
                return Math.max(Math.abs(y(getY(d,i)) - y(0)),1) || 0;
            });



      //store old scales for use in transitions on update
      x0 = x.copy();
      y0 = y.copy();

    });

    return chart;
  }


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  chart.dispatch = dispatch;

  chart.options = nv.utils.optionsFunc.bind(chart);

  chart.x = function(_) {
    if (!arguments.length) return getX;
    getX = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return getY;
    getY = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.xScale = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };

  chart.yScale = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };

  chart.xDomain = function(_) {
    if (!arguments.length) return xDomain;
    xDomain = _;
    return chart;
  };

  chart.yDomain = function(_) {
    if (!arguments.length) return yDomain;
    yDomain = _;
    return chart;
  };

  chart.xRange = function(_) {
    if (!arguments.length) return xRange;
    xRange = _;
    return chart;
  };

  chart.yRange = function(_) {
    if (!arguments.length) return yRange;
    yRange = _;
    return chart;
  };

  chart.forceY = function(_) {
    if (!arguments.length) return forceY;
    forceY = _;
    return chart;
  };

  chart.stacked = function(_) {
    if (!arguments.length) return stacked;
    stacked = _;
    return chart;
  };

  chart.stackOffset = function(_) {
    if (!arguments.length) return stackOffset;
    stackOffset = _;
    return chart;
  };

  chart.clipEdge = function(_) {
    if (!arguments.length) return clipEdge;
    clipEdge = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = nv.utils.getColor(_);
    return chart;
  };

  chart.barColor = function(_) {
    if (!arguments.length) return barColor;
    barColor = nv.utils.getColor(_);
    return chart;
  };

  chart.disabled = function(_) {
    if (!arguments.length) return disabled;
    disabled = _;
    return chart;
  };

  chart.id = function(_) {
    if (!arguments.length) return id;
    id = _;
    return chart;
  };

  chart.hideable = function(_) {
    if (!arguments.length) return hideable;
    hideable = _;
    return chart;
  };

  chart.delay = function(_) {
    if (!arguments.length) return delay;
    delay = _;
    return chart;
  };

  chart.groupSpacing = function(_) {
    if (!arguments.length) return groupSpacing;
    groupSpacing = _;
    return chart;
  };

  //============================================================


  return chart;
}
