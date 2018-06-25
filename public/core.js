angular.module('youtubeExtr', [])
.controller('mainController', function($scope, $http) {
    $scope.playlistID = {}
    $scope.showLoader = false;

    $scope.extract(function() {
        alert('hello?');
        $scope.showLoader = true;
        $http.get('/api/getlist/PLB03EA9545DD188C3').then(function(response) {
            $scope.showLoader = false;
            console.log(response.data.videos)
            $scope.videos = response.data.videos
        });
    });
    
});
