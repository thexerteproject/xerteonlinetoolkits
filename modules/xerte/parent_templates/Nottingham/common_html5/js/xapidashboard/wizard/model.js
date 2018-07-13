var wrapper = ADL.XAPIWrapper,
	dash = new ADL.XAPIDashboard({}),
	set = ADL.Collection,
	wizardModel;
	
$(document).ready(function(){
	wizardModel = new function(){

		var self = this;
		self.ko = ko;
		
		self.setMainObject = function(obj){
		

			self.mainObject(obj);
			var lrsList = ko.toJS(self.lrsList);
			
			for(var i = 0; i < lrsList.length; i++){
				if(lrsList[i].endpoint == obj().lrs){
					
					wrapper.changeConfig(lrsList[i]);
					break;
				}
			}
			
			//Will need to add a callback here to ensure a graph isn't generated before fetching is complete
			dash.fetchAllStatements({}, function(){
				console.log("Done");
				self.hasData = true;
				self.internalStatement(dash.data.contents[0]);
			});
		};
		
		//functions to handle clicking within modal
		
		self.setModalType = function(type){
			return function(){
				self.currentModalType(type);
				console.log(self.currentModalType());
				
				if(type == "Sample Statement"){
					Prism.highlightElement(document.getElementById("statement-code"), false, function(){

						var statementKeys = $('.token.key, .token.punctuation');
						
						statementKeys.click(function(){
							var saveThis = $(this),
								saveIndex = -1,
								level = 0,
								outStr = saveThis.text();
							
							for(var i = 0; i < statementKeys.length; i++){
								if(this == statementKeys[i]){
									saveIndex = i;
								}
							}
							
							for(var i = saveIndex - 1; i >= 0; i--){
								
								var currStr = $(statementKeys[i]).text();
								if(currStr == "{"){
									if(i > 0 && level >= 0){
										outStr = $(statementKeys[i - 1]).text() + "." +  outStr;
										i--;
									}
									level = level >= 0 ? 0 : level + 1;
								}
								
								else if(currStr == "}"){
									level--;
								}
							}
							
							self.groupBy(outStr);
							$('#myModal').modal('hide');
							
						});
					});
				}
			};
		};
		
		self.modalSaveClick = function(){
			if(self.currentModalType() === "Add LRS" && self.addLRS()){
				$('#myModal').modal('hide');
			}
			else if(self.currentModalType() === "Add Chart" && self.addChart()){
				$('#myModal').modal('hide');
			}
			
			console.log("save click");
		};
		
		self.addChart = function(){
		
			var chartObj = ko.toJS(self.chartAddOpts);
			if(chartObj.title && chartObj.title.length > 0){
				chartObj = ko.observable(chartObj);
				self.chartList.push(chartObj);
				self.setMainObject(chartObj);
				return true;
			}
			
			else return false;
		};	
		
		self.addLRS = function(){
		
			var lrsObj = ko.toJS(self.lrsAddOpts);
			
			if(lrsObj.endpoint && lrsObj.endpoint.length > 0){
				self.lrsList.push(ko.observable(lrsObj));
				return true;
			}
			
			else return false;
		};
		
		//Chart configuration stuff
				
		self.generateChart = function(){
		
			if(self.hasData && self.groupBy() && self.aggregationType() && self.lrsList().length > 0 && self.chartList().length > 0){
				
				dash.createBarChart({
					container: '#graphContainer svg',
					groupBy: self.groupBy(),
					customize: function(chart){
						chart.margin({'bottom': 100}).staggerLabels(false);
						chart.xAxis.rotateLabels(45);
						chart.xAxis.tickFormat(function(d){ return /[^\/]+$/.exec(d)[0]; });
					}
				}).draw();
			}		
		};
		
		self.groupBy = ko.observable('verb.display.en-US');
		self.aggregationType = ko.observable();
		self.groupBy.subscribe(self.generateChart);
		self.aggregationType.subscribe(self.generateChart);
		self.hasData = false;
		
		//Configuration options displayed in modal for adding an lrs or chart
		
		self.lrsAddOpts = {
			endpoint: ko.observable(),
			user: ko.observable(),
			password: ko.observable()
		};	
		
		self.chartAddOpts = {
			title: ko.observable(),
			type: ko.observable(),
			lrs: ko.observable()
		};
		
		//Chart and lrs lists
		
		self.chartList = ko.observableArray();
		self.lrsList = ko.observableArray();
		self.chartList.subscribe(self.generateChart);
		self.lrsList.subscribe(self.generateChart);
		
		//iterates over lrsList, pushes the name of each endpoint to a new array and returns it
		self.getEndpointNames = function(){
			var arr = [];
			for(var i = 0; i < self.lrsList().length; i++){
				arr.push(self.lrsList()[i]().endpoint);
			}
			return arr;
		};
		
		self.currentModalType = ko.observable('');
		self.mainObject = ko.observable();
		
		self.internalStatement = ko.observable();
		self.internalStatement.subscribe(self.generateChart);
		
		self.sampleStatement = ko.computed(function(){
			if(self.internalStatement()){
				return JSON.stringify(self.internalStatement(), null, "    ").replace(/\"([a-zA-z\-]+)\":/gi, "$1:");
			}
			
			else return 'Sample xAPI statement not found';
		});
	
	}();

	console.log(wizardModel);

	ko.applyBindings(wizardModel);
});