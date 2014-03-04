angular.module('SunLesson', ['SunLesson.services', 'SunLesson.controllers', 'SunLesson.directives'])
    .config(function($routeProvider) { 
         $routeProvider
             .when('/subject/:sid/chapter/:cid/lesson/:lid/activity/:aid', {
                 controller: 'RootCtrl',
                 template: '马上进入课程...初始化所有资源!!!',
                 resolve: {
                    ids: function(ResourceProvider) {
                        return ResourceProvider.getIds();
                    },
                    lessonData: function(ResourceProvider) {
                        return ResourceProvider.getLessonData();
                    },
                    lessonUserdata: function(ResourceProvider) {
                        return ResourceProvider.getLessonUserdata();
                    },
                    userInfo: function(ResourceProvider) {
                        return ResourceProvider.getUserInfo();
                    }
                 }
             })    

             .when('/chapter/:cid/lesson/:lid/activity/:aid', {
                 controller: 'ActivityCtrl',
                 templateUrl: 'resources/partials/activity.html',
                 resolve: {
                    ids: function(ResourceProvider) {
                        return ResourceProvider.getIds();
                    },
                    lessonData: function(ResourceProvider) {
                        return ResourceProvider.getLessonData();
                    },
                    lessonUserdata: function(ResourceProvider) {
                        return ResourceProvider.getLessonUserdata();
                    },
                    userInfo: function(ResourceProvider) {
                        return ResourceProvider.getUserInfo();
                    }
                 }                              
             })       
    })

  .run(function($rootScope, $location) {  
        $rootScope.isBack = false;
        $rootScope.insideBack = false;
        var temp = '';
        $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
            if(previous) {
                //console.log('pAid = '+previous.params.aid + 'cAid='+ current.params.aid);
                if($rootScope.isBack && current.params && (temp == current.params.aid)) {
                    window.location = '/webapp/navigator';
                    return;
                }
                temp = previous.params.aid;
                $rootScope.isBack = true;
            }
        })
    });

