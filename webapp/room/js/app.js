/**
 * Created with JetBrains WebStorm.
 * User: Tony_Zhang
 * Date: 14-1-22
 * Time: 下午2:41
 * To change this template use File | Settings | File Templates.
 */

angular.module('SunRoom', ['SunRoom.controllers', 'SunRoom.directives'])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'showController',
                templateUrl: 'partials/rooms.html'
            })
            .when('/rooms/:rid', {
                controller: 'roomController',
                templateUrl: 'partials/room.html'
            })
            .when('/classify', {
                controller: 'classifyController',
                templateUrl: 'partials/classify.html'
            })
    });

