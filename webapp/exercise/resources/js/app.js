angular.module("SunExercise", ['SunExercise.controllers', 'SunExercise.directives',
        'SunExercise.services'])

    .run(function (APIProvider, MaterialProvider, ExerciseService, $rootScope, $q, $location, SandboxProvider) {
        var deferred = $q.defer();
        var initResourcePromise = deferred.promise;

        var appSandbox = SandboxProvider.getSandbox();
        appSandbox.fetchMe(function (err, me) {
            if (err) window.location = "/";
            $rootScope.user = me;
            MaterialProvider.getRoot().then(function (rootMaterial) {
                deferred.resolve("done");
            }, function (data, err) {
                console.log("Error occurred while loading root material: " + err);
                window.location = "/";
            });

            $rootScope.initResourcePromise = initResourcePromise;
            $rootScope.isBack = false;
            $rootScope.shouldReload = true;
            $rootScope.me = me;
            var temp = '';
            var params = {};
            //var pathParams = '';
            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                if (previous) {
                    if (temp == current.templateUrl && $rootScope.isBack) {
                        window.location = "/webapp/exercise";
                        return;
                    }
                    temp = previous.templateUrl;
                    params = previous.pathParams;
                    $rootScope.isBack = true;
                }
            });
        });


    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/root', {
                controller: 'rootCtrl',
                templateUrl: 'resources/partials/subject.html'
            })
            .when('/subject/:sid', {
                controller: 'subjectCtrl',
                templateUrl: 'resources/partials/subject.html'
            })
            .when('/subject/:sid/chapter/:cid', {
                controller: 'chapterCtrl',
                templateUrl: 'resources/partials/chapter.html'
            })
            .when('/subject/:sid/chapter/:cid/lesson/:lid/activity/:aid', {
                controller: 'activityCtrl',
                templateUrl: 'resources/partials/activity.html'
            })
            .when('/achievements', {
                controller: 'achievementsCtrl',
                templateUrl: 'resources/partials/achievements.html'
            })
            .when('/achievements/awards/:aid', {
                controller: 'awardsCtrl',
                templateUrl: 'resources/partials/awards.html'
            })
            .otherwise({redirectTo: '/root'})
    });
//     .config(function ($routeProvider, $httpProvider) {
//                $httpProvider.defaults.headers.common['Access-Token'] = "31c561860fa3f5a4755987a880aaedf6d899b9181c53f4186a4ebcc5a6faf56b";
//            });








