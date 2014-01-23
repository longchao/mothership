/**
 * Created with JetBrains WebStorm.
 * User: Tony_Zhang
 * Date: 14-1-22
 * Time: 下午1:36
 * To change this template use File | Settings | File Templates.
 */

angular.module('SunRoom.controllers', [])

    .controller('showController', function ($scope, $http, $location) {
        $http.get("http://localhost:3000/rooms").success(function (data) {
            $scope.rooms = data;
        }).
            error(function (err) {
                console.log(err);
            })

        $scope.enterRoom = function (roomId) {
            $location.path('/rooms/' + roomId);
        }
    })

    .controller('roomController', function ($scope, $routeParams, $http, $q, $location) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var roomId = $routeParams.rid;
        $http.get("http://localhost:3000/rooms/" + roomId).success(function (data) {
            $scope.name = data.name;
            deferred.resolve(data);
        }).error(function (err) {
                console.log(err);
                deferred.reject();
            })

        $scope.users = [];
        $scope.apps = [];
        promise.then(function (data) {
            angular.forEach(data.users, function (userId) {
                $http.get("http://localhost:3000/users/" + userId).success(function (user) {
                    $scope.users.push(user);
                })
            });

            angular.forEach(data.apps, function (appId) {
                $http.get("http://localhost:3000/apps/" + appId).success(function (app) {
                    $scope.apps.push(app);
                })
            });
        }, function () {
            console.log("stopped");
        })

        $scope.addUser = function (username, userId) {
            $http.post("http://localhost:3000/rooms/" + roomId + "/users", {
                userName: username,
                userId: userId
            }).success(function (data) {
                    $scope.users = [];
                    angular.forEach(data.users, function (userId) {
                        $http.get("http://localhost:3000/users/" + userId).success(function (user) {
                            $scope.users.push(user);
                        })
                    });
//                    $http.get("http://localhost:3000/users/" + username).success(function (user) {
//                        $scope.users.push(user);
//                    })
                });
        }

        $scope.deleteUser = function (index, userId) {
            $http.delete("http://localhost:3000/rooms/" + roomId + "/users/" + userId).success(function (data) {
                $scope.users.splice(index, 1);
            })
        }

        $scope.addApp = function (appId) {
            $http.post("http://localhost:3000/rooms/" + roomId + "/apps", {
                appId: appId
            }).success(function (data) {
                    $scope.apps = [];
                    angular.forEach(data.apps, function (appId) {
                        $http.get("http://localhost:3000/apps/" + appId).success(function (app) {
                            $scope.apps.push(app);
                        })
                    });
                });
        }

        $scope.deleteApp = function (index, appId) {
            $http.delete("http://localhost:3000/rooms/" + roomId + "/apps/" + appId).success(function (data) {
                $scope.apps.splice(index, 1);
            })
        }

        $scope.back = function () {
            $location.path('/');
        }
    })

/**
 * assign each student to rooms
 */
    .controller('classifyController', function ($scope, $location, $q, $http) {
        $scope.rooms = [];
        $scope.states = [];

        $scope.getAllRooms = function () {
            $http.get("http://localhost:3000/users").success(function (users) {
                var roomsMap = {};
                var deferredArray = [];
                var promiseArray = [];

                angular.forEach(users, function (user, i) {
                    var schoolName = user.username.substring(0, 2);
                    var fullName = user.username.substring(0, 6);

                    if ((schoolName == "xw" || schoolName == "8z") && (user.username.charAt(2) >= '0' && user.username.charAt(2) <= '9')
                        && (typeof roomsMap[fullName] == "undefined")) {

                        deferredArray[i] = $q.defer();
                        promiseArray[i] = deferredArray[i].promise;

                        roomsMap[fullName] = null;
                        $http.post("http://localhost:3000/rooms", {
                            name: fullName,
                            users: [],
                            apps: []
                        })
                            .success(function (data) {
                                roomsMap[fullName] = data._id;
                                $scope.rooms.push(data);
                                deferredArray[i].resolve();
                            }).error(function (err) {
                                console.log("error: " + err);
                                deferredArray[i].reject();
                                $location.reload();
                            })
                    }
                });

                $q.all(promiseArray).then(function () {
                    angular.forEach(users, function (user) {
                        var schoolName = user.username.substring(0, 2);
                        var fullName = user.username.substring(0, 6);
                        if ((schoolName == "xw" || schoolName == "8z")
                            && (user.username.charAt(2) >= '0' && user.username.charAt(2) <= '9')) {
                            $http.post("http://localhost:3000/rooms/" + roomsMap[fullName] + "/users", {
                                userId: user._id
                            }).success(function (data) {
                                    $scope.states.push(user.username + " has been added to the class.");
                                    console.log(user.username + " has been added to the class.");
                                }).error(function (err) {
                                    $scope.states.push(user.username + " has failed to add to the class. Error: " + err);
                                    console.log(user.username + " has failed to add to the class. Error: " + err);
                                });
                        }
                    })
                })
            })
        }

    })
4