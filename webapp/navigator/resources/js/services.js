angular.module('SunNavigator.services', [])
    .factory('DataProvider', function() {
        var me = {};        
        var rootMaterial = {};
        var materialMap = {};
        var userInfo = {};
        var lessonsUserdataMap = {};

        var achievements = 
            {"ts": "1", "badges": [
                {"id": "first_golden_cup", "title": "金杯奖", "desc": "你的第一座金杯！", "condition": [80], "scope": "lesson.complete"},
                {"id": "lecture_finish", "title": "认真听讲", "desc": "认真听讲可以让你更高效地掌握所学知识。"},
                {"id": "practice_finish", "title": "边学边练", "desc": "看完视频马上练习有助于巩固知识，继续加油哦~"},
                {"id": "practice_all_correct", "title": "一听就懂", "desc": "好厉害！第一次学就全对了！保持这个状态哦~"},
                {"id": "practice_fast_and_correct", "title": "又快又准", "desc": "不仅全对，还完成得这么快！你真是太厉害了。"},
                {"id": "golden_cup", "title": "独孤求败", "desc": "让难题来得更猛烈些吧！"},
                {"id": "final_quiz_failed", "title": "老师在等你", "desc": "不要气馁，学习最重要的是态度和坚持。加油，我看好你！"}
            ], "awards": {}};

        var SUBJECT_MAP = {
   	 "math": "数学",
    	"chinese": "语文",
    	"english": "英语"
        };
        
        return {
            me: me,
            rootMaterial: rootMaterial,
            materialMap: materialMap,
            lessonsUserdataMap: lessonsUserdataMap,
            userInfo: userInfo,            
            achievements: achievements,
            SUBJECT_MAP: SUBJECT_MAP
        }
    })

//TODO:检测哪些API没有用到，干掉！！！
    .service('APIProvider', function(DataProvider) {
    	var HOST = '';
         var getAPI = function (type, id, ts) {
            switch (type) {
                case "getRoot" :
                    return HOST + "/apps?package_name=org.sunlib.exercise&type=chapter";

                case "getInitResources" :
                    return HOST + "/exercise/v1/resources";

                case "getChapterResources" :
                    return HOST + "/exercise/v1/chapters/" + id;

                case "getLessonJson" :
                    if (typeof id.chapter === "undefined") {
                        console.log("chapter is null");
                    }
                    return HOST + id.chapter.url + "/" + id.lessonId + "/lesson.json";

                case "getFileResources" :
                    var chapter = DataProvider.materialMap[id.chapterId];
                    return HOST + chapter.url + "/" + id.lessonId;

                case "getAchievementsJson" :
                    return HOST + "/exercise/v1/achievements?ts=" + ts;

                case "getAchievementsResources" :
                    return HOST + "/exercise/v1/achievements";

                case "getLessonUserdata" :
                    return HOST + "/userdata/" + id.chapterId + "/" + id.lessonId;

                case "postLessonUserdata" :
                    return HOST + "/userdata/" + id.chapterId + "/" + id.lessonId;

                case "getUserInfo" :
                    return HOST + "/userdata/navigator/user_info";

                case "getMe" :
                    return HOST + "/me";

                case "postUserInfoUserdata" :
                    return HOST + "/userdata/navigator/user_info";
            }
            return false;
        }

        return {
            getAPI: getAPI
        }
    })

    .factory('MaterialProvider', function($q, $http, DataProvider, APIProvider) {
        var SUBJECT_MAP = DataProvider.SUBJECT_MAP;

        var getRootMaterial = function() {
            var deferred = $q.defer();
            var rootMaterialPromise = deferred.promise;

            if(DataProvider.rootMaterial && DataProvider.rootMaterial.subjects) {
                deferred.resolve(DataProvider.rootMaterial);
                return rootMaterialPromise;
            }

/*            if(!!window.sessionStorage && sessionStorage.getItem('resourceSession')) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.rootMaterial && resourceSession.materialMap) {
                    DataProvider.rootMaterial = resourceSession.rootMaterial;                    
                    DataProvider.materialMap = resourceSession.materialMap;
                    deferred.resolve(DataProvider.rootMaterial);
                    return rootMaterialPromise;
                }
            }
*/                     

            var rootMaterial = DataProvider.rootMaterial;
            var materialMap = DataProvider.materialMap;
            var url = APIProvider.getAPI('getRoot', '', '');
            $http.get(url)
                .success(function(data) {
                    rootMaterial.subjects = [];
                    _.map(data, function(material) {
                        var subject = materialMap[material.subject];
                        if(!subject) {
                            subject = {
                                id: material.subject,
                                subject: material.subject,
                                title: SUBJECT_MAP[material.subject] || material.subject,
                                chapters: []
                            };
                            materialMap[material.subject] = subject;
                            rootMaterial.subjects.push(subject);
                        }
                        subject.chapters.push(material);
                        materialMap[material.id] = material;
                        _.each(material.lessons, function(lesson) {
                            lesson.chapterId = material.id;   //TODO:是不是叫做parent.id好一点
                            materialMap[lesson.id] = lesson;
                        })
                    })
                    deferred.resolve(rootMaterial);
                })
                .error(function(data, err) {
                    deferred.reject('Load Root Resource Eorror!');
                })
            return rootMaterialPromise;
        }  //end of getRootMaterial function
          
        var getLessonMaterial = function(lessonId, chapterId) {   
            var deferred = $q.defer();
            var lessonMaterialPromise = deferred.promise;

            if(DataProvider.materialMap[lessonId] && DataProvider.materialMap[lessonId].activities) {
                deferred.resolve(DataProvider.materialMap[lessonId]);
                return lessonMaterialPromise;
            }

 /*           if(!!window.sessionStorage && sessionStorage.getItem('resourceSession')) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.materialMap) {
                    DataProvider.materialMap =  resourceSession.materialMap;
                    if(DataProvider.materialMap[lessonId] && DataProvider.materialMap[lessonId].activities) {
                        deferred.resolve(DataProvider.materialMap[lessonId]);
                        return lessonMaterialPromise;
                    }                
                }
            }
*/            

            var materialMap = DataProvider.materialMap;
//   console.log(angular.toJson(materialMap));         
            var chapter = materialMap[chapterId];
            if(!chapter) {
                console.log('Error: getLessonMaterial中获取chapter出错');
            }
            var ts = '';
            var promise = $http.get(APIProvider.getAPI('getLessonJson', {chapter: chapter, lessonId: lessonId}, ts));
            promise.success(function(data) {           
                for(var k=0;k<data.activities.length;k++) { 
                    materialMap[data.activities[k].id] = data.activities[k];
                }
                materialMap[data.id] = data;

                deferred.resolve(data);
            });

            promise.error(function(data, err) {
                console.log('GetLesonMaterial Error....');
                deferred.reject('GetLesonMaterial Error....');
            })

            return lessonMaterialPromise;
        };

        var getAchievementsMaterial = function () {
            var deferred = $q.defer();
            var achievementsPromise = deferred.promise;

            deferred.resolve(DataProvider.achievements);

            return achievementsPromise;
        };        

         var getUserinfoMaterial = function() {
             var deferred = $q.defer();
             var userInfoPromise = deferred.promise;

              if(DataProvider.userInfo.achievements) {
                  deferred.resolve(DataProvider.userInfo);
                  return userInfoPromise;
              } 

   /*           else {
                 var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                 if(resourceSession && resourceSession.userInfo) {
                    DataProvider.userInfo = resourceSession.userInfo;
                    deferred.resolve(DataProvider.userInfo);
                    return userInfoPromise;
                 }
              }
   */

              var promise = $http.get(APIProvider.getAPI('getUserInfo', ''));
              promise.success(function(data) {
                  if(!data.achievements) {
                     data = {
                         achievements: {
                            badges: {},
                            awards: {}
                         }
                     }
                  } else if(!data.achievements.badges) {
                      data.achievements = {
                          badges: {},
                          awards: {}
                      }
                  }
                  DataProvider.userInfo = data;
                  deferred.resolve(DataProvider.userInfo);    
              });

              promise.error(function(err) {
                  deferred.reject('Loading userInfo  Error...' + err);
              });

              return userInfoPromise;
          };    
   
        return {
            getRootMaterial: getRootMaterial,
            getLessonMaterial: getLessonMaterial,
            getAchievementsMaterial: getAchievementsMaterial,
            getUserinfoMaterial: getUserinfoMaterial
        }    

    })   

    .factory('UserdataProvider', function($q, $http, APIProvider, DataProvider, MaterialProvider) {
        var getMe = function() {
            var deferred = $q.defer();
            var userPromise = deferred.promise;

            if(DataProvider.me && DataProvider.me.username) {
                deferred.resolve(DataProvider.me);
                return userPromise;
            } 

    /*        if(!!window.sessionStorage && sessionStorage.getItem('resourceSession')) {
                if(sessionStorage.getItem('resourceSession')) {
                    console.log(angular.toJson(sessionStorage.getItem('resourceSession')));
                }
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.me) {
                    DataProvider.me = resourceSession.me;
                    deferred.resolve(DataProvider.me);
                    return userPromise;
                }              
            }
    */

            $http.get(APIProvider.getAPI('getMe'))
              .success(function(user) {
                 DataProvider.me = user;
                deferred.resolve(DataProvider.me);
              })
             .error(function(err) {
                   deferred.reject('Fetch User Error: ' + err);
             });
             return userPromise;
         };  

       var getLessonUserdata = function(lessonId, chapterId) {
            var deferred = $q.defer();
            var lessonUserdataPromise = deferred.promise;


            if(DataProvider.lessonsUserdataMap[lessonId]) {
                deferred.resolve(DataProvider.lessonsUserdataMap[lessonId]);
                return lessonUserdataPromise;
            }

   /*         if(!!window.sessionStorage && sessionStorage.getItem('resourceSession')) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.lessonsUserdataMap) {
                    DataProvider.lessonsUserdataMap = resourceSession.lessonsUserdataMap;  
                    deferred.resolve(DataProvider.lessonsUserdataMap[lessonId]);
                    return lessonUserdataPromise;
                }
            }
  */

            $http.get(APIProvider.getAPI('getLessonUserdata', {"lessonId":lessonId, "chapterId":chapterId}, ''))
                .success(function(userdata, status) {              
                    DataProvider.lessonsUserdataMap[lessonId] = userdata;
                    deferred.resolve(DataProvider.lessonsUserdataMap[lessonId]);
                })
                .error(function(err) {
                    deferred.reject('Navigator获取lesson userdata失败');
                })

            return lessonUserdataPromise;
          }                
                    
        return {
            getMe: getMe,
            getLessonUserdata: getLessonUserdata
        }

    })      //end of UserdataProvider

    .factory('FetchServerDataFactory', function($q, $http, $timeout) {
        var fetchChapterResources = function(chapterId) {
            var deferred = $q.defer();
            var chapterMaterialPromise = deferred.promise;

            var ts = materialMap[chapterId].ts;
            var promise = fetchServerResources(APIProvider.getAPI('getChapterResources', chapterId, ''), ts);
            promise.then(function(data) {
                deferred.resolve(data);
            }, function(data, err) {
                deferred.reject(err);
            }, function(progressData) {
                deferred.notify(progressData);
            });
            return chapterMaterialPromise;
        };  
        
        var fetchServerResources = function(apiUrl, timestamp) { 
            var deferred = $q.defer();
            var resourcesPromise = deferred.promise;

            var statusPromise = $http.get(apiUrl + '?ts=' + timestamp + 'act=status');
            statusPromise
                .success(function(status) {
                    if(!status.is_cached){
                        var cachePromise = $http.get(apiUrl + '?ts=' + timestamp + '&act=cache');
                        cachePromise.success(function(response) {
                            if(response == '506') {
                                deferred.reject('Server Offline');
                            } else {
                                deferred.notify(response.progress);
                                $timeout(function getNewResources() {
                                    var currentDataPromise = getLoadingProgress(timestamp, apiUrl);
                                    currentDataPromise.then(function(progressData) {
                                        if(progressData != 'done'){
                                             deferred.notify(progressData);
                                             $timeout(getNewResources, 500);
                                        } else {
                                            deferred.notify(100);
                                            deferred.resolve('complete');
                                        }
                                    })
                                }, 500);
                            }
                        })
                    } else if(status.is_cached){
                        deferred.resolve('already in cache');
                    }
                })
                .error(function(err) {
                    deferred.reject('Requesting current resources status error: ' + err);
                })
            return resourcesPromise;
        };   // end of fetchServerResources function  

        var getLoadingProgress = function(ts, apiUrl) {
            var deferred = $q.defer();
            var loadingPromise = deferred.promise;

            var currentStatePromise = $http.get(apiUrl + '?ts=' + ts + '&act=status');
            currentStatePromise.success(function(stateData) {
                if(!stateData.is_cached) {
                    deferred.resolve(stateData.progress);
                } else {
                    deferred.resolve('done');
                }
            }).error(function(err) {
                deferred.reject('Error occured while getting the current status: ' + err);
            })

            return loadingPromise;
        };            

        var getCurrentChapterStatus = function(chapterId) {
            var deferred = $q.defer();
            var chapterStatusPromise = deferred.promise;

            deferred.resolve(true);

            return chapterStatusPromise;
        };

        return {
            fetchChapterResources: fetchChapterResources,
            getCurrentChapterStatus: getCurrentChapterStatus
        }

    })       //end of FetchServerDataFactory
 

    .factory('SandboxProvider', function(APIProvider, DataProvider, UserdataProvider, MaterialProvider, FetchServerDataFactory) {
        function Sandbox() {
            Sandbox.prototype.getRootMaterial = function() {
                return MaterialProvider.getRootMaterial();
            }

            Sandbox.prototype.getLessonMaterial = function(lid, cid) {
                return MaterialProvider.getLessonMaterial(lid, cid);
            }

            Sandbox.prototype.getAchievementsMaterial = function() {
                return MaterialProvider.getAchievementsMaterial();
            }

            Sandbox.prototype.getUserinfoMaterial = function() {
                return MaterialProvider.getUserinfoMaterial();
            }

            Sandbox.prototype.getMe = function() {
                return UserdataProvider.getMe();
            }

            Sandbox.prototype.getLessonUserdata = function(lid, cid) {
                return UserdataProvider.getLessonUserdata(lid, cid);
            }            

            Sandbox.prototype.fetchChapterResources = function(cid) {
                return FetchServerDataFactory.fetchChapterResources(cid);
            }

            Sandbox.prototype.getCurrentChapterStatus = function(cid) {
                return FetchServerDataFactory.getCurrentChapterStatus(cid);
            }

            Sandbox.prototype.emitEvent = function(eventName, scope, args) {
                console.log('发送'+eventName+'事件！！！')
                scope.$emit(eventName, args);
            };

            Sandbox.prototype.loadSubjectMaterial = function(sid) {
                return DataProvider.materialMap[sid];
            }

            Sandbox.prototype.loadChapterMaterial = function(cid) {
                return DataProvider.materialMap[cid];
            }            

            Sandbox.prototype.loadRootMaterial = function() {
                return DataProvider.rootMaterial;
            }

            Sandbox.prototype.loadMaterialMap = function() {
                return DataProvider.materialMap;
            }

            Sandbox.prototype.loadLessonsUserdataMap = function() {
                return DataProvider.lessonsUserdataMap;
            }

            Sandbox.prototype.loadMe = function() {
                return DataProvider.me;
            }

            Sandbox.prototype.loadUserInfo = function() {
                return DataProvider.userInfo;
            }

            Sandbox.prototype.getAllSubjectNames = function() {
                return DataProvider.SUBJECT_MAP;
            }

        }  //end of Sandbox constrctor

        var getSandbox = function() {
            return new Sandbox();
        }

        return {
            getSandbox: getSandbox
        }
    });


