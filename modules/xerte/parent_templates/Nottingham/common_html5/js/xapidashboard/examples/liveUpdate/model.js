var app = angular.module('xAPIGame', []);


/****************************************
 * Fetch data from the LRS every so often
 * and add to list of statements
 ****************************************/

app.service('lrsData', ['$rootScope','$http','$interval', function($rootScope,$http,$interval)
{
	var self = this;
	$rootScope.lrsData = [];

	var interval = 30;
	var intervalPromise = $interval(freshenData, interval * 1000);
	
	self.lastUpdate = new Date();
	self.lastUpdate = new Date(self.lastUpdate.getFullYear(), self.lastUpdate.getMonth(), self.lastUpdate.getDate() - 30);

	freshenData();
	
	function freshenData()
	{
		function success(data,status,headers,config)
		{
			var coreData = (new ADL.CollectionSync(data.statements)).contents;
			$rootScope.lrsData.push.apply($rootScope.lrsData, coreData);

			if(data.statements.length > 0){
				var currentDate = new Date(data.statements[0].stored);
				if(currentDate > self.lastUpdate)
					self.lastUpdate.setTime(currentDate.getTime()+1);
			}

			if(data.more){
				$http({
					'method': 'GET',
					'url': 'https://lrs.adlnet.gov'+data.more,
					'headers': { 'X-Experience-API-Version': '1.0.1', 'Authorization':  'Basic dG9tOjEyMzQ='}
				})
				.success(success).error(failure);
			}
		}

		function failure(data,status,headers,config){
			console.error(data);
			$interval.cancel(intervalPromise);
		}

		$http({
			'method':'GET',
			'url': 'https://lrs.adlnet.gov/xAPI/statements',
			'headers': { 'X-Experience-API-Version': '1.0.1', 'Authorization':  'Basic dG9tOjEyMzQ=' },
			'params': {
				'since': self.lastUpdate.toISOString()
			}
		})
		.success(success).error(failure);
	}

}]);


app.controller('MenuCtrl', ['$scope','lrsData', function($scope)
{
	$scope.activePlayer = {value: null};
	$scope.activeWorld = {value: null};

	$scope.players = [];
	$scope.worlds = [];
}]);


/*****************************************************
 * Build lists from raw data
 *****************************************************/

app.controller('ListsCtrl', ['$scope','$filter','lrsData', function($scope,$filter)
{
	$scope.lists = [

		// add the trap count list
		{
			'name': 'Is anyone there?',
			'quality': 'statement',
			'description': 'Most recent actors over the past 30 days',
			'caveat': '(actors with actor.name only)',
			'specificity': function(){ return true || !$scope.activePlayer.value; },
			'processor': function(data, activePlayer, activeWorld){
				var filter = '';
				return data
					.where('actor.name != null')
					.groupBy('actor.name')
					.orderBy('data.0.timestamp', 'desc')
					.count()
					.select('group as name, count as value, data.0.timestamp as date');
			}
		},
		// add the trap count list
		{
			'name': 'What happened?',
			'quality': 'statement',
			'description': 'Most recent verbs over the past 30 days',
			'caveat': ' ',
			'specificity': function(){ return true || !$scope.activePlayer.value; },
			'processor': function(data, activePlayer, activeWorld){
				var filter = '';
				return data
					.groupBy('verb.display.en-US')
					.orderBy('data.0.timestamp', 'desc')
					.count()
					.select('group as name, count as value, data.0.timestamp as date');
			}
		}
	];

	// update collection with new statements from LRS
	$scope.stmts = new ADL.CollectionSync();
	$scope.$watchCollection('lrsData', function(newVal,oldVal)
	{
		if(newVal && oldVal)
			$scope.stmts.append( newVal.slice(oldVal.length) );
		else
			console.log('oldVal', oldVal, 'newVal', newVal);
	});

	// update lists on new data or filter changes
	$scope.$watchGroup(['stmts.contents','activePlayer.value','activeWorld.value'], function(newVal,oldVal)
	{
		for(var i=0; i<$scope.lists.length; i++)
		{
			var list = $scope.lists[i];
			var tmp = $scope.stmts.save();
			tmp = list.processor.call(list, tmp, $scope.activePlayer.value, $scope.activeWorld.value);
			tmp.where('value != 0').exec(function(data){
				list.items = data;
			});
		}
	});


}]);


