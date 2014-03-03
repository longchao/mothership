angular.module('SunNavigator.directives', [])
    .directive("comb", function (SandboxProvider, $http, $templateCache, $compile, $routeParams) {
        var combSandbox = SandboxProvider.getSandbox();

        return {
            restrict: "E",
            templateUrl: 'resources/partials/comb.html',
            link: function ($scope, $element) {
                var sortForLessons = function (lessons) {
                    for (var out = 1; out < lessons.length; out++) {
                        var tmp = lessons[out];
                        var tmpSeq = tmp.seq;
                        var inner = out;
                        while ((lessons[inner - 1]).seq > tmpSeq) {
                            lessons[inner] = lessons[inner - 1];
                            --inner;
                            if (inner <= 0) {
                                break;
                            }
                        }
                        lessons[inner] = tmp;
                    }
                };

                var data = combSandbox.loadChapterMaterial($routeParams.cid);
                if (data) {
                    var lessons = data.lessons;

                    var mainLessonMap = {};
                    var slaveLessonsMap = {};
                    var allLessons = [];
                    lessons.forEach(function (lesson, index) {
                        var requirements = lesson.requirements;
                        var seq = lesson.seq;
                        if (seq == 0 || lesson.mainline) {
                            if (!requirements) {
                                mainLessonMap.header = lesson;
                            } else {
                                var req = requirements[0];
                                mainLessonMap[req] = lesson;
                            }
                        } else {
                            if (!requirements) {
                                if (!slaveLessonsMap.header) {
                                    slaveLessonsMap.header = [];
                                }
                                var slaveLessons = slaveLessons.header;
                                slaveLessons.push(lesson);
                            } else {
                                var req = requirements[0];
                                if (!slaveLessonsMap[req]) {
                                    slaveLessonsMap[req] = [];
                                }
                                var slaveLessons = slaveLessonsMap[req];
                                slaveLessons.push(lesson);
                            }
                        }
                    });

                    var header = mainLessonMap.header;
                    var totalLength = Object.keys(mainLessonMap).length;
                    var count = 0;
                    (function arrCon(lesson) {
                        if (count >= totalLength) {
                            return;
                        }
                        var newArr = [];
                        newArr.push(lesson);
                        allLessons.push(newArr);
                        var newLesson = mainLessonMap[lesson.id];
                        count++;
                        arrCon(newLesson);
                    }(header));

                    allLessons.forEach(function (lessons, index) {
                        var mainLesson = lessons[0];
                        var slaveLessons = slaveLessonsMap[mainLesson.id];
                        Array.prototype.push.apply(lessons, slaveLessons);
                        sortForLessons(lessons);
                    })
                }

                $scope.allLessons = allLessons;
                $compile($element.contents())($scope);
            }
        }
    })


    .directive('lesson', function($routeParams, $location, $http, $q, $templateCache, $compile, $rootScope, SandboxProvider, DataProvider) {
        var lessonSandbox = SandboxProvider.getSandbox();
        var chapterData = lessonSandbox.loadChapterMaterial($routeParams.cid);
        var userInfo = lessonSandbox.loadUserInfo();

        var continueLesson = function (lesson_id, activity_id) {
            window.location = '/webapp/lesson/#/subject/' + $routeParams.sid + '/chapter/' +$routeParams.cid + '/lesson/' + lesson_id + '/activity/' + activity_id;
        }   
        return {
            restrict: 'E',
            link: function($scope, $element) {
                $scope.parentChapter = chapterData;
                var lessonMaterialPromise, lessonUserdataPromise;

                if($scope.obj) {
                    $scope.lesson = $scope.obj.lesson;
                    $scope.lessonId = $scope.lesson.id;
                    $scope.isFirst = $scope.obj.isFirst;

                    lessonMaterialPromise = lessonSandbox.getLessonMaterial($scope.lessonId, $routeParams.cid);
                    lessonUserdataPromise = lessonSandbox.getLessonUserdata($scope.lessonId, $routeParams.cid);

                    $http.get('resources/partials/lesson.html', {cache: $templateCache}).success(function (contents) {
                        $element.html(contents);
                        $compile($element.contents())($scope);
                    });                    
                } else {
                    lessonMaterialPromise = lessonSandbox.getLessonMaterial($routeParams.lid, $routeParams.cid);
                    lessonUserdataPromise = lessonSandbox.getLessonUserdata($routeParams.lid, $routeParams.cid);  
                }

                //record lessonMaterial and lessonUserdata into a object
                var lessonTotalData = {};
                lessonMaterialPromise.then(function (material) {
                    lessonTotalData.material = material;   
                })
                lessonUserdataPromise.then(function (userdata) {
                    lessonTotalData.userdata = userdata;
                })

                $scope.lessonState = "locked";
                $scope.lessonIcon = $scope.lessonIconClass = "lesson-button-icon-locked";
                $scope.lessonStateIcon = "headerLocked";
                $scope.lessonStar = '0';

                //continue logic after initResourcePromise, lessonMaterial and lessonUserdata have been loaded
                var lessonPromise = $q.all([lessonMaterialPromise, lessonUserdataPromise]);
                lessonPromise.then(function() {
                    var lessonData = lessonTotalData.material;
                    var lessonUserdata = lessonTotalData.userdata;//保证在navigator中lesson userdata都只是读取，没有写入修改！！！
                    if(!lessonUserdata) {
                        lessonUserdata = {};
                    }

                    //initialize ng-models
                    $scope.id = lessonData.id;
                    $scope.title = lessonData.title;
                    $scope.summary = lessonData.summary;   
                    $scope.activities = lessonData.activities;

                    if(lessonUserdata.is_complete && lessonUserdata.summary.star) {
                        $scope.lessonIcon = $scope.lessonIconClass = "lesson-button-icon-star" + lessonUserdata.summary.star;
                    } else {
                        $scope.lessonIcon = "lesson-button-icon-unlocked";
                        $scope.lessonIconClass = "lesson-button-icon-unlocked-"+$scope.isFirst;                        
                    }

                     if (typeof lessonUserdata.current_activity === "undefined") {
                        $scope.buttonMsg = "开始学习";
                    } else {
                        $scope.buttonMsg = "继续学习";
                    }                
                    
                    $scope.showLessonDialogue = function () {
                        $('#lessonModal-' + lessonData.id).modal('toggle');

                        if (!lessonUserdata.is_complete) {
                            $scope.startLesson = true;
                            if($scope.me.usergroup == 'teacher') {
                                $scope.startLessonSummary = false;
                                $scope.reviewLessonBody = true;
                            } else {
                                $scope.startLessonSummary = true;
                                $scope.reviewLessonBody = false;
                            }                            
                            $scope.lessonState = "unlocked";
                            $scope.lessonStateIcon = "headerUnlock";
                        } else {
                            //remove activities that are not redoable
                            for (var i = 0; i < lessonData.activities.length; i++) {
                                if ((typeof lessonData.activities[i].redoable !== "undefined") &&
                                    (!lessonData.activities[i].redoable)) {
                                    $scope.activities.splice(i, 1);
                                }
                            }
                            $scope.reviewLesson = true;
                            $scope.reviewLessonBody = true;
                            $scope.lessonState = "review";
                            if (typeof lessonUserdata.summary.star != "undefined") {
                                $scope.lessonStateIcon = "lesson-header-star" + lessonUserdata.summary.star;
                            } else {
                                $scope.lessonStateIcon = "headerUnlock";
                            }
                        }
                    }

                    $scope.enterActivity = function (id) {
                        $rootScope.isBack = false;
                        $('#lessonModal-' + id).modal('hide');
                        $('.modal-backdrop').remove();
                        //Mixpanel
                        LearningRelated.enterLesson($scope.id,$scope.title/*,$scope.parentChapter.id,$scope.parentChapter.title*/);

                        var sid = $routeParams.sid;
                        var cid = $routeParams.cid;
                        var lid = id;   

            /*
                        var resourceSession = {};

                        resourceSession.rootMaterial = lessonSandbox.loadRootMaterial();
                        resourceSession.materialMap = lessonSandbox.loadMaterialMap();
                        resourceSession.lessonsUserdataMap = lessonSandbox.loadLessonsUserdataMap(); 
                        resourceSession.userInfo = lessonSandbox.loadUserInfo();                           
                        resourceSession.me = lessonSandbox.loadMe();   
                        resourceSession.enterActivity = true;                                                          

                        sessionStorage.setItem('resourceSession', angular.toJson(resourceSession));
             */           

             //-=-=-=-==-=-=-=-=-=-==--=-=-=-=-=-=-TEMP-=-=-=-==-=-=-=-=-=-==--=-=-=-=-=-=-
                        var resourceSession = {};
                        resourceSession.chapterUrl = DataProvider.materialMap[cid].url;
                        console.log('write the chapterUrl = '+resourceSession.chapterUrl);
                        sessionStorage.setItem('resourceSession', angular.toJson(resourceSession));

                        if (typeof lessonUserdata.current_activity === "undefined") {
                            var aid = lessonData.activities[0].id;
                            console.log('No CurrentActivity: go to sid='+sid+'   cid='+cid+'   lid='+lid+'    aid='+aid);
                            window.location = '/webapp/lesson/#/subject/' + sid + '/chapter/' + cid + '/lesson/' + lid + '/activity/' + aid;
                        } else {
                            var aid = lessonUserdata.current_activity;   
                            console.log('Have CurrentActivity: go to sid='+sid+'   cid='+cid+'   lid='+lid+'    aid='+aid);
                            window.location = '/webapp/lesson/#/subject/' + sid + '/chapter/' + cid + '/lesson/' + lid + '/activity/' + aid;
                        }
                    }

                     $scope.reviewActivity = function (lessonId, activityId) {
                        $rootScope.isBack = false;
                        $('#lessonModal-' + lessonData.id).modal('hide');
                        $('.modal-backdrop').remove();

       /*                 
                        var resourceSession = {};

                        resourceSession.rootMaterial = lessonSandbox.loadRootMaterial();
                        resourceSession.materialMap = lessonSandbox.loadMaterialMap();
                        resourceSession.lessonsUserdataMap = lessonSandbox.loadLessonsUserdataMap(); 
                        resourceSession.userInfo = lessonSandbox.loadUserInfo();                           
                        resourceSession.me = lessonSandbox.loadMe();  
                        resourceSession.enterActivity = true;                                                                

                        sessionStorage.setItem('resourceSession', angular.toJson(resourceSession));          
     */


                        var sid = $routeParams.sid;
                        var cid = $routeParams.cid;        

                        console.log('Review Activity: go to sid='+sid+'   cid='+cid+'   lid='+lessonId+'    aid='+activityId);
                        window.location = '/webapp/lesson/#/subject/' + sid + '/chapter/' + cid + '/lesson/' + lessonId + '/activity/' + activityId;
                    }
                    //finish initialization, tell chapter directive that this lesson is ready
                    lessonSandbox.emitEvent("lessonLoadedComplete", $scope);   
                })                                      //end of lessonPromise
            }                                               //end of 'link'
        }                                                         //end of 'return'
    })                                                                  //end of 'directive lesson'

    //review template which belongs to lesson view
    .directive("review", function () {
        return {
            restrict: "E",
            templateUrl: 'resources/partials/_showAllActivities.html'
        };
    })

    .directive('fastClick', function($parse, Modernizr) {
        'use strict';
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
            console.log('解析fastClick');
                /**
                 * Parsed function from the directive
                 * @type {*}
                 */
                var fn = $parse(attrs.fastClick);
	   // Track the start points
	var startX, startY, canceled;   //Whether or not we have for some reason cancelled the event.
             var  clickFunction = function (event) {    //Our click function
                        if (!canceled) {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                        }
                    };

             if (Modernizr.touch) {
	    element.on('touchstart', function (event) {  //If we are actually on a touch device lets setup our fast clicks
                     event.stopPropagation();
	        var touches = event.originalEvent.touches;

 	        startX = touches[0].clientX;
                     startY = touches[0].clientY;

                     canceled = false;
                 });

	    element.on('touchend', function (event) {
                     event.stopPropagation();
                     clickFunction();
                  });

                 element.on('touchmove', function (event) {
                      var touches = event.originalEvent.touches;
	         // handles the case where we've swiped on a button
                        if (Math.abs(touches[0].clientX - startX) > 10 ||
                            Math.abs(touches[0].clientY - startY) > 10) {
                            canceled = true;
                        }
                 });
             }

             if (!Modernizr.touch) {   //If we are not on a touch enabled device lets bind the action to click
                 element.on('click', function (event) {
                     clickFunction(event);
                  });
              }
            }
        };
    })

    .provider('Modernizr', function() {
        'use strict';
        this.$get = function() {
        	return Modernizr || {};
        };
    });