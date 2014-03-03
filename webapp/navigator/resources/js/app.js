angular.module('SunNavigator', ['SunNavigator.services', 'SunNavigator.controllers', 'SunNavigator.directives'])
    .config(function($routeProvider) {
         $routeProvider
             .when('/', {
                 controller: 'RootCtrl',
                 template: '马上进入提高班!!!',
                 resolve: {
                     me: function(UserdataProvider) {
                     	return UserdataProvider.getMe();
                     },
                     rootMaterial: function(MaterialProvider) {
                     	return MaterialProvider.getRootMaterial();
                     }
                 }
             })            
             .when('/subject/:sid', {
                 controller: 'SubjectCtrl',
                 templateUrl: 'resources/partials/subject.html',
                 resolve: {
                     me: function(UserdataProvider) {
                        return UserdataProvider.getMe();
                     },
                     rootMaterial: function(MaterialProvider) {
                        return MaterialProvider.getRootMaterial();
                     }
                 }
             }).
             when('/subject/:sid/chapter/:cid', {
                controller: 'ChapterCtrl',
                templateUrl: 'resources/partials/chapter.html',
                resolve: {
                     me: function(UserdataProvider) {
                        return UserdataProvider.getMe();
                     },
                     rootMaterial: function(MaterialProvider) {
                        return MaterialProvider.getRootMaterial();
                     },
                    userInfo: function(MaterialProvider) {
                        return MaterialProvider.getUserinfoMaterial();
                    }
                 }
             }).
             when('/achievements', {
                controller: 'achievementsCtrl',
                templateUrl: 'resources/partials/achievements.html',
                resolve: {
                     rootMaterial: function(MaterialProvider) {
                        return MaterialProvider.getRootMaterial();
                     },
                    achievementsMaterial: function(MaterialProvider) {
                        return MaterialProvider.getAchievementsMaterial();
                    },
                    userInfo: function(MaterialProvider) {
                        return MaterialProvider.getUserinfoMaterial();
                    }
                }
             }).
             when('/achievements/awards/:aid', {
                controller: 'awardsCtrl',
                templateUrl: 'resources/partials/awards.html',
                resolve: {
                    achievementsMaterial: function(MaterialProvider) {
                        return MaterialProvider.getAchievementsMaterial();
                    }
                }
             })
    })

  .run(function($rootScope, $location) {      
        $rootScope.isBack = false;
        $rootScope.shouldReload = true;
        var temp = '';
        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
            console.log('Navigator Route Change...');
            if(previous) {
                if(temp == current.templateUrl && $rootScope.isBack) {
                    window.location = '/webapp/navigator';
                    return;
                }
                temp = previous.templateUrl;
                $rootScope.isBack = true;
            }
        })
    });
