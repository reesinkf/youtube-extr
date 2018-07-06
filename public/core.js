angular.module('youtubeExtr', [])
.controller('mainController', function($scope, $http) {
    $scope.playlistID = {}
    $scope.playlistID.text = 'https://www.youtube.com/watch?v=hVNrkXM3TTI&list=PLA220BA20D4D3DE46'; //  playlist with vids with captions for testing
    $scope.showLoader = false;

    $scope.extract = function() {
        $scope.showLoader = true;
        $http.get('/api/getlist/' + encodeURIComponent($scope.playlistID.text)).then(function(res) {
                $scope.showLoader = false;
                if (res.data.videos === false) {
                    // nice error msg here
                    alert('invalid playlist entered')
                } else {
                    $scope.videos = res.data.videos
                }
        }).catch(function(err) {
            $scope.showLoader = false;
            console.log(err)  
        })
    }
    
});
