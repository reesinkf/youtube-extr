angular.module('youtubeExtr', [])
.controller('mainController', function($scope, $http) {

    $http.get('/api/getplaylist/PLB03EA9545DD188C3')
        .then(function(response) {
        console.log(response.data)
        $scope.videos = response.data;
    });

                /*

    $scope.extract(function() {
        alert('hello?');
        $scope.get = function(playlistID) {
            $http.get('/api/getplaylist/' + playlistID)
                .success(function(data) {
                    $scope.videos = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };
    });
    */
})
