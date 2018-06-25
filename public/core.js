angular.module('youtubeExtr', [])
.controller('mainController', function($scope, $http) {
    $scope.playlistID = {}
    $scope.playlistID.text = 'PLB03EA9545DD188C3';
    $scope.showLoader = false;

    $scope.extract = function() {
        $scope.showLoader = true;
        $http.get('/api/getlist/' + $scope.playlistID.text).then(function(response) {
            $scope.showLoader = false;
            $scope.videos = response.data.videos
        });
    }
    
});
