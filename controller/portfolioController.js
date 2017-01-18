(function(angular) {
  'use strict';
angular.module('portfolio', ['ngAnimate']).controller('portfolioController', function($scope) {	
	//used to tell what page we are on
	$scope.showProgramming = false;
	$scope.showMusic = false;
	$scope.swipeFromProgramming = false;
	$scope.swipeFromMusic = false;
	
	$scope.programmingButton = function() {
		$scope.showProgramming = true;
		resetSwipes();
	}
	
	$scope.musicButton = function() {
		$scope.showMusic = true;
		resetSwipes();
	}
	
	$scope.backButton = function(isProgramming) {
		if (isProgramming) {
			$scope.showProgramming = false;
			$scope.swipeFromProgramming = true;
		} else {
			$scope.showMusic = false;
			$scope.swipeFromMusic = true;
		}
	}
	
	$scope.redirectToGitHub = function() {
		window.location = "https://github.com/ntesija";
	}
	
	$scope.redirectToLinkedIn = function() {
		window.location = "https://www.linkedin.com/in/nicholas-tesija";
	}
	
	$scope.mailTo = function() {
		window.location = "mailto:ntesija@gmail.com";
	}
	
	var resetSwipes = function() {
			$scope.swipeFromMusic = false;
			$scope.swipeFromProgramming = false;
	}
	
	//page contents
	$scope.musicDescription = "Here are some of the tracks I've made over the years. Most of these are done in ableton but a few have been made in Guitar Pro 6."
	$scope.programmingDescription = "These are a few of the games that I've helped build over the years."
});
})(window.angular);