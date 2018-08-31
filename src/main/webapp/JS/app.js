/*  
	Query2Report Copyright (C) 2018  Yogesh Deshpande
	
	This file is part of Query2Report.
	
	Query2Report is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Query2Report is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with Query2Report.  If not, see <http://www.gnu.org/licenses/>.
*/

var lwrApp = angular.module('LWR', [ 'ngRoute', 'ui.router', 'ui.bootstrap','ngCookies','ngSanitize','ngMaterial']);

lwrApp.config(function($stateProvider,$urlRouterProvider){
	$stateProvider
	.state('list', {
		url: "/list/:mode",
		templateUrl: "html/reportlist.html",
		params: {
			mode:'public'
		},
		controller: 'ReportListController'
	})
 	.state('openreport',{
	      url: "/openreport/:title?mode&type",
	      templateUrl: "html/openreport.html",
	      params: {
	    	    title: null,
	    	    mode:null,
	    	    type:null
	    	  },
	      controller: 'ReportController'
	})
    .state('alertmgmt', {
		url: '/alertmgmt',
		templateUrl: "html/alertmgmt.html"
    })
    .state('usermgmt', {
		url: '/usermgmt',
		templateUrl: "html/usermgmt.html",
		params: {
			title: null,
			mode:null
		},
		controller: 'UserController'
	})
    .state('drivermgmt', {
		url: '/drivermgmt',
		templateUrl: "html/drivermgmt.html",
		params: {
			title: null,
			mode:null
		},
		controller: 'DriverController'
	})	
	.state('connmgmt', {
		url: '/connmgmt',
		templateUrl: "html/connmgmt.html",
		params: {
		    title: null,
		    mode:null
		},
		controller: 'ConnectionController'
	})
	.state('getstarted', {
			url : '/getstarted',
			templateUrl: "html/getstarted.html",
			params: {
				title: null,
				mode:null
			}			
	})
	.state('example', {
		url: '/example',
		templateUrl: "html/example.html",
		params: {
			title: null,
			mode:null
		}
	})
});


var controllers = {};

controllers.ApplicationController = function($scope,$mdDialog, $cookies,$http,$state){
	$scope.userRole = $cookies.get("username").split("_0_")[2];
	$scope.userName = $cookies.get("username").split("_0_")[0];
	$scope.alerts = [];
	
	
	$http.get('rest/users/'+$scope.userName).then(
			function(response) {
				$scope.user = response.data.users[0];
			}
		);	
	
	$http.get('rest/alerts').then(
			function(response) {
				$scope.alerts = response.data.alerts;
			}
		);	

	$scope.showDialog = function(evt, id) {
        $mdDialog.show({
             targetEvent: evt,
             scope: $scope.$new(),
             clickOutsideToClose: true, 
             templateUrl: id
        });
   }
	
	$state.go('list','')
}

/************************************************** User Controller ********************************************************/
controllers.UserController = function($scope, $http,$mdDialog) {
	var menus = $(".sidemenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-left":"5px solid #f1f1f1"});
	}
	menus = $(".topmenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-bottom":"0px solid orange"});
	}
	$("#usermgmt").css({"border-bottom":"5px solid orange"});
	$scope.modifiedUser={};
	$http.get('rest/users').then(function(response) {
		$scope.users = response.data.users;
	});
	
	$scope.isAddUser=false;

    $scope.editUser = function(ev,id,user,mode) {
    	$scope.isAddUser=mode;
    	if(user && !mode){
        	$scope.modifiedUser={};
        	$scope.modifiedUser.username=user.username;
        	$scope.modifiedUser.displayName=user.displayName;
        	$scope.modifiedUser.chartType=user.chartType;
        	$scope.modifiedUser.role=user.role;
        	$scope.modifiedUser.sessionTimeout=user.sessionTimeout;
    	}else{
    		$scope.modifiedUser={};
    	}
        $mdDialog.show({
            targetEvent: ev,
            locals:{param: user},
            clickOutsideToClose: true, 
            scope: $scope.$new(),
            templateUrl: id
       }).then(function() {
       }, function() {
       });
    };

	$scope.addUser = function() {
		var user = {
			username : $scope.modifiedUser.username,
			displayName : $scope.modifiedUser.displayName,
			password : $scope.modifiedUser.newpassword,
			chartType : $scope.modifiedUser.chartType,
			role : $scope.modifiedUser.role,
			sessionTimeout : $scope.modifiedUser.sessionTimeout
		};
		var request = $.ajax({
			url : "rest/users/save",
			type : "PUT",
			data : JSON.stringify(user),
			dataType : "json",
			contentType : "application/json",
			success : function(resp) {
				var found = false;
				for (index = 0; index < $scope.users.length; index++) {
					if ($scope.users[index].username == user.username) {
						found = true;
						$scope.users.splice(index, 1);
						$scope.users.splice(index, 0, user);
						break;
					}
				}
				;
				if (!found) {
					$scope.users.push(user);
				}
				
				$mdDialog.show(
   				      $mdDialog.alert()
   				        .clickOutsideToClose(true)
   				        .title('Save of user \''+user.username+'\'  Succeeded')
   				        .ok('Ok')
   				    );
			},
			error : function(e) {
				 $mdDialog.show(
   				      $mdDialog.alert()
   				        .clickOutsideToClose(true)
   				        .title('Save of user \''+user.username+'\'  Failed')
   				        .textContent("Response = "+e.responseText+". Status = "+e.status)
   				        .ok('Ok')
   				    );
			}
		});
	};

	$scope.removeUser = function(modifiedUser) {
		var confirm = $mdDialog.confirm()
					.title('Delete User Confirmation')
					.textContent('Do you really want to delete?')
					.ariaLabel('Lucky day')
					.ok('Ok')
					.cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			var request = $.ajax({
				url : "rest/users/" + modifiedUser.username+"/remove",
				type : "DELETE",
				success : function(resp) {
					var index = $scope.users.findIndex(function(user, i) {
						return user.username === modifiedUser.username;
					});
					$scope.users.splice(index, 1);				
	  				 $mdDialog.show(
	  	   				      $mdDialog.alert()
	  	   				        .clickOutsideToClose(true)
	  	   				        .title('Delete of user \''+modifiedUser.username+'\'  Succeeded')
	  	   				        .ok('Ok')
	  	   				    );    				
				},
				error : function(e) {
	  				 $mdDialog.show(
	  	   				      $mdDialog.alert()
	  	   				        .clickOutsideToClose(true)
	  	   				        .title('Delete of user \''+modifiedUser.username+'\'  Failed')
	  	   				        .textContent("Response = "+e.responseText+". Status = "+e.status)
	  	   				        .ok('Ok')
	  	   				    );    				
				}
			});
		});
	};
};

/************************************************** Connection Controller ********************************************************/
controllers.DriverController = function($scope, $http, $q,$mdDialog) {
	var menus = $(".sidemenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-left":"5px solid #f1f1f1"});
	}
	
	menus = $(".topmenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-bottom":"0px solid orange"});
	}
	$("#drivermgmt").css({"border-bottom":"5px solid orange"});
	$scope.modifiedDriver={};
	$http.get('rest/drivers').then(
			function(response) {
				$scope.drivers = response.data.drivers;
			});
	
	
	$scope.isAddDriver=false;
	
	$scope.editDriver = function(ev,id,driver,mode) {
		$scope.isAddDriver=mode;
		if(driver){
			$scope.modifiedDriver=driver;
		}else{
			$scope.modifiedDriver={};
		}
        $mdDialog.show({
            targetEvent: ev,
            locals:{param: driver},
            clickOutsideToClose: true, 
            scope: $scope.$new(),
            templateUrl: id
       }).then(function(modifiedDriver) {
       }, function() {
       });
    };
    
	$scope.addDriver = function() {
        var file = $scope.jarFile;
        var uploadUrl = "rest/drivers/save";
        var fd = new FormData();
        fd.append('jarFile', file);
        fd.append('className',$scope.modifiedDriver.className);
        fd.append('alias',$scope.modifiedDriver.alias);
        
		$http.post(uploadUrl, fd, {
		   transformRequest: angular.identity,
		   headers: {'Content-Type': undefined}
		})
		.success(function(){
			var found = false;
			if(file){
				$scope.modifiedDriver.jarFile=file.name;
			}
			for (index = 0; index < $scope.drivers.length; index++) {
				if ($scope.drivers[index].alias == $scope.modifiedDriver.alias) {
					found = true;
					$scope.drivers.splice(index, 1);
					$scope.drivers.splice(index, 0, $scope.modifiedDriver);
					break;
				}
			}
			;
			if (!found) {
				$scope.drivers.push($scope.modifiedDriver);
			}			
			$mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('JDBC Driver \''+$scope.modifiedDriver.alias+'\'  upload Succeeded. Restart the application server.')
					        .ok('Ok')
					    );  
		})
		.error(function(e){
			 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('JDBC Driver \''+$scope.modifiedDriver.alias+'\' Save Unsuccessful.')
					        .textContent("Response = "+e.responseText+". Status = "+e.status)
					        .ok('Ok')
					    );  
		});
	}
	
	$scope.removeDriver = function(modifiedDriver) {
		var confirm = $mdDialog.confirm()
		.title('Delete Driver Confirmation')
		.textContent('Do you really want to delete?')
		.ariaLabel('Lucky day')
		.ok('Ok')
		.cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			var request = $.ajax({
				url : "rest/drivers/" + modifiedDriver.alias+"/remove",
				type : "DELETE",
				success : function(resp) {
					var index = $scope.drivers.findIndex(function(driver, i) {
						return driver.alias === modifiedDriver.alias;
					});
					$scope.drivers.splice(index, 1);				
	  				 $mdDialog.show(
	  	   				      $mdDialog.alert()
	  	   				        .clickOutsideToClose(true)
	  	   				        .title('Delete of user \''+modifiedDriver.alias+'\'  Succeeded')
	  	   				        .ok('Ok')
	  	   				    );    				
				},
				error : function(e) {
	  				 $mdDialog.show(
	  	   				      $mdDialog.alert()
	  	   				        .clickOutsideToClose(true)
	  	   				        .title('Delete of user \''+modifiedDriver.alias+'\'  Failed')
	  	   				        .textContent("Response = "+e.responseText+". Status = "+e.status)
	  	   				        .ok('Ok')
	  	   				    );    				
				}
			});
		});
	};	
}


/************************************************** Connection Controller ********************************************************/
controllers.ConnectionController = function($scope, $http, $q,$mdDialog) {
	var menus = $(".sidemenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-left":"5px solid #f1f1f1"});
	}	
	
	menus = $(".topmenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-bottom":"0px solid orange"});
	}
	$("#connmgmt").css({"border-bottom":"5px solid orange"});
	$scope.modifiedConnection={};
	$http.get('rest/connections').then(
			function(response) {
				$scope.connections = response.data.connections;
			});

	$http.get('rest/drivers').then(
			function(response) {
				$scope.drivers = response.data.drivers;
			});
	
	$scope.isAddConnection=false;
	
    $scope.editConnection = function(ev,id,connection,mode) {
    	$scope.isAddConnection=mode;
    	if(connection){
    		$scope.modifiedConnection={};
    		$scope.modifiedConnection.alias=connection.alias;
    		$scope.modifiedConnection.username=connection.username;
    		$scope.modifiedConnection.password=connection.password;
    		$scope.modifiedConnection.driver=connection.driver;
    		$scope.modifiedConnection.isDefault=connection.isDefault;
    		$scope.modifiedConnection.url=connection.url;
    		for (index = 0; index < $scope.drivers.length; index++) {
    			if ($scope.drivers[index].alias == connection.driver) {
    				$scope.selectedDriver=$scope.drivers[index];
    			}
    		}
    	}else{
    		$scope.modifiedConnection={};
    	}
        $mdDialog.show({
            targetEvent: ev,
            locals:{param: connection},
            clickOutsideToClose: true, 
            scope: $scope.$new(),
            templateUrl: id
       }).then(function(modifiedConnection) {
       }, function() {
       });
    };

	$scope.addConnection = function() {
		var connection = {
			alias : $scope.modifiedConnection.alias,
			username : $scope.modifiedConnection.username,
			password : $scope.modifiedConnection.newpassword,
			driver : $scope.selectedDriver.alias,
			isDefault : $scope.modifiedConnection.isDefault,
			url : $scope.modifiedConnection.url
		};
		var request = $.ajax({
			url : "rest/connections/save",
			type : "PUT",
			data : JSON.stringify(connection),
			dataType : "json",
			contentType : "application/json",
			success : function(resp) {
				var found = false;
				for (index = 0; index < $scope.connections.length; index++) {
					if ($scope.connections[index].alias == connection.alias) {
						found = true;
						$scope.connections.splice(index, 1);
						$scope.connections.splice(index, 0, connection);
						break;
					}
				}
				;
				if (!found) {
					$scope.connections.push(connection);
				}
				 $mdDialog.show(
				      $mdDialog.alert()
				        .clickOutsideToClose(true)
				        .title('Save of alias \''+connection.alias+'\'  Succeeded')
				        .ok('Ok')
				    );
			},
			error : function(e) {
				 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('Save of alias \''+connection.alias+'\'  Failed')
					        .textContent("Response = "+e.responseText+". Status = "+e.status)
					        .ok('Ok')
					    );
			}
		});
	};

	$scope.removeConnection = function(modifiedConnection) {
		var confirm = $mdDialog.confirm()
		.title('Delete Connection Confirmation')
		.textContent('Do you really want to delete?')
		.ariaLabel('Lucky day')
		.ok('Ok')
		.cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			var request = $.ajax({
				url : "rest/connections/" + modifiedConnection.alias+"/remove",
				type : "DELETE",
				success : function(resp) {
					var index = $scope.connections.findIndex(function(connection, i) {
						return connection.alias === modifiedConnection.alias;
					});
					$scope.connections.splice(index, 1);
					
					 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('Delete of alias \''+modifiedConnection.alias+'\'  Succeeded')
					        .ok('Ok')
					    );    				
				},
				error : function(e) {
					 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('Delete of alias \''+modifiedConnection.alias+'\'  Failed')
					        .textContent("Response = "+e.responseText+". Status = "+e.status)
					        .ok('Ok')
					    );    				
				}
			});
		});
	};

	$scope.testConnection = function(modifiedConnection) {
		var connection = {
			alias : modifiedConnection.alias,
			username : modifiedConnection.username,
			password : modifiedConnection.password,
			driver : modifiedConnection.driver,
			isDefault : modifiedConnection.isDefault,
			url : modifiedConnection.url
		};
		var request = $.ajax({
			url : "rest/connections/test",
			type : "POST",
			data : JSON.stringify(connection),
			dataType : "json",
			contentType : "application/json",
			success : function(resp) {
				 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('Connection to alias \''+connection.alias+'\'  Succeeded')
					        .ok('Ok')
					    );
			},
			error : function(e, status, error) {
				 $mdDialog.show(
					      $mdDialog.alert()
					        .clickOutsideToClose(true)
					        .title('Connection to alias \''+connection.alias+'\'  Failed')
					        .textContent("Response = "+e.responseText+". Status = "+e.status)
					        .ok('Ok')
					    );
			}
		});
	};
};

/************************************************** ReportList Controller ********************************************************/
controllers.ReportListController = function($scope,$cookies,$stateParams, $http,$q,$mdDialog) {
	var userName = $cookies.get("username").split("_0_")[0];
	$scope.userRole = $cookies.get("username").split("_0_")[2];
	var mode = $stateParams.mode;

	var menus = $(".topmenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-bottom":"5px solid #101010"});
	}
	var menus = $(".sidemenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-left":"5px solid #f1f1f1"});
	}
	
	if(mode=='public'){
		userName='public';
		$scope.reportMode = 'public';
		$("#publicmgmt").css({"border-left":"5px solid blue"});
	}else{
		$scope.reportMode = 'personal';
		$("#personalmgmt").css({"border-left":"5px solid blue"});
	}
	$http.get('rest/reports/personal/'+userName).then(function(response) {
		$scope.reports = response.data.reports;
	});

	$scope.deleteReports = function(){
		var confirm = $mdDialog.confirm()
		.title('Delete Report Confirmation')
		.textContent('Do you really want to delete?')
		.ariaLabel('Lucky day')
		.ok('Ok')
		.cancel('Cancel');
		$mdDialog.show(confirm).then(function() {
			for (index = 0; index < $scope.reports.length; index++) {
				if ($scope.reports[index].isDeleted == true) {
					var reportTitle = $scope.reports[index].title;
					var getReport = function(){
						var deferred = $q.defer();
						$http.delete('rest/reports/'+userName+'/'+reportTitle+'/delete').then(function(response) {
							deferred.resolve(response);
						});
						return deferred.promise;
					};
					var promise=getReport();
					promise.then(function(response){
						if(response.status == 200){
							var reportIndex=0;
							 $mdDialog.show(
								      $mdDialog.alert()
								        .clickOutsideToClose(true)
								        .title('Deletion of report \''+response.data+'\'  Succeeded')
								        .ok('Ok')
								    );
							for (reportIndex = 0; reportIndex < $scope.reports.length; reportIndex++) {
								if ($scope.reports[reportIndex].title==response.data){
									$scope.reports.splice(reportIndex, 1);		
								}
							}
						}else{
							 $mdDialog.show(
								      $mdDialog.alert()
								        .clickOutsideToClose(true)
								        .title('Deletion of report \''+status.title+'\'  failed')
								        .ok('Ok')
								    );
						}
					});
				}
			}
		});
	}
};

/************************************************** Report Controller ********************************************************/
controllers.ReportController = function($scope,$interval,$q,$stateParams,$cookies,$http, $compile,$mdDialog){
	var userName = $cookies.get("username").split("_0_")[0];
	$scope.userRole = $cookies.get("username").split("_0_")[2];
	$scope.userName=userName;

	var menus = $(".topmenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-bottom":"5px solid #101010"});
	}
	var menus = $(".sidemenu");
	for(var index = 0; index < menus.length;index++ ){
		$("#"+menus[index].id).css({"border-left":"5px solid #f1f1f1"});
	}

	if($stateParams.mode=='public'){
		$("#publicmgmt").css({"border-left":"5px solid blue"});
	}else if($stateParams.mode=='personal'){
		$("#personalmgmt").css({"border-left":"5px solid blue"});
	}

	var getConnections = function(){
		var deferred = $q.defer();
		$http.get('rest/connections').then(function(response){
			deferred.resolve(response.data.connections);
		});
		return deferred.promise;
	}
	var promise=getConnections();
	$scope.aliases=["default"];
	promise.then(function(connections){
		for(connection of connections)
			$scope.aliases.push(connection.alias);
	});
	
	if($stateParams.type=='editreport'){
		$scope.reportOpenType='editreport';
	}else if($stateParams.type=='openreport'){
		$scope.reportOpenType='openreport';
	}else if($stateParams.type=='newreport'){
		$("#newreportmgmt").css({"border-left":"5px solid blue"});
		$scope.reportOpenType='editreport';
	}
	
	if($stateParams.title != null && $stateParams.mode != null){
		$scope.title=$stateParams.title;
		$scope.reportMode=$stateParams.mode;
		var getReport = function(){
			var deferred = $q.defer();
			if($stateParams.mode=='public'){
				$http.get('rest/reports/public/'+$scope.title).then(function(response) {
					deferred.resolve(response.data.reports);
				});
			}else{
				$http.get('rest/reports/'+userName+'/'+$scope.title).then(function(response) {
					deferred.resolve(response.data.reports);
				});
			}
			return deferred.promise;
		};
		var promise=getReport();
		promise.then(function(reports){
			$scope.reports=reports;
			if(reports[0]){
				$scope.reportParams = reports[0].params;
				if($scope.reportParams && $scope.reportParams.length>0){
					$mdDialog.show({
						locals:{param: $scope.reportParams},
						clickOutsideToClose: false, 
						scope: $scope.$new(),
						templateUrl: 'html/params_dialog.html'
					}).then(function(reportParams) {
					}, function() {
					});
				}
			}
		});
	}else{
		$scope.reports = [];
		var report = {
			title : "",
			description : "",
			rows : [{
					elements:[{
						title:"",
						query:"",
						chartType:"",
						dbalias:"default",
						refreshInterval:"-1"
					}]
				}
			]
		};
		$scope.reports.push(report);
	}
	
	$scope.applyParams = function() {
		$mdDialog.hide();
		
		for(var paramIndex=0;paramIndex<$scope.reportParams.length;paramIndex++){
			if( $scope.reportParams[paramIndex].dataType=='date' ){
				var d = new Date($scope.reportParams[paramIndex].value);
				var mm = d.getMonth()+1;
				var dd = d.getDate();
				var yy = d.getFullYear();
				if(mm<10)
					mm="0"+mm;
				if(dd<10)
					dd="0"+dd;
				var formattedDate = mm+"/"+dd+"/"+yy+" 00:00:00";
				$scope.reportParams[paramIndex].value=formattedDate;
			}else if( $scope.reportParams[paramIndex].dataType=='datetime' ){
				var d = new Date($scope.reportParams[paramIndex].value);
				var mm = d.getMonth()+1;
				var dd = d.getDate();
				var yy = d.getFullYear();
				var hh = d.getHours();
				var mi = d.getMinutes();
				var ss = d.getSeconds();
				if(mm<10)
					mm="0"+mm;
				if(dd<10)
					dd="0"+dd;
				if(hh<10)
					hh="0"+hh;
				if(mi<10)
					mi="0"+mi;
				if(ss<10)
					ss="0"+ss;
				var formattedDate = mm+"/"+dd+"/"+yy+" "+hh+":"+mi+":"+ss;
				$scope.reportParams[paramIndex].value=formattedDate;
			}
		}
		
		var rows = $scope.reports[0].rows;
		var params = [];
		for(var index=0;index<rows.length;index++){
			var cols = rows[index];
			for(var colIndex = 0; colIndex<cols.elements.length;colIndex++){
				var col = cols.elements[colIndex];
				col.params = $scope.reportParams;
				col.paramsApplied=true;
				$scope.loadElement(col,col.chartType);
			}
		}
	}
	
	var intervalPromises = [];
	var ind = 0;
	
	$scope.export=function(type){
		if(type=='PDF'){
			var element = document.getElementById("root");
			html2canvas(element).then(function(canvas) {
				var imgData = canvas.toDataURL('image/png');
				var doc = new jsPDF('landscape','in','A2');
				doc.addImage(imgData, 'PNG', 1, 1);
				doc.save('sample-file.pdf');
			});
		}
	}
	
	$scope.loadElement = function(element,chartType){
		if(element.title && element.query && ( !element.hasParams || element.paramsApplied ) ){
			loadData(element,chartType);
			if(element.refreshInterval > 0){
				setInterval(function() {
					loadData(element,chartType);
				},element.refreshInterval*1000);
			}
		}
	};
	
	function loadData(element,chartType){
		var id = element.title+"_cell";
		var request = $.ajax({
			url: "rest/reports/element/query",
			type: "POST",
			dataType:"json",
			contentType: 'application/json',
			data: JSON.stringify(element),
				success: function(data) {
					if(element.chartType){
						drawChart(data,id,chartType,element.title);
					}else{
						drawChart(data,id,chartType,element.title);
					}
				},
				error: function(e,status,error){
					document.getElementById(id).innerHTML = "Response = "+e.responseText+". Error = "+error+". Status = "+e.status;
				}
		});
	}

	$scope.$on('$destroy', function() {
		for(i = 0;i<intervalPromises.length;i++){
			var intervalPromise = intervalPromises[i];
			$interval.cancel(intervalPromise);
		}
	});
	
	$scope.addColumn=function(rowId){
		var index = $scope.reports[0].rows[rowId].elements.length;
		var element = {
				title:"Untitled "+rowId+index,
				query:"",
				chartType:"",
				dbalias:"default"
		};
		$scope.reports[0].rows[rowId].elements.push(element);
		editElement(element);
	};
	
	$scope.addRow=function(){
		var rowId = $scope.reports[0].rows.length;
		var row={
				elements:[{
					title:"Untitled "+rowId+"0",
					query:"",
					chartType:"",
					dbalias:"default"
			}]
		};
		$scope.reports[0].rows.push(row);
	};
	
	
	$scope.deleteColumn=function(rowId,colId){
		$scope.reports[0].rows[rowId].elements.splice(colId,1);
		if($scope.reports[0].rows[rowId].elements.length==0){
			$scope.reports[0].rows.splice(rowId,1);
		}
	};

	$scope.deleteLastRow=function(){
		$scope.reports[0].rows.splice(-1,1);
	}
	
	$scope.formatNumber = function(i) {
	    return Math.floor(i); 
	}
	
	$scope.save=function(mode){
		var uName = $cookies.get("username").split("_0_")[0];
		var rName = $scope.reports[0].title;
		$scope.reports[0].aurthor=uName;
		var rows = $scope.reports[0].rows;
		var params = [];
		var linkedParams = [];
		for(var index=0;index<rows.length;index++){
			var cols = rows[index];
			for(var colIndex = 0; colIndex<cols.elements.length;colIndex++){
				var col = cols.elements[colIndex];
				
				// Parse Report Parameters
				var patterns = col.query.match(/[^{}]+(?=\})/g);
				if(patterns){
					col.hasParams=true;
					for(var i = 0; i<patterns.length;i++){
						var param = {};
						var subPatterns = patterns[i].split(':');
						if(subPatterns.length==2){
							param.name=subPatterns[1];
							param.dataType=subPatterns[0];
						}else{
							param.name=patterns[i];
							param.dataType='string';
						}
						param.value='';
						found=false;
						for( var j = 0;j<params.length;j++){
							if(params[j].name == param.name && params[j].dataType==param.dataType)
								found=true;
						}
						if(!found)
							params.push(param);
					}
				}else{
					col.hasParams=false;
				}
				
				// Parse Element Dependency
				var linkedPatterns = col.query.match(/[^\[\]]+(?=\[)/g);
				if(linkedPatterns){
					col.hasDependency=true;
					for(var i = 0; i<linkedPatterns.length;i++){
						var linkedParam = {};
						var sublinkedPatterns = linkedPatterns[i].split(':');
						if(sublinkedPatterns.length==2){
							linkedParam.elementName=sublinkedPatterns[1];
							linkedParam.attributeName=sublinkedPatterns[0];
						}
						found=false;
						for( var j = 0;j<linkedParams.length;j++){
							if(linkedParams[j].elementName == linkedParam.elementName && linkedParams[j].attributeName==linkedParam.attributeName)
								found=true;
						}
						if(!found)
							params.push(param);
							linkedParams.push(linkedParam);
					}
				}else{
					col.hasDependency=false;
				}				
			}
		}
		$scope.reports[0].params = params;
		$scope.reports[0].dependencies = linkedParams;
		if(mode=='public'){
			uName = 'public';
		}
		var request = $.ajax({
			url: "rest/reports/"+uName+"/"+rName+"/save",
			type : "POST",
			data : JSON.stringify($scope.reports),
			contentType : "application/json",
			success : function(resp) {
				$mdDialog.show(
	   				      $mdDialog.alert()
	   				        .clickOutsideToClose(true)
	   				        .title('Save of report \''+rName+'\'  Succeeded')
	   				        .ok('Ok')
	   				    );
			},
			error : function(e) {
				$mdDialog.show(
	   				      $mdDialog.alert()
	   				        .clickOutsideToClose(true)
	   				        .title('Save of report \''+rName+'\'  failed')
	   				        .ok('Ok')
	   				    );
			}
		});
	};

    $scope.editElement = function(ev,id,element) {
        $mdDialog.show({
            targetEvent: ev,
            locals:{param: element,param2: $scope.aliases},
            clickOutsideToClose: true, 
            scope: $scope.$new(),
            controller:EditElementController,
            templateUrl: id
       }).then(function(modElement) {
    	   element.title=modElement.title;
    	   element.query=modElement.query;
    	   element.chartType=modElement.chartType;
    	   element.refreshInterval=modElement.refreshInterval;
    	   element.dbalias=modElement.dbalias;
    	   $scope.loadElement(element,element.chartType);
       }, function() {
       });
    };

    var EditElementController = function ($scope, param, param2, $mdDialog) {
    	$scope.modElement={};
    	$scope.modElement.title = param.title;
    	$scope.modElement.query = param.query;
    	$scope.modElement.chartType = param.chartType;
    	$scope.modElement.refreshInterval = param.refreshInterval;
    	$scope.modElement.dbalias = param.dbalias;
    	$scope.modElement.hasParams = param.hasParams;
    	$scope.modElement.paramsApplied = param.paramsApplied;
    	$scope.aliases = param2;

    	$scope.saveElement = function(){
	    	$mdDialog.hide($scope.modElement);
	    }
	    
	    
		$scope.refreshElement = function(){
			if(!$scope.modElement.query) {
				return;
			}
			
			if($scope.modElement.hasParams && !$scope.modElement.paramsApplied){
				return;
			}
			$scope.tabledata=false;
			$scope.chartdata=false;
			var request = $.ajax({
				url: "rest/reports/element/query",
				type: "POST",
				dataType:"json",
				contentType: 'application/json',
				data: JSON.stringify($scope.modElement),
				success: function(data) {
						drawChart(data,'chartdata',$scope.modElement.chartType,$scope.modElement.title);
						$scope.chartdata=false;
						drawChart(data,'tabledata','table',$scope.modElement.title);
						$scope.tabledata=false;
					},
				error: function(e,status,error){
						document.getElementById('tabledata').innerHTML = "Response = "+e.responseText+". Error = "+error+". Status = "+e.status;
					}
			});
		};
	} 

    $scope.cancel = function(){
    	$mdDialog.hide();
    }
    
    $scope.editTitle = function(ev,id,report) {
        $mdDialog.show({
            targetEvent: ev,
            locals:{param: report},
            clickOutsideToClose: true, 
            scope: $scope.$new(),
            controller:EditReportController,
            templateUrl: id
       }).then(function(modRep) {
    	   $scope.reports[0].title=modRep.title;
    	   $scope.reports[0].description=modRep.description;
       }, function() {
       });
    };
    
    var EditReportController = function ($scope, param, $mdDialog) {
    	$scope.modRep={};
    	$scope.modRep.title = param.title;
    	$scope.modRep.description = param.description;
	    $scope.saveEdit = function(){
	    	$mdDialog.hide($scope.modRep);
	    }
	}  
}
lwrApp.controller(controllers);

lwrApp.directive('fileModel', ['$parse', function ($parse) {
return {
   restrict: 'A',
   link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope.$parent, element[0].files[0]);
             });
          });
       }
    };
}]);

lwrApp.directive('loading', function () {
	return {
		restrict: 'E',
		replace:true,
		template: '<div><img style="display:block;margin-left:auto;margin-right:auto;padding-top:10%" src="images/loading.gif"/></div>',
		link: function (scope, element, attr) {
		scope.$watch(attr.id, function (val) {
			$(element).show();
		});
		}
	}
})