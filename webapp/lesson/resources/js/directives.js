angular.module('SunLesson.directives', [])
    .directive('activity', function($routeParams, $rootScope, $compile, SandboxProvider, DataProvider) {
        return {
            restrict: "E",
            link: function($scope, $element, $attrs) {        
                var activitySandbox = SandboxProvider.getSandbox();
 
                var activityUserdata = activitySandbox.getActivityUserdata($routeParams.aid); 
                DataProvider.lessonUserdata.activities[$routeParams.aid] = activityUserdata;
                var activityData = activitySandbox.getActivityMaterial($routeParams.aid, activityUserdata.seed);
                $scope.current_activity = activityData.id;
                var userInfo = activitySandbox.loadUserInfo();
                DataProvider.userInfo = userInfo;

                $scope.activityTitle = activityData.title;
                var multimediaBody = "<div>" + activityData.body + "</div>";
                $scope.body = $compile(multimediaBody)($scope);  
                $scope.show_summary = false;  
                $scope.rate = activityUserdata.rate;

                if ((typeof activityUserdata.is_complete != "undefined") && (activityUserdata.is_complete)) {
                    activityUserdata = activitySandbox.resetUserdata("activity", activityData.id);
                }       

                if (activityData.type == "quiz") {
                    var currProblem = 0;
                    for (var i = 0; i < activityData.problems.length; i++) {
                        if ((activityUserdata.current_problem != "undefined") &&
                            (activityUserdata.current_problem == activityData.problems[i].id)) {
                                currProblem = i;  
                                break;
                        }
                    }
                    $scope.problems = activityData.problems.slice(currProblem);
                    $scope.problemIndex = currProblem;
                    for (var i = 0; i < $scope.problems.length; i++) {
                        var mIndex = (currProblem + i + 1) + '.';
                        if ($scope.problems[i].type == "multichoice") {
                            mIndex += '(多选题)';
                        }
                        mIndex += ' ';
                        $scope.problems[i].body = mIndex + $scope.problems[i].body;  
                    }
                    $scope.progressWidth = (currProblem + 1) * 100 / activityData.problems.length;

                    LearningRelated.enterQuiz(activityData.id,activityData.title);

                    activityUserdata.start_time = Date.now();
                    $scope.hideContinueButton = true;  
                    angular.forEach(activityData.problems, function (problem, index) {
                        $scope.$on("problemComplete_" + problem.id, function (event, args) {
                            if (index != activityData.problems.length - 1) {
                                $scope.problemIndex = $scope.problemIndex + 1;
                                PageTransitions.nextPage(1, $("#buttonContainer"));
                                activityUserdata.problems[activityData.problems[index+1].id].enter_time = Date.now();
                                $scope.progressWidth = (index + 2) * 100 / activityData.problems.length;      
                                    //scroll to te top
                                    $("#pt-main").scrollTop(0);                                                          
                            } else {
                                activityUserdata.current_problem = undefined;
                                activityUserdata.is_complete = true;

                                var stopTime = Date.now();
                                var duration = stopTime - activityUserdata.start_time;
                                if (typeof activityUserdata.duration == "undefined") {
                                    activityUserdata.end_time = stopTime;
                                    activityUserdata.duration = duration;
                                }

                                var correctCount = 0;
                                for (var k = 0; k < activityData.problems.length; k++) {
                                    if (activityUserdata.problems[activityData.problems[k].id].is_correct) {
                                        correctCount++;
                                    }
                                }

                                if(!activityUserdata.summary) {
                                    activityUserdata.summary = {};
                                }

                                activityUserdata.summary['correct_count'] = correctCount;
                                activityUserdata.summary['correct_percent'] = parseInt(correctCount * 100 / activityData.problems.length);

                          //Mixpanel
                    LearningRelated.finishQuiz($scope.activityId,$scope.activityTitle,activityUserdata.summary['correct_percent']+"%",duration/1000);
                                var lessonSummary = {};
                                if ((typeof activityData.is_final !== "undefined") && (activityData.is_final)) {
                                    lessonSummary.correct_count = correctCount;
                                    lessonSummary.correct_percent = parseInt(correctCount * 100 / activityData.problems.length);
                                }
                                if (typeof activityData.achievements != "undefined") {
                                    var userDataToGrade = {
                                        correct_count: activityUserdata.summary.correct_count,
                                        correct_percent: activityUserdata.summary.correct_percent,
                                        duration: activityUserdata.duration
                                    };

                                    for (var i = 0; i < activityData.achievements.length; i++) {  
                                        if (typeof userInfo.achievements.badges[activityData.achievements[i].id] == "undefined") {
                                            if (typeof activityData.achievements[i].condition != "undefined") {
                                                var grader = activitySandbox.getGrader(activityData.achievements[i].id,
                                                    activityData.achievements[i].condition);
                                            } else {
                                                var grader = activitySandbox.getGrader(activityData.achievements[i].id, "");
                                            }
                                            if (activitySandbox.createGrader(grader, userDataToGrade)) {
                                                activitySandbox.addAchievements("badges", activityData.achievements[i]);
                                            }
                                        }
                                    }
                                }

                                if(activityData.show_summary) {
                                    $scope.showQuizSummary = true;
                                    $scope.hideContinueButton = true;
                                    $scope.quizCorrectCount = correctCount;
                                    $scope.totalProblemsNum = activityData.problems.length;
                                    $scope.quizCorrectPercent = parseInt(correctCount * 100 / $scope.totalProblemsNum) + "%";
                                    $scope.nextActivity = function () { 
                                        $rootScope.isBack = false;
                                        $rootScope.insideBack = false;
                                        if(activityData.jump) {
                                            activitySandbox.completeQuizActivity(activityData, $scope, correctCount, lessonSummary);
                                        }else{
                                            activitySandbox.listenToActivityComplete($scope, {summary: lessonSummary});
                                        }
                                    }                                    
                                }else{
                                    if(activityData.jump) {
                                        activitySandbox.completeQuizActivity(activityData, $scope, correctCount, lessonSummary);
                                    }else{
                                        activitySandbox.listenToActivityComplete($scope, {summary: lessonSummary});
                                    }
                                }
                            }   //end of 'else'   ---if is the last problem
                        });      //end of 'on problemComplete_'
                    });                 //end of forEach
                } else {   //activityData.type is lecture
                    $scope.lecture = true;
                    activityUserdata.start_time = Date.now();
                    //continue
                    $scope.continueActivity = function () {          
                        $rootScope.isBack = false;
                        $rootScope.insideBack = false;
                        activityUserdata.is_complete = true;                        
                        activityUserdata.end_time = Date.now();

                        if (typeof activityData.achievements != "undefined") {
                            for (var i = 0; i < activityData.achievements.length; i++) {
                                if (typeof userInfo.achievements.badges[activityData.achievements[i].id] == "undefined") {
                                    if (typeof activityData.achievements[i].condition != "undefined") {
                                        var grader = activitySandbox.getGrader(activityData.achievements[i].id,
                                            activityData.achievements[i].condition);
                                    } else {
                                        var grader = activitySandbox.getGrader(activityData.achievements[i].id, "");
                                    }

                                    if (activitySandbox.createGrader(grader, "")) {
                                        activitySandbox.addAchievements("badges", activityData.achievements[i]);
                                    }
                                }
                            }
                        }

                        if (typeof activityData.jump != "undefined") { 
                            for (var i = 0; i < activityData.jump.length; i++) {     
                                var jump = activityData.jump[i].split(':');
                                if (jump[0] == 'force_to_activity') {
                                    activitySandbox.listenToActivityComplete($scope, {activity: jump[1]});
                                }
                            }
                        } else {
                            activitySandbox.listenToActivityComplete($scope, {});
                        }
                    }    //end of 'continueActivity function'
                }              //end of 'else'

                $scope.$on("activityStart", function (event) {
                    var activityUserdata = DataProvider.lessonUserdata.activities[$routeParams.aid];
                    activityUserdata.start_time = Date.now();
                })

                $scope.pauseLearn = function () {
                    Utils.unregisterLesson();  

                    var ids = $rootScope.ids;
                    activitySandbox.flushUserdata(ids.lid, ids.cid).then(function(msg) {
                        console.log('write the lessonUserdata current_activity: '+DataProvider.lessonUserdata.current_activity+'current_problem='+DataProvider.lessonUserdata.activities[$routeParams.aid].current_problem);
                       // alert('msg='+msg);
                        window.location = '/webapp/navigator/#/subject/' + ids.sid + '/chapter/' +ids.cid;
                    }, function(err) {
                        alert("pauseLearn write userdata Error!");
                    })            
                }        

                $scope.backToChapter = function() {
                    var ids = $rootScope.ids;
                    activitySandbox.flushUserdata(ids.lid, ids.cid).then(function() {
                        console.log('backToChapter 写入userdata。。。等待跳转');
                        window.location = '/webapp/navigator/#/subject/' + ids.sid + '/chapter/' +ids.cid;
                    }, function(err) {
                        alert('backToChapter write userdata Error');
                    })
                } 
            }   //end of link
        }         //end of return
    })                  //end of directive

    .directive("xvideo", function (SandboxProvider,APIProvider, $compile, $routeParams, $rootScope) {
        var toFullScreen = function (video) {
            //FullScreen First
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen(); // Firefox
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen(); // Chrome and Safari
            }
        }

        //exit fullscreen mode
        var exitFullScreen = function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        }

        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var activitySandbox = SandboxProvider.getSandbox();
                var activityData = activitySandbox.getActivityMaterial($routeParams.aid,null);

                var template = "<div ng-hide='showVideoRating'><video style='display: none' id='video' class='xvideo' src='" +
                    APIProvider.getAPI("getFileResources", {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "") + "/" + $attrs.src
                    + "' controls></video><br>" +
                    "<button class='play-button' ng-click='playVideo()'>{{ playButtonMsg }}</button><br><br></div>" +
                    "<div ng-show='showVideoRating'>" +
                    "<label>你喜欢这个视频吗？</label><br>" +
                    "<input name='videoRating' type='radio' class='star' value='1' title='很不喜欢'/>" +
                    "<input name='videoRating' type='radio' class='star' value='2' title='不喜欢'/>" +
                    "<input name='videoRating' type='radio' class='star' value='3' title='无所谓'/>" +
                    "<input name='videoRating' type='radio' class='star' value='4' title='喜欢'/>" +
                    "<input name='videoRating' type='radio' class='star' value='5' title='很喜欢'/>" +
                    "<script>$('input').rating('select', '" +$scope.rate + "');</script>" +
                    "<label id='ratingMsg'></label><br>" +
                    "<button class='play-button' ng-click='rePlayVideo()'>重新播放</button>" +
                    "</div>";
                $element.html(template);
                var elements = $compile($element.contents())($scope);
                elements.children().filter('input[type=radio].star').rating({
                    callback: function (value, link) {
                        LearningRelated.rateVideo($attrs.src, activityData.title, value);
                        $scope.rate = activityUserdata.rate = value;
                    },
                    focus: function (value, link) {
                        var tip = $('#ratingMsg');
                        tip[0].data = tip[0].data || tip.html();
                        tip.html(link.title);
                    },
                    blur: function (value, link) {
                        var tip = $('#ratingMsg');
                        $('#ratingMsg').html(tip[0].data || '');
                    }
                });

                var start = false;
                var currentTime = 0;
                //get video element and control bar elements
                var video = $element.contents()[0].childNodes[0];
                video.addEventListener("webkitfullscreenchange", function () {
                    //console.log('add listener')
                    if (!document.webkitIsFullScreen) {
                        currentTime = video.currentTime;
                        //Mixpanel
                        LearningRelated.finishVideo($attrs.src,activityData.title,video.duration,currentTime,computeRatio(currentTime/video.duration));
                        video.pause();

                        if (video.ended) {
                            $scope.$apply(function () {
                                $scope.showVideoRating = true;
                            });
                        } else {
                            $scope.$apply(function () {
                                $scope.playButtonMsg = "继续播放";
                            }); 
                        }   
                    }
                });

                //Mixpanel
                var computeRatio = function(ratio){
                    if(ratio>=0 && ratio<=0.2){
                        ratio = "0% ~ 20%";
                    }else if(ratio>0.2 && ratio<=0.4){
                        ratio = "20% ~ 40%";
                    }else if(ratio>0.4 && ratio<=0.6){
                        ratio = "40% ~ 60%";
                    }else if(ratio>0.6 && ratio<=0.8){
                        ratio = "60% ~ 80%";
                    }else if(ratio>0.8 && ratio<=1){
                        ratio = "80% ~ 100%";
                    }else{
                        ratio = "Error";
                    }
                    return ratio;
                }

                $scope.playButtonMsg = "播放视频";
                $scope.playVideo = function () {
                    //Mixpanel
                   // LearningRelated.enterVideo($attrs.src,activityData.title,video.duration);
                    if (video.paused == true) {
                        $scope.playButtonMsg = "暂停播放";
                        //send the activityStart event to activity to record the start_time
                        $scope.$emit("activityStart");

                        if (!start) {
                            toFullScreen(video);
                            video.play();

                            start = true;
                        } else {
                            video.src = video.currentSrc;
                            video.load();

                            toFullScreen(video);
                            video.play();
                        }
                    } else {
                        /**
                         * useless in fullscreen mode
                         */                        
                        video.pause();
                        $scope.playButtonMsg = "继续播放";
                    }
                };

                $scope.rePlayVideo = function () {
                    video.pause();
                    video.currentTime = '0';
                    toFullScreen(video);
                    video.play();
                }

                video.addEventListener("canplay", function () {
                    video.currentTime = currentTime;
                });                
            }
        }
    })

    .directive("hypervideo", function (APIProvider, DataProvider, $compile, $timeout, $templateCache, $http, $rootScope, $routeParams, SandboxProvider) {
//TODO:userdata的填充，MixPanel的填充
        var hvideoSandbox = SandboxProvider.getSandbox();
        var activityData = hvideoSandbox.getActivityMaterial($routeParams.aid);
        var video = activityData.video;
        var problemMaterial = activityData.problems;       

        var videoArray = [];
        var baseUrl = APIProvider.getAPI("getFileResources", {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "") + "/";

        videoArray.push(baseUrl + video.url);
        for (var i = 0; i < problemMaterial.length; i++) {
            if (problemMaterial[i].correct_video && problemMaterial[i].correct_video.url)
                videoArray.push(baseUrl + problemMaterial[i].correct_video.url);
            if (problemMaterial[i].wrong_video && problemMaterial[i].wrong_video.url)
                videoArray.push(baseUrl + problemMaterial[i].wrong_video.url);
        }


        return {
            restrict: "E",
            link: function ($scope, $element) {
                var templateUrl = 'resources/partials/_videoTemplate.html';
                var loadVideoPromise = $http.get(templateUrl, {cache: $templateCache}).success(function (contents) {
                    $element.html(contents);
                    $compile($element.contents())($scope);
                });
                loadVideoPromise.then(function () {
                    $scope.videos = videoArray;
                    $scope.showVideo = {};
                    //get all the video DOM elements and stor them into an array
                    var videoDOMMap = {};
                    var videoDOMMapPromise = $timeout(function () {
                        videoDOMMap[baseUrl + video.url] = $element.contents()[0].children[0];
                        var j = 1;
                        for (var i = 0; i < problemMaterial.length; i++) {
                            if (problemMaterial[i].correct_video && problemMaterial[i].correct_video.url)
                                videoDOMMap[baseUrl + problemMaterial[i].correct_video.url] = $element.contents()[0].children[j++];
                            if (problemMaterial[i].wrong_video && problemMaterial[i].wrong_video.url)
                                videoDOMMap[baseUrl + problemMaterial[i].wrong_video.url] = $element.contents()[0].children[j++];
                        }
                    }, 0);

                    videoDOMMapPromise.then(function () {
                        var videoDOM = videoDOMMap[baseUrl + video.url];
                        var popcorn = Popcorn('#video_0');
                        $scope.showVideo[baseUrl + video.url] = true;
                        videoDOM.play();
                        //add listener for dynamically setting up the width and height of the containers
                        videoDOM.addEventListener('loadedmetadata', function () {
                            var videoWidth = this.videoWidth;
                            var videoHeight = this.videoHeight;
                            $(".videoContainer").css("height", function () {
                                return videoHeight;
                            });
                            $(".videoContainer").css("width", function () {
                                return videoWidth;
                            });
                            $(".problemContainer").css("width", function () {
                                return videoWidth - 40;
                            });
                        });
                        var currentProblem;
                        var pausedTime = '0', enterTime = 0, submitTime = 0, duration = 0;
                        $scope.showChoice = [];
                        $scope.isSelected = [];
                        $scope.choiceMsg = [];
                        angular.forEach(problemMaterial, function (problem) {
                            popcorn.cue(problem.show_time, function () {
                                videoDOM.pause();
                                videoDOM.removeAttribute('controls');
                                pausedTime = videoDOM.currentTime;
                                currentProblem = problem;
                                $scope.$apply(function () {
                                    $scope.choices = problem.choices;
                                    $scope.showProblem = true;
                                    enterTime = Date.now();
                                    // dynamically set the "left" css attribute
                                    $timeout(function () {
                                        for (var i = 0; i < problem.choices.length; i++)
                                            $("#choiceContainer_" + i).css("left", function () {
                                                var marginLeft = ($(".videoContainer").width() -
                                                    problem.choices.length * 160) / 2;
                                                return marginLeft + 160 * i;
                                            });
                                    }, 0);
                                    if (problem.type == "singlechoice") {
                                        for (var i = 0; i < problem.choices.length; i++)
                                            $scope.choiceMsg[i] = String.fromCharCode(65 + i)
                                    } else {
                                        $scope.choiceMsg[0] = "正确";
                                        $scope.choiceMsg[1] = "错误";
                                    }
                                })
                            })
                        });

                        var hyperVideo = function (videoObj, index) {
                            $scope.showVideo[baseUrl + video.url] = false;
                            $scope.showVideo[baseUrl + videoObj.url] = true;
                            $scope.hasSelected = true;
                            var subVideo = videoDOMMap[baseUrl + videoObj.url];
                            subVideo.removeAttribute('controls');
                            videoDOM.removeAttribute('controls');
                            subVideo.play();
                            subVideo.addEventListener("ended", function () {
                                subVideo.pause();
                                $scope.$apply(function () {
                                    $scope.showProblem = false;
                                    $scope.showVideo[baseUrl + videoObj.url] = false;
                                    $scope.showVideo[baseUrl + video.url] = true;
                                    $scope.hasSelected = false;
                                    $scope.isSelected[index] = null;
                                })
                                if (typeof videoObj.jump != "undefined")
                                    pausedTime = videoObj.jump;
//                                video.src = video.currentSrc;
                                videoDOM.setAttribute('controls', 'controls');
//                                video.load();
                                videoDOM.play();
                                $scope.showVideo[baseUrl + video.url] = true;
                                $scope.showVideo[baseUrl + videoObj.url] = false;
                            })
                        };
                        $scope.chooseOption = function (index) {
                            /**
                             * TODO Mixpanel submit answer
                             */
                            $scope.isSelected[index] = "selected";
                            submitTime = Date.now();
                            duration = submitTime - enterTime;
                            if (currentProblem.choices[index].is_correct) {
                                if (typeof currentProblem.correct_video != "undefined") {
                                    hyperVideo(currentProblem.correct_video, index);
                                } else {
                                    $scope.showProblem = false;
                                    $scope.isSelected[index] = null;
                                    currentProblem++;  //TODO:
//                                    video.src = video.currentSrc;
                                    videoDOM.setAttribute('controls', 'controls');
//                                    video.load();
                                    videoDOM.play();
                                }
                            } else {
                                if (typeof currentProblem.wrong_video != "undefined") {
                                    hyperVideo(currentProblem.wrong_video, index);
                                } else {
                                    $scope.showProblem = false;
                                    $scope.isSelected[index] = null;
                                    currentProblem++;  
//                                    video.src = video.currentSrc;
                                    videoDOM.setAttribute('controls', 'controls');
//                                    video.load();
                                    videoDOM.play();
                                }
                            }
                        };

                        //add listener for resume mainstream video
                        videoDOM.addEventListener('canplay', function () {
                            videoDOM.currentTime = pausedTime;
                        });
                    })
                })  // end of videoDOMMapPromise
            }
        }
    })    

    .directive("xaudio", function (APIProvider, $compile, $routeParams) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var template = "<audio class='xaudio' src='" + APIProvider.getAPI("getFileResources", {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "")
                    + "/" + $attrs.src + "' controls></audio>";
                $element.html(template);
                $compile($element.contents())($scope);
            }
        }
    })

    .directive("ximage", function (APIProvider, $compile, $routeParams, $rootScope) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var template = "<img class='ximage' src='" + APIProvider.getAPI("getFileResources", {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "")
                    + "/" + $attrs.src + "' />";
                $element.html(template);
                $compile($element.contents())($scope);
            }
        }
    })

    .directive("xpdf", function (APIProvider, $compile, $routeParams) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var template = "<button class='play-button' ng-click='openReader()'>打开PDF</button>";
                $element.html(template);
                $compile($element.contents())($scope);

                //send the activityStart event to activity to record the start_time
                $scope.$emit("activityStart");

                // Go to previous page
                $scope.goPrevious = function () {
                    if (pageNum <= 1)
                        return;
                    pageNum--;
                    renderPage(pageNum);
                }
                // Go to next page
                $scope.goNext = function () {
                    if (pageNum >= pdfDoc.numPages)
                        return;
                    pageNum++;
                    renderPage(pageNum);
                }
                // Become fullcreen reading
                $scope.fullscreen = function () {
                    var container = $element.contents()[0];
                    scale = 'pafe-fit';
                    container.webkitRequestFullScreen();
                }

                // Asynchronously download PDF as an ArrayBuffer
                var pdf_url = APIProvider.getAPI("getFileResources",
                    {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "")
                    + "/"
                    + encodeURI($attrs.src);
                $scope.openReader = function () {
                    parent.openPDF(pdf_url);
                }
            }
        }
    })

    //the outsider of problem directive used for getting the problem DOM collection
    .
    directive("switch", function ($timeout) {
        return {
            link: function ($scope, $element) {
                $timeout(function () {
                    PageTransitions.initParams($element);
                }, 0);
            }
        }
    })

    //problem module
    .directive("problem", function (SandboxProvider, $compile, $http, $templateCache, DataProvider, $routeParams) {
        var problemSandbox = SandboxProvider.getSandbox();

        return {
            restrict: "E",
            link: function ($scope, $element) {
                var currProblem = $scope.problem;
                var parentActivityData = problemSandbox.getParentActivityData(currProblem.parent_id);   
                var activityUserdata = problemSandbox.getActivityUserdata($routeParams.aid);                

                var current_activity = $scope.current_activity;        
                var problemUserdata = DataProvider.lessonUserdata.activities[current_activity].problems[currProblem.id];             

                var templateUrl = 'resources/partials/choiceTemplates/_' + currProblem.type + 'Template.html';
                $http.get(templateUrl, {cache: $templateCache}).success(function (contents) {
                    $element.html(contents);
                    $compile($element.contents())($scope);  
                });

                $scope.submitIcon = "submitDisable";
                if (currProblem.type == "singlechoice") {
                    $scope.type = "单选题";
                } else if (currProblem.type == "multichoice") {
                    $scope.type = "多选题";
                } else {
                    $scope.type = "单填空题";
                }  

                $scope.calcChoiceNum = function (index) {
                    return String.fromCharCode(65 + index) + ".";
                };  

                if ((typeof parentActivityData.show_answer !== "undefined") && (parentActivityData.show_answer)) {
                    if (currProblem.type != "singlefilling") {
                        $scope.correct_answers = [];
                        for (var i = 0; i < currProblem.choices.length; i++) {
                            if (currProblem.choices[i].is_correct) {
                                $scope.correct_answers.push(String.fromCharCode(65 + i));
                            }
                        }  
                        $scope.correct_answers = $scope.correct_answers.join(",");
                    } else {
                        $scope.correct_answers = currProblem.correct_answer;
                    }
                    if(currProblem.explanation) {
                        currProblem.explanation = "<div>" + currProblem.explanation + "</div>";
                        $scope.explanation = $compile(currProblem.explanation)($scope);
                    }
                }                                          
 
                if ((typeof currProblem.layout != "undefined") && (currProblem.layout == "card")) {
                    $scope.layout = "card";
                    $scope.colNum = "6";
                } else {
                    $scope.layout = "list";
                    $scope.colNum = "12";
                }                


                var multimediaBody = "<div>" + currProblem.body + "</div>";
                $scope.body = $compile(multimediaBody)($scope);

                if (currProblem.type != "singlefilling") {
                    $scope.choiceBody = {};
                    $scope.correct_answer_body = {};
                    for (var i = 0; i < currProblem.choices.length; i++) {
                        if (currProblem.choices[i].is_correct) {
                            $scope.correct_answer_body[currProblem.id] = currProblem.choices[i].body;
                        }
                        var choiceMultimediaBody = "<div>" + currProblem.choices[i].body + "</div>";
                        $scope.choiceBody[currProblem.choices[i].id] = $compile(choiceMultimediaBody)($scope);
                    }
                }else if(currProblem.type == 'singlefilling'){
                    if(!$scope.correct_answer_body) {
                        $scope.correct_answer_body = {};
                    }
                }

                $scope.madeChoice = false;
                $scope.answer = {};   
                $scope.user_answer_body = {};  //for MixPanel
                $scope.correct_answer_body = {};  //for MinxPanel

                if (currProblem.type != "singlefilling") {         
                    $scope.checked = [];
                    for (var i = 0; i < currProblem.choices.length; i++) {
                        $scope.checked.push("default");
                    }

                    var singleChoice = function (choiceId, choiceIndex) {
                        if ($scope.madeChoice) {  
                            return;
                        }
                        $scope.madeChoice = true;
                        $scope.checked[choiceIndex] = "choose";
                        $scope.answer[currProblem.id] = choiceId;
                        
                        $scope.submitAnswer();
                    };

                    var multiChoice = function (choiceId, choiceIndex) {
                        $scope.chosenNum = 0;                        
                        $scope.madeChoice = true;
                        if (!$scope.submitted) {   
                            //change submit icon
                            $scope.submitIcon = "submit";
                            if ($scope.checked[choiceIndex] == "choose") {
                                $scope.checked[choiceIndex] = "default";
                                $scope.answer[choiceId] = false;
                                $scope.chosenNum--;
                            } else {
                                $scope.checked[choiceIndex] = "choose";
                                $scope.answer[choiceId] = true;
                                $scope.chosenNum++;
                            }

                            if ($scope.chosenNum == 0) {
                                $scope.submitIcon = "submitDisable";
                            }
                        }
                    };

                    if (currProblem.type == "singlechoice") {
                        $scope.chooseOption = singleChoice;
                    } else if (currProblem.type == "multichoice") {
                        $scope.chooseOption = multiChoice;
                    } else if (currProblem.type == "singlefilling") {
                        console.log("hit");
                    }

                } else {   
                    var singleFilling = function (answer) {                
                        if ((typeof answer != "undefined") && (answer.length > 0)) {
                            $scope.submitIcon = "submit";
                        } else {
                            $scope.submitIcon = "submitDisable";
                        }
                    }
                    $scope.problemResult = "default";
                    $scope.writeAnswer = singleFilling;
                    $scope.madeChoice = true;
                }

                $scope.hasExplanation = function () {
                    return (typeof currProblem.explanation != "undefined");
                }

                if (typeof currProblem.hint !== "undefined") {
                    problemUserdata.is_hint_checked = false;
                    $scope.hint = currProblem.hint;
                    $scope.showHintButton = true;
                    $scope.showHint = function () {
                        $scope.showHintBox = true;
                        problemUserdata.is_hint_checked = true;
                    }
                } 

                $scope.submitAnswer = function () {
                    console.log('answer='+$scope.answer[currProblem.id]);
                    if((currProblem.type != 'singlefilling' && !$scope.madeChoice) || (currProblem.type == 'singlefilling' && (!$scope.answer[currProblem.id] || ($scope.answer[currProblem.id].length == 0)))) {
                        var answer = confirm('还没有做出选择，继续下一道题？');
                        if(!answer) {
                            return;
                        }
                    }

                    //TODO:
                    activityUserdata.current_problem = $scope.problems[$scope.problemIndex + 1].id;

                    var ids = [];
                    if(currProblem.type == 'singlechoice') {
                        ids.push($scope.answer[currProblem.id]);
                        $scope.user_answer_body[currProblem.id] = getChoiceBody(ids, currProblem.choices);
                    }else if(currProblem.type == 'singleFilling') {
                        $scope.user_answer_body[currProblem.id] = $scope.answer[currProblem.id];
                    }else if(currProblem.type == 'multichoice') {
                        ids = Object.keys($scope.answer);
                        if(ids.length == $scope.chosenNum) {
                            console.log('应该是正确的！！！');
                        }
                        $scope.user_answer_body = getChoiceBody(ids, currProblem.choices);
                    }


                    problemUserdata.submit_time = Date.now();
                    $scope.submitted = true; 
                    if (typeof currProblem.hint !== "undefined" && $scope.showHintBox) {
                        $scope.showHintBox = false;
                    }

                    if ($scope.answer !== null) {
                        if (currProblem.type === "multichoice") { 
                            problemUserdata.is_correct = problemSandbox.problemGrader(currProblem, $scope.answer);
                            if (problemUserdata.is_correct) {
                                problemSandbox.playSoundEffects("correct");
                            } else {
                                problemSandbox.playSoundEffects("wrong");
                            }

                            for (var i = 0; i < currProblem.choices.length; i++) {  
                                if ((typeof $scope.answer[currProblem.choices[i].id] !== "undefined") &&
                                    ($scope.answer[currProblem.choices[i].id])) {
                                    problemUserdata.answer.push(currProblem.choices[i].id);
                                }
                            }
                        } else {  
                            if (typeof $scope.answer[currProblem.id] !== "undefined") {
                                problemUserdata.is_correct = problemSandbox.problemGrader(currProblem, $scope.answer);
                                if (problemUserdata.is_correct) {
                                    problemSandbox.playSoundEffects("correct");
                                } else {
                                    problemSandbox.playSoundEffects("wrong");
                                }
                                problemUserdata.answer.push($scope.answer[currProblem.id]);
                            }
                        }
                    }  

                    if ((typeof parentActivityData.show_answer !== "undefined") && (parentActivityData.show_answer)) {
                        $scope.showExplanation = true;
                        $scope.hideSubmitButton = true;
                        $scope.showContinueButton = true;

                        if (currProblem.type != "singlefilling") {
                            for (var i = 0; i < currProblem.choices.length; i++) {
                                if (currProblem.choices[i].is_correct) {
                                    $scope.checked[i] = "correct";
                                } else if (((currProblem.type == "singlechoice") &&
                                    ($scope.answer[currProblem.id] == currProblem.choices[i].id)) ||
                                    ((currProblem.type == "multichoice") &&
                                        ($scope.answer[currProblem.choices[i].id]))) {
                                    $scope.checked[i] = "wrong";
                                }
                            }
                        } else {
                            if (problemUserdata.is_correct) {
                                $scope.problemResult = "success";
                            } else {
                                $scope.problemResult = "error";
                            }
                        }
                    }  //end of if show_answer
                }        //end of submit answer

                var getChoiceBody = function(ids, choices) {
                    var result = '';
                    for(var i=0;i<ids.length;i++) {
                        for(var j=0;j<choices.length;j++) {
                            if(choices[j].id == ids[i]) {
                                result += choices[j].body;
                            }
                        }
                    }
                    return result;
                } 

                $scope.continueProblem = function () {
                    LearningRelated.finishProblem(currProblem.id,currProblem.body,currProblem.type, $scope.correct_answer_body[currProblem.id],
                        $scope.user_answer_body[currProblem.id], problemUserdata.is_correct, problemUserdata.is_hint_checked, (problemUserdata.submit_time-problemUserdata.enter_time)/1000);

                    problemSandbox.sendEvent('problemComplete_' + currProblem.id, $scope, {});
                }
            }
        }
    })

    //math formula rendered  
    .directive("mathjaxBind", function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
                function ($scope, $element, $attrs) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.$watch($attrs.mathjaxBind, function (value) {
                                $element.html(value == undefined ? "" : value);
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
                            });
                        });
                    }, 0);
                }]
        };
    })

    .directive('fastClick', function ($parse, Modernizr) {
        'use strict';
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                /**
                 * Parsed function from the directive
                 * @type {*}
                 */
                var fn = $parse(attrs.fastClick),


                    /**
                     * Track the start points
                     */
                        startX,

                    startY,

                    /**
                     * Whether or not we have for some reason
                     * cancelled the event.
                     */
                        canceled,

                    /**
                     * Our click function
                     */
                        clickFunction = function (event) {
                        if (!canceled) {
                            scope.$apply(function () {
                                fn(scope, {$event: event});
                            });
                        }
                    };


                /**
                 * If we are actually on a touch device lets
                 * setup our fast clicks
                 */
                if (Modernizr.touch) {

                    element.on('touchstart', function (event) {
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

                /**
                 * If we are not on a touch enabled device lets bind
                 * the action to click
                 */
                if (!Modernizr.touch) {
                    element.on('click', function (event) {
                        clickFunction(event);
                    });
                }
            }
        };
    })