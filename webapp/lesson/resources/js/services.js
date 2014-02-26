angular.module('SunLesson.services', [])
    .factory('DataProvider', function() {
        var chapterData = {};
        var lessonData = {};
        var lessonUserdata = {};     
        var userInfo = {};
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

//--------------------------------------TODO：临时数据-------------------------------------------------------
        // var videoMaterial =
        // {
        //     title: "example_video",
        //     type: "hypervideo",
        //     video: {
        //         url: "main-video.mp4"
        //     }
        // };

        // var problemMaterial =
        //     [
        //         {
        //             id: "p1",
        //             title: "vocab test no.1",
        //             type: "singlechoice",
        //             body: "Choose the antonym of 'unswerving'.",
        //             show_time: 253,
        //             wrong_video: {
        //                 url: "wrong1.mp4"
        //             },
        //             choices: [
        //                 {
        //                     id: "p1c1",
        //                     body: "tenacious",
        //                     is_correct: false
        //                 },
        //                 {
        //                     id: "p1c2",
        //                     body: "indomitable",
        //                     is_correct: true
        //                 }
        //             ]
        //         },
        //         {
        //             id: "p2",
        //             title: "vocab test no.2",
        //             type: "binarychoice",
        //             body: "Choose the synonym of 'impecunious'.",
        //             show_time: 339,
        //             wrong_video: {
        //                 url: "wrong2.mp4",
        //                 jump: 20
        //             },
        //             choices: [
        //                 {
        //                     id: "p2c1",
        //                     body: "generosity",
        //                     is_correct: false
        //                 },
        //                 {
        //                     id: "p2c2",
        //                     body: "impoverished",
        //                     is_correct: true
        //                 }
        //             ]
        //         }
        //     ];                 
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

        return {
            chapterData: chapterData,
            lessonData: lessonData,
            lessonUserdata: lessonUserdata,
            userInfo: userInfo,
            achievements: achievements
            //videoMaterial: videoMaterial,
            //problemMaterial: problemMaterial
        }
    })

//TODO：这里面的API肯定是要做清理的，用不到的干掉
    .service('APIProvider', function(DataProvider, $rootScope, $q, $http) {
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
                    var chapter = DataProvider.chapterData;
                    if (typeof id.chapter === "undefined") {
                        console.log("chapter is null");
                    }                    
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

    .factory('ResourceProvider', function($q, $http, $route, $routeParams, $rootScope, DataProvider, APIProvider) {
        var getIds = function() {
            var deferred = $q.defer();
            var idsPromise = deferred.promise;

            if($rootScope.ids) {
                deferred.resolve($rootScope.ids);
                return idsPromise;
            }

            var ids = {};
            var params = $route.current.params;
            ids.sid = params.sid;
            ids.cid = params.cid;
            ids.lid = params.lid;
            ids.aid = params.aid;
            $rootScope.ids = ids;

            deferred.resolve(ids);
            return idsPromise;
        }

        var getLessonData = function() {
            var deferred = $q.defer();
            var lessonDataPromise = deferred.promise;

            if(DataProvider.lessonData && DataProvider.lessonData.id && DataProvider.lessonData.activities) {
                deferred.resolve(DataProvider.lessonData);
                return lessonDataPromise;
            }

  /*          if(!!window.sessionStorage) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                //console.log('getLessonData的时候ids是否ready，lid='+$rootScope.ids.lid);
                if(resourceSession && resourceSession.materialMap && resourceSession.materialMap[$rootScope.ids.lid]) {
                    DataProvider.lessonData = resourceSession.materialMap[$rootScope.ids.lid];
                    deferred.resolve(DataProvider.lessonData);
                    return lessonDataPromise;
                }
            }
 */           

            
            var rootUrl = APIProvider.getAPI('getRoot', '', '');
            var ts = '';
            console.log('能否拿到ids='+$rootScope.ids.cid);
            if(!(DataProvider.chapterData && DataProvider.chapterData.url)) {
                $http.get(rootUrl).success(function(chapters) {
                    chapters.some(function(chapter, index) {
                        if(chapter.id = $rootScope.ids.cid) {
                            DataProvider.chapterData = chapter;
                            console.log('找到，赋值');
                            return true;
                        } else {
                            return false;
                        }
                    })

                    var url = APIProvider.getAPI('getLessonJson', {chapter: DataProvider.chapterData, lessonId: $rootScope.ids.lid}, ts);
                    getResourceFromServer(url, deferred);
                }).error(function(err) {
                    console.log('Get chapterData Error...');
                })
            } else {
                var url = APIProvider.getAPI('getLessonJson', {chapter: DataProvider.chapterData, lessonId: $rootScope.ids.lid}, ts);
                getResourceFromServer(url, deferred);
            }

            return lessonDataPromise;
        };

         var getLessonUserdata = function() {
            var deferred = $q.defer();
            var lessonUserdataPromise = deferred.promise;

            if(DataProvider.lessonUserdata && DataProvider.lessonUserdata.summary) {
                deferred.resolve(DataProvider.lessonUserdata);
                return lessonUserdataPromise;
            }

     /*      if(!!window.sessionStorage) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.lessonsUserdataMap) {
                    DataProvider.lessonUserdata  = resourceSession.lessonsUserdataMap[$rootScope.ids.lid];
                    if(!DataProvider.lessonUserdata) {
                        DataProvider.lessonUserdata = {};
                    }
                    deferred.resolve(DataProvider.lessonUserdata);
                    return lessonUserdataPromise;
                } 
            }
            */

            var url = APIProvider.getAPI('getLessonUserdata', {"lessonId":$rootScope.ids.lid, "chapterId":$rootScope.ids.cid}, '');
            getResourceFromServer(url, deferred);
            return lessonUserdataPromise;
        };
      
        var getUserInfo = function() {
            var deferred = $q.defer();
            var userInfoPromise = deferred.promise;

            if(DataProvider.userInfo && DataProvider.userInfo.achievements) {
                deferred.resolve(DataProvider.userInfo);
                return userInfoPromise;
            }

       /*     if(!!window.sessionStorage) {
                var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
                if(resourceSession && resourceSession.userInfo) {
                    DataProvider.userInfo = resourceSession.userInfo;
                    deferred.resolve(DataProvider.userInfo);
                    return userInfoPromise;
                }
            }
     */       

            var url = APIProvider.getAPI('getUserInfo', '');
            getResourceFromServer(url, deferred);
            return userInfoPromise;
        };     

        var getAchievements = function () {
            var deferred = $q.defer();
            var achievementsPromise = deferred.promise;

            deferred.resolve(DataProvider.achievements);

            return achievementsPromise;
        }          

        var loadUserInfo = function() {
            return DataProvider.userInfo;
        }        

        var getResourceFromServer = function (url, deferred) { 
            $http.get(url).success(function(resource) {
                deferred.resolve(resource);
            }).error(function(err) {
                deferred.reject('getResourceFromServer Error!...');
            })
        }

        return {
            getIds: getIds,
            getLessonData: getLessonData,
            getLessonUserdata: getLessonUserdata,
            getUserInfo: getUserInfo,
            getAchievements: getAchievements,
            loadUserInfo: loadUserInfo
        }
    })

    .factory('UserdataProvider', function($q, $http, $rootScope, APIProvider, DataProvider, ResourceProvider, MaterialProvider) {
        var getActivityUserdata = function (activityId) { 
           var activityData = {};

           DataProvider.lessonData.activities.some(function(activity, index) {
                if(activity.id == activityId) {
                    activityData = activity;
                    return true;
                }else{
                    return false;
                }
           })

      /*      DataProvider.lessonData.activities.forEach(function(activity, index) {
                if(activity.id == activityId) {
                    console.log('找到activity data');
                    activityData = activity;
                }
            })
      */

            if(!DataProvider.lessonUserdata.activities) {
                DataProvider.lessonUserdata = {
                    is_complete: false,
                    activities: {},
                    summary: {} 
                }
            }    

            if(!DataProvider.lessonUserdata.activities[activityId]) {
                 if(activityData.type == 'quiz') {
                    DataProvider.lessonUserdata.activities[activityId] = {
                        is_complete: false,
                        summary:{},
                        problems: {}
                    }                    
                }else {
                    DataProvider.lessonUserdata.activities[activityId] = {
                        is_complete: false,
                        summary: {}
                    }
                }               
            }

            var activityUserdata = DataProvider.lessonUserdata.activities[activityId];  
            //console.log('the activityUserdata='+activityId+'     content='+angular.toJson(activityUserdata));
            if (activityData.pool_count) { 
                if (activityUserdata.seed && (activityUserdata.seed.length == 0)) {
                    activityData = MaterialProvider.getActivityMaterial(activityId);
                    activityUserdata.seed = activityData.seed;                  
                    for (var i = 0; i < activityData.problems.length; i++) {
                        activityUserdata.problems[activityData.problems[i].id] ={
                            is_correct: false,
                            answer: []
                        };
                    }
                } 
            }else if ((activityData.type == "quiz") && ((!activityUserdata.problems) || (Object.keys(activityUserdata.problems).length <= 0))) {
                //alert('init the problems-==-');
                if(!activityUserdata.problems) {
                    activityUserdata.problems = {};
                }
                for (var i = 0; i < activityData.problems.length; i++) {          
                    activityUserdata.problems[activityData.problems[i].id] = {
                        is_correct: false,
                        answer: []
                    };
                }
            }else{
                console.log('直接返回');
            } 
            return activityUserdata;
        }   

        var loadProblemUserdata = function(aid, pid) {
            var lessonUserdata = DataProvider.lessonUserdata;
            return lessonUserdata.activities[aid].problems[pid];
        }     

        var flushUserdata = function(lessonId, chapterId) {  
            var deferred = $q.defer();
            var flushPromise = deferred.promise;

            var promise = $http({
                method: 'POST',
                url: APIProvider.getAPI('postLessonUserdata', {"lessonId": lessonId, "chapterId": chapterId}, ''),
                headers: {'Content-Type': 'application/json;charset:UTF-8'},
                data: JSON.stringify(DataProvider.lessonUserdata)                
            });

            promise.success(function(msg) {
                deferred.resolve('Success flush userdata...');
            }).error(function(err) {
                deferred.reject('Flush userdata error...');
            })

            return flushPromise;
        }

        var resetUserdata = function (moduleName, moduleId) {  
            var lessonUserdata = DataProvider.lessonUserdata;
            if (moduleName === "lesson") {
                var promise = ResourceProvider.getLessonUserdata();
                promise.then(function (lessonUserdata) {
                    return lessonUserdata;
                })
            } else if (moduleName === "activity") {
                var activityData = MaterialProvider.loadMaterial(moduleId, DataProvider.lessonData.activities);
                DataProvider.lessonUserdata.activities[moduleId] = {
                    is_complete: true,
                    summary: {}   
                };

                if (activityData.type === 'quiz') {
                    DataProvider.lessonUserdata.activities[moduleId].problems = {};
                    if (typeof activityData.pool_count != "undefined") {
                        DataProvider.lessonUserdata.activities[moduleId].seed = [];
                    }
                    for (var i = 0; i < activityData.problems.length; i++) {
                        DataProvider.lessonUserdata.activities[moduleId].problems[activityData.problems[i].id] = {
                            is_correct: false,
                            answer: []
                        }
                    }
                }
                return DataProvider.lessonUserdata.activities[moduleId];
            } else {
                console.log('Error: Never get here');
                return lessonUserdata;
            }
        }

        var getIncompleteGlobalBadges = function (event) {
            var deferred = $q.defer();
            var globalBadgesPromise = deferred.promise;

            var userinfo = ResourceProvider.loadUserInfo();
            var incompleteGlobalBadges = [];
            var achievementsMaterialPromise = ResourceProvider.getAchievements();
            achievementsMaterialPromise.then(function (achievements) {
                if (typeof achievements.badges != "undefined") {
                    for (var i = 0; i < achievements.badges.length; i++) {
                        if ((typeof achievements.badges[i].scope != "undefined") && (achievements.badges[i].scope == event.name) &&
                            (typeof userinfo.achievements.badges[achievements.badges[i].id] == "undefined")) {
                            incompleteGlobalBadges.push(achievements.badges[i]);
                        }
                    }
                }
                deferred.resolve(incompleteGlobalBadges);
            }, function (err) {
                deferred.reject(err);
            })

            return globalBadgesPromise;
        }        

        var addAchievements = function (achievementType, achievementContent) {
            var userInfo = ResourceProvider.loadUserInfo();
            var is_new = (typeof userInfo.achievements[achievementType][achievementContent.id] == "undefined");
            userInfo.achievements[achievementType][achievementContent.id] = {
                time: Date.now()
            };
            if (is_new) {
                flushUserInfo();
            }

            showNotification("success", achievementContent);
        }

        var flushUserInfo = function () {
            var userInfo = ResourceProvider.loadUserInfo();
            $http.post(APIProvider.getAPI("postUserInfoUserdata", "", ""), JSON.stringify());
        }        

        var showNotification = function (notifyType, notifyContent) {
            toastr.options.positionClass = "toast-top-full-width";
            if (notifyType == "success") {
                toastr.success('<img src="resources/img/badge-icons/' + notifyContent.id + '.png"/> 恭喜你获得了 ' +
                    notifyContent.title + ' 徽章！');
            } else if (notifyType == "error") {
                toastr.error("错误：" + notifyContent);
            }
        };     
//TODO:return 
        return {
            getActivityUserdata: getActivityUserdata,
            flushUserdata: flushUserdata,
            resetUserdata: resetUserdata,
            addAchievements: addAchievements,
 //           loadUserdata: loadUserdata,
            loadProblemUserdata: loadProblemUserdata,
            getIncompleteGlobalBadges: getIncompleteGlobalBadges
        }
    })

    .factory('MaterialProvider', function(DataProvider) {
        var loadMaterial = function(id, arr) {
            if(arr) {
                for(var i=0;i<arr.length;i++) {
                    if(arr[i].id == id) {
                        return arr[i];
                    }
                }
            }
        }

//randomize_choices
        var getActivityMaterial = function (activityId, seed) {  
            var originalActivityData = loadMaterial(activityId, DataProvider.lessonData.activities);
            if (originalActivityData.pool_count) {
                var activityData = _.clone(originalActivityData);
                if (typeof seed != "undefined") {
                    var shuffledProblems = getShuffledProblems(activityData, seed);
                    activityData.problems = shuffledProblems;
                    activityData.seed = seed;
                } else {
                    var newSeed = [];
                    for (var i = 0; i < activityData.pool_count; i++) {
                        newSeed.push(Math.random());
                    }
                    var shuffledProblems = getShuffledProblems(activityData, newSeed);
                    activityData.problems = shuffledProblems;
                    activityData.seed = newSeed.slice();  
                }
                if(activityData.randomize_choices) {  
                    shuffleChoices(activityData.problems);
                }
                return activityData;
            } else if(!originalActivityData.pool_count) {
                if(originalActivityData.randomize_questions) {
                    originalActivityData.problems = _.shuffle(originalActivityData.problems);
                }
                if(originalActivityData.randomize_choices) {
                    shuffleChoices(originalActivityData.problems);
                }
                return originalActivityData;
            }
            return originalActivityData;
        }

        var shuffleChoices = function(problems) {
            for(var i=0;i<problems.length;i++) {
                var problem = problems[i];
                problem.choices = _.shuffle(problem.choices);
            }
        }

        var getShuffledProblems = function (activityData, seed) {
            var problemsIndex = [];
            for (var j = 0, max = activityData.problems.length; j < max; j++) {
                problemsIndex.push(j);
            }
            var problemsShuffled = [];
            for (var k = 0, len = seed.length; k < len; k++) {
                var r = parseInt(seed[k] * (len - k));
                problemsShuffled.push(activityData.problems[problemsIndex[r]]);
                problemsIndex.splice(r, 1);
            }
            return problemsShuffled;
        }
        
        return {
            loadMaterial: loadMaterial,
            getActivityMaterial: getActivityMaterial
        }
    })

    .factory("GraderProvider", function () {

        var graderCollection = {
            /*global badges*/
            first_golden_cup: function (condition) {
                return function (userdata) {
                    return (userdata.correct_percent >= condition[0]);
                }
            },

            /*local badges*/
            lecture_finish: function () {
                return function () {
                    return true;
                };
            },
            practice_finish: function () {
                return function () {
                    return true;
                };
            },
            practice_all_correct: function (condition) {
                return function (userData) {
                    return (userData.correct_percent == condition[0]);
                };
            },
            practice_fast_and_correct: function (condition) {
                return function (userData) {
                    return ((userData.correct_percent == condition[0]) && (userData.duration <= condition[2] * 1000));
                }
            },
            golden_cup: function (condition) {
                return function (userData) {
                    return (userData.correct_percent >= condition[0]);
                }
            },
            final_quiz_failed: function (condition) {
                return function (userData) {
                    return ((userData.correct_percent < condition[0]) && (userData.duration <= condition[2] * 1000));
                }
            }
        };

        var getGrader = function (grader_id, condition) {
            return graderCollection[grader_id](condition);   
        }

        var graderFactory = function (graderFunc, userData) {
            return graderFunc(userData);
        }

        return {
            getGrader: getGrader,
            graderFactory: graderFactory
        }
    })

    .factory('SandboxProvider', function($rootScope, $location, DataProvider, APIProvider, ResourceProvider, UserdataProvider, MaterialProvider, GraderProvider) {
        function Sandbox() {
            Sandbox.prototype.getIds = function() {
                return ResourceProvider.getIds();
            }

            Sandbox.prototype.getLessonData = function() {
                return ResourceProvider.getLessonData();
            }

            Sandbox.prototype.getLessonUserdata = function() {
                return ResourceProvider.getLessonUserdata();
            }

            Sandbox.prototype.getUserInfo = function() {
                return ResourceProvider.getUserInfo();
            }

            Sandbox.prototype.getAchievements = function() {
                return ResourceProvider.getAchievements();
            }

            Sandbox.prototype.loadUserInfo = function() {
                return ResourceProvider.loadUserInfo();
            }

            Sandbox.prototype.getActivityUserdata = function(aid) {
                return UserdataProvider.getActivityUserdata(aid);
            }

            Sandbox.prototype.loadProblemUserdata = function(aid, pid) {
                return UserdataProvider.loadProblemUserdata(aid, pid);
            }

            Sandbox.prototype.flushUserdata = function(lid, cid) {
                return UserdataProvider.flushUserdata(lid, cid);
            }

            Sandbox.prototype.resetUserdata = function(moduleName, moduleId) {
                return UserdataProvider.resetUserdata(moduleName, moduleId);
            }

            Sandbox.prototype.addAchievements = function(achievementType, achievementContent) {
                return UserdataProvider.addAchievements(achievementType, achievementContent);
            }

            Sandbox.prototype.getIncompleteGlobalBadges = function(event) {
                return UserdataProvider.getIncompleteGlobalBadges(event);
            }

            Sandbox.prototype.loadMaterial = function(id, arr) {
                return MaterialProvider.loadMaterial(id, arr);
            }

            Sandbox.prototype.getActivityMaterial = function(activityId, seed) {
                return MaterialProvider.getActivityMaterial(activityId, seed);
            }

            Sandbox.prototype.graderFactory = function(graderFunc, userData) {
                return GraderProvider.graderFactory(graderFunc, userData);
            }

            Sandbox.prototype.getGrader = function(grader_id, condition) {
                return GraderProvider.getGrader(grader_id, condition);
            }

            Sandbox.prototype.sendEvent = function(eventName, scope, args) {
                scope.$emit(eventName, args);
            } 

            Sandbox.prototype.playSoundEffects = function (soundName) {
                var soundEffect = new Audio("resources/sound/" + soundName + ".mp3");
                soundEffect.play();
            }      

            Sandbox.prototype.continueLesson = function(lid, aid) {
                $location.path('/lesson/' + lid + '/activity/' + aid);
            }   

            Sandbox.prototype.createGrader = function (graderFunc, userData) {
                return GraderProvider.graderFactory(graderFunc, userData);
            }   
            
            Sandbox.prototype.getParentActivityData = function (parentId) {
                return MaterialProvider.loadMaterial(parentId, DataProvider.lessonData.activities);
            }                                      

            Sandbox.prototype.completeQuizActivity = function (activityData, $scope, correctCount, lessonSummary) {
                var jump = [];
                for (var i = 0; i < activityData.jump.length; i++) {
                    jump = activityData.jump[i].split(':');
                    var correctPercent = parseInt((correctCount * 100) / activityData.problems.length);
                    if (((jump[0] === "end_of_lesson_if_correctness") && (this.conditionParser(jump[1], correctCount, correctPercent))) ||
                        ((jump[0] === "to_activity_if_correctness") && (this.conditionParser(jump[2], correctCount, correctPercent))) ||
                        (jump[0] === "force_to_activity")) {
                            break;
                    }
                }                

                if (i < activityData.jump.length) {
                    if (jump[0] != "end_of_lesson_if_correctness") {
                       this.listenToActivityComplete($scope, {activity: jump[1], summary: lessonSummary});
                    } else {
                        this.listenToEndOfLesson($scope, {summary: lessonSummary});
                    }
                } else {
                   this.listenToActivityComplete($scope, {summary: lessonSummary});
                }
            }

            Sandbox.prototype.conditionParser = function (condition, correctCount, correctPercent) {
                var is_percent = false;
                var targetNum = 0;

                if (condition.slice(condition.length - 1) === "%") {
                    is_percent = true;
                }

                if (condition.slice(1, 2) === "=") {
                    if (is_percent) {
                        targetNum = condition.slice(2, condition.length - 1);
                    } else {
                        targetNum = condition.slice(2);
                    }
                    if (condition.slice(0, 1) === ">") {
                        return ((is_percent && (correctPercent >= targetNum)) ||
                            (!is_percent && (correctCount >= targetNum)));
                    } else {
                        return ((is_percent && (correctPercent <= targetNum)) ||
                            (!is_percent && (correctCount <= targetNum)));
                    }
                } else {
                    if (is_percent) {
                        targetNum = condition.slice(1, condition.length - 1);
                    } else {
                        targetNum = condition.slice(1);
                    }
                    if (condition.slice(0, 1) === ">") {
                        return ((is_percent && (correctPercent > targetNum)) ||
                            (!is_percent && (correctCount > targetNum)));
                    } else if (condition.slice(0, 1) === "<") {
                        return ((is_percent && (correctPercent < targetNum)) ||
                            (!is_percent && (correctCount < targetNum)));
                    } else {
                        return ((is_percent && (correctPercent == targetNum)) ||
                            (!is_percent && (correctCount == targetNum)));
                    }
                }
            }         

            Sandbox.prototype.listenToActivityComplete =  function(scope, args) {
                var lessonUserdata = DataProvider.lessonUserdata;
                var lessonData = DataProvider.lessonData;
                var activityIndex = 0;
                for(var i=0;i<lessonData.activities.length;i++) {
                    var item = lessonData.activities[i];
                    if(item.id == lessonUserdata.current_activity) {
                        activityIndex = i;
                        break;
                    }
                }

                if ((typeof args !== "undefined") && (typeof args.summary !== "undefined") &&
                    (typeof args.summary.correct_count !== "undefined")) {
                        lessonUserdata.summary.correct_count = args.summary.correct_count;
                        lessonUserdata.summary.correct_percent = args.summary.correct_percent;
                }

                if ((typeof args !== "undefined") && (typeof args.activity !== "undefined")) {               
                    lessonUserdata.current_activity = args.activity;
                    this.flushUserdata(lessonData.id, $rootScope.ids.cid);
                    this.continueLesson(lessonData.id, args.activity);
                } else if (activityIndex != lessonData.activities.length-1) {
                    lessonUserdata.current_activity = lessonData.activities[activityIndex + 1].id;
                    this.flushUserdata(lessonData.id, $rootScope.ids.cid);
                    this.continueLesson(lessonData.id, lessonData.activities[activityIndex + 1].id);
                } else {
                    lessonUserdata.current_activity = undefined;
                    if ((typeof lessonUserdata.summary.correct_percent == "undefined")) {
                        lessonUserdata.summary.correct_percent = 100;
                        lessonUserdata.is_complete = true;
                    } else {
                        if (typeof lessonData.pass_score != "undefined") {
                            if (this.parseCompleteCondition(lessonData.pass_score, lessonUserdata.summary)) {
                                lessonUserdata.is_complete = true;
                            }else{
                                //TODO:
                                lessonUserdata.ever_failed = true;
                            }
                        } else {
                            lessonUserdata.is_complete = true;
                        }                                        
                    } 

                    if (typeof lessonUserdata.summary.correct_percent != "undefined" && lessonUserdata.is_complete) {
                        if ((typeof lessonData.star3 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star3)) {
                            lessonUserdata.summary.star = 3;
                        } else if ((typeof lessonData.star2 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star2)) {
                            lessonUserdata.summary.star = 2;
                        } else if ((typeof lessonData.star2 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star1)) {
                            lessonUserdata.summary.star = 1;
                        }
                    }

                    if ((lessonUserdata.is_complete) && (typeof lessonData.achievements != "undefined")) {
                        for (var i = 0; i < lessonData.achievements.length; i++) {
                            if (lessonData.achievements[i].type == "award") {
                                if (typeof userInfo.achievements.awards[lessonData.achievements[i].id] == "undefined") {
                                    if ((typeof lessonUserdata.summary.correct_count == "undefined") ?
                                        (this.conditionParser(lessonData.achievements[i].condition, Infinity, 100)) :
                                        (this.conditionParser(lessonData.achievements[i].condition,
                                        lessonUserdata.summary.correct_count, lessonUserdata.summary.correct_percent))) {
                                            this.addAchievements("awards", lessonData.achievements[i]);
                                    }
                                }
                            }
                        }
                    }  

                    scope.showLessonSummary = true;
                    scope.hasFinalQuiz = (typeof lessonUserdata.summary.correct_percent != "undefined");
                    scope.lessonCorrectPercent = lessonUserdata.summary.correct_percent;
                    scope.lessonStar = (typeof lessonUserdata.summary.star != "undefined") ?
                        lessonUserdata.summary.star : 0;
                    scope.lessonCup = (lessonUserdata.summary.star == 1) ? " 获得 铜杯" :
                        ((lessonUserdata.summary.star == 2) ? " 获得 银杯" :
                        ((lessonUserdata.summary.star == 3) ? " 获得 金杯" : null));

                    var args = {};
                    args.id = lessonData.id;
                    args.title = lessonData.title;
                    args.lessonCup = scope.lessonCup;
                    this.listenToLessonComplete(args); 
                    this.flushUserdata(lessonData.id, $rootScope.ids.cid);                  
                }           //end of "else"                                            
            }                  //end of function   


            Sandbox.prototype.listenToEndOfLesson = function(scope, args) {            
                var lessonUserdata = DataProvider.lessonUserdata;
                var lessonData = DataProvider.lessonData;
                if ((typeof args !== "undefined") && (typeof args.summary !== "undefined") &&
                    (typeof args.summary.correct_count !== "undefined")) {
                    lessonUserdata.summary.correct_count = args.summary.correct_count;
                    lessonUserdata.summary.correct_percent = args.summary.correct_percent;
                }

                lessonUserdata.current_activity = undefined;
                if ((typeof lessonUserdata.summary.correct_percent == "undefined")) {
                    lessonUserdata.summary.correct_percent = 100;
                    lessonUserdata.is_complete = true;
                } else {
                    if (typeof lessonData.pass_score != "undefined") {
                        if (this.parseCompleteCondition(lessonData.pass_score, lessonUserdata.summary)) {
                            lessonUserdata.is_complete = true;
                        } else {
                            //TODO:
                            lessonUserdata.ever_failed = true;
                        }  
                    } else {
                        lessonUserdata.is_complete = true;   
                    }
                }

                if (typeof lessonUserdata.summary.correct_percent != "undefined" && lessonUserdata.is_complete) {
                    delete lessonUserdata.summary.star;
                    if ((typeof lessonData.star3 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star3)) {
                        lessonUserdata.summary.star = 3;
                    } else if ((typeof lessonData.star2 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star2)) {
                        lessonUserdata.summary.star = 2;
                    } else if ((typeof lessonData.star1 == "undefined") || (lessonUserdata.summary.correct_percent >= lessonData.star1)) {
                        lessonUserdata.summary.star = 1;
                    }
                }

                if ((lessonUserdata.is_complete) && (typeof lessonData.achievements != "undefined")) {
                    for (var i = 0; i < lessonData.achievements.length; i++) {
                        if (lessonData.achievements[i].type == "award") {
                            if (typeof userInfo.achievements.awards[lessonData.achievements[i].id] == "undefined") {
                                if ((typeof lessonUserdata.summary.correct_count == "undefined") ?
                                    (this.conditionParser(lessonData.achievements[i].condition, Infinity, 100)) :
                                    (this.conditionParser(lessonData.achievements[i].condition,
                                    lessonUserdata.summary.correct_count, lessonUserdata.summary.correct_percent))) {
                                        this.addAchievements("awards", lessonData.achievements[i]);
                                }
                            }
                        }
                    }
                }

                scope.hasFinalQuiz = (typeof lessonUserdata.summary.correct_percent != "undefined");
                scope.lessonCorrectPercent = lessonUserdata.summary.correct_percent;
                scope.lessonStar = (typeof lessonUserdata.summary.star != "undefined") ?
                    lessonUserdata.summary.star : 0;
                scope.lessonCup = (lessonUserdata.summary.star == 1) ? " 获得 铜杯" :
                    ((lessonUserdata.summary.star == 2) ? " 获得 银杯" :
                        ((lessonUserdata.summary.star == 3) ? " 获得 金杯" : null));
                    scope.showLessonSummary = true;

                var args = {};
                args.id = scope.id;
                args.title = scope.title;
                args.lessonCup = scope.lessonCup;
                this.listenToLessonComplete(args);
                this.flushUserdata(lessonData.id, $rootScope.ids.cid);                
            }    

            Sandbox.prototype.parseCompleteCondition = function (pass_score, summary) {
                var target_score = 0;
                pass_score = pass_score.toString();
                if (pass_score.slice(pass_score.length - 1) === "%") {
                    target_score = parseInt(pass_score.slice(0, pass_score.length - 1));
                    return (summary.correct_percent >= target_score);
                } else {
                    target_score = parseInt(pass_score);
                    return (summary.correct_count >= target_score);
                }
            }

            Sandbox.prototype.listenToLessonComplete = function(args) {
                var lessonUserdata = DataProvider.lessonUserdata;
               LearningRelated.finishLesson(args.id, args.title, args.lessonCup, lessonUserdata.summary.correct_count, lessonUserdata.summary.correct_percent, lessonUserdata.is_complete);
                var incompleteBadgesPromise = this.getIncompleteGlobalBadges(event);
                incompleteBadgesPromise.then(function (globalBadges) {
                    var userDataToGrade = {
                        correct_percent: lessonUserdata.summary.correct_percent
                    };
                    for (var i = 0; i < globalBadges.length; i++) {
                        if (typeof globalBadges[i].condition != "undefined") {
                            var grader = this.getGrader(globalBadges[i].id, globalBadges[i].condition);
                        } else {
                            var grader = this.getGrader(globalBadges[i].id, "");
                        }

                        if (this.createGrader(grader, userDataToGrade)) {
                            this.addAchievements("badges", globalBadges[i]);
                        }
                    }
                })
            }       

            Sandbox.prototype.problemGrader = function (currProblem, userAnswer) {
                if (currProblem.type === "singlechoice") {//单选题
                    if (typeof userAnswer[currProblem.id] !== "undefined") {
                        for (var i = 0; i < currProblem.choices.length; i++) {
                            if (userAnswer[currProblem.id] === currProblem.choices[i].id) {
                                break;
                            }
                        }
                        return (currProblem.choices[i].is_correct);
                    }
                } else if (currProblem.type === "singlefilling") {
                    return ((typeof userAnswer[currProblem.id] !== "undefined") &&
                        (userAnswer[currProblem.id] === currProblem.correct_answer));
                } else {  
                    var isCorrect = true;
                    for (var i = 0; i < currProblem.choices.length; i++) {
                        if (currProblem.choices[i].is_correct) {
                            if ((typeof userAnswer[currProblem.choices[i].id] === "undefined") ||
                                (!userAnswer[currProblem.choices[i].id])) {
                                isCorrect = false;
                                break;
                            }
                        }
                    }
                    return isCorrect;
                }
            }            
        }

        var getSandbox = function() {
            return new Sandbox();
        }

        return {
            getSandbox: getSandbox
        }
    })




