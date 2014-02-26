angular.module('SunLesson.controllers', [])
   .controller('RootCtrl', function($scope, $location, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo, DataProvider) {
        (function initLessonData() {
            DataProvider.lessonData = lessonData;
        })();

       (function initLessonUserdata() {
//console.log('get lessonuserData from server: '+ angular.toJson(lessonUserdata));        
            if(!lessonUserdata || !lessonUserdata.summary) {
            //alert('initLessonUserdata-=-=-=-=-==-=-=-');          
                lessonUserdata = {
                    is_complete : false,
                    activities: {},
                    summary: {badges:[]}
                };

                for(var i=0;i<lessonData.activities.length;i++) {   
                    var activityItem = lessonData.activities[i];            
                    if(activityItem.type == 'quiz') { 
                        lessonUserdata.activities[activityItem.id]= {
                            is_complete: false,
                            problems: {},
                            summary: {}
                        };

                        if(activityItem.pool_count) {    
                            lessonUserdata.activities[activityItem.id].seed = [];
                        }
                    } else {
                        lessonUserdata.activities[activityItem.id] = {
                            is_complete: false,   
                            summary: {}
                        };
                    }
                }
            }
            DataProvider.lessonUserdata = lessonUserdata;
       })();

       (function initUserInfo() {
            if(!userInfo.achievements) {
                userInfo = {
                    achievements: {
                        badges: {},
                        awards: {}
                    }
                }
            } else if(!userInfo.achievements.badges) {
                userInfoData.achievements = {
                    badges: {},
                    awards: {}
                }
            }
            DataProvider.userInfo = userInfo;
       })();

       $rootScope.isBack = false;
       $location.path('/lesson/'+ids.lid+'/activity/'+ids.aid);
    })

    .controller('ActivityCtrl', function(lessonUserdata, $routeParams, $rootScope) {
        console.log('ActivityCtrl....');
       /* (function enterActivity() {
            if(!!window.sessionStorage) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(!resourceSession.enterActivity && $rootScope.insideBack) {
                    window.location = '/webapp/navigator';
                }else{
                    resourceSession.enterActivity = false;
                    $rootScope.insideBack = true;
                    sessionStorage.setItem('resourceSession', angular.toJson(resourceSession));
                }
            }
        })();       
        */ 
        lessonUserdata.current_activity = $routeParams.aid;
    })