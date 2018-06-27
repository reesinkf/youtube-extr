angular.module('youtubeExtr', [])
.controller('mainController', function($scope, $http) {
    $scope.playlistID = {}
    $scope.playlistID.text = 'https://www.youtube.com/watch?v=DkeiKbqa02g&list=PLJtGgr2nbdeNEZsDtjEHBcpHEO3NfBhdj'; // default for testing
    $scope.showLoader = false;

    $scope.extract = function() {
        $scope.showLoader = true;
        $http.get('/api/getlist/' + encodeURIComponent($scope.playlistID.text)).then(function(response) {
            $scope.showLoader = false;
            if (response.data.videos === false) {
                alert('invalid playlist')
            } else {
                $scope.videos = response.data.videos
            }
        });
    }
    
});
