angular.module('SunLesson.controllers', [])
   .controller('RootCtrl', function($scope, $location, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo, DataProvider) {
        var rootSandbox = SandboxProvider.getSandbox();
        rootSandbox.initResource(ids, lessonData, lessonUserdata, userInfo);
       $rootScope.isBack = false;
       $location.path('/chapter/' + ids.cid + '/lesson/'+ids.lid+'/activity/'+ids.aid);
    })

    .controller('ActivityCtrl', function($routeParams, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo, DataProvider) {
        var activitySandbox = SandboxProvider.getSandbox();
        activitySandbox.initResource(ids, lessonData, lessonUserdata, userInfo);
        lessonUserdata.current_activity = $routeParams.aid;
    })
