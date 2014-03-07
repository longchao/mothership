angular.module('SunNavigator.controllers', [])
    .controller('RootCtrl', function ($scope, $location, $rootScope, me, rootMaterial) {
        console.log('进入RootCtrl！！！！！！！');
        $rootScope.isBack = false;
        var mathSubject = _.find(rootMaterial.subjects, function (subject) {
            return (subject.id == 'math');
        })
        if (mathSubject) {
            $location.path('/subject/' + mathSubject.id);
        } else {
            $location.path('/subject/' + rootMaterial.subjects[0].id);
        }
    })

    .controller('SubjectCtrl', function ($scope, $location, $route, $routeParams, $rootScope, $http, SandboxProvider, me, rootMaterial) {
        var subjectSandbox = SandboxProvider.getSandbox();

        $scope.subjects = rootMaterial.subjects;
        $scope.me = me;
        initMixpanel(me._id);

        var params = $route.current.params;
        console.log('routeParams=' + $routeParams.sid);

        $scope.completeLoading = true;
        var subjectMaterial = subjectSandbox.loadSubjectMaterial($routeParams.sid);
        $scope.chapters = subjectMaterial.chapters;
        $scope.title = subjectSandbox.getAllSubjectNames()[subjectMaterial.title] || subjectMaterial.title;

        var hasShown = false;
        $scope.showSubjectsNav = function () {
            if (!hasShown) {
                $scope.offsetWidth = "25%";
            } else {
                $scope.offsetWidth = "0";
            }
            hasShown = !hasShown;
        };

        $scope.hasCached = {};
        $scope.loadProgress = {};
        $scope.showProgress = {};
        angular.forEach(subjectMaterial.chapters, function (chapter) {
            var currentStatusPromise = subjectSandbox.getCurrentChapterStatus(chapter.id);
            currentStatusPromise.then(function (status) {
                $scope.hasCached[chapter.id] = status;
                if (chapter.id === "22953b7f-266c-4070-98dc-2d2df53a7239") {
                    chapter.style = "updated";
                }
            })
        })

        $scope.enterSubject =    function (subjectId) {
            $rootScope.isBack = false;
            $location.path('/subject/' + subjectId);
        }

        $scope.enterChapter = function (chapterId, chapterTitle) {
            LearningRelated.enterChapter(chapterId, chapterTitle);
            $rootScope.isBack = false;

            if ($scope.hasCached[chapterId]) {
                $location.path('/subject/' + $routeParams.sid + '/chapter/' + chapterId);
            } else {
                $scope.downloadChapterResource(chapterId);
            }
        }

        $scope.downloadChapterResource = function (chapterId) {
            $scope.showProgress[chapterId] = true;
            var chapterMaterialPromise = subjectSandbox.fetchChapterResources(chapterId);
            chapterMaterialPromise.then(function (data) {   //not msg!!!
                console.log('Loading single chapter resource : ' + chapterId);
                $scope.hasCached[chapterId] = true;
            }, function (err) {
                console.log('Load single chapter resource Error : ' + err);
            }, function (progressData) {
                $scope.loadProgress[chapterId] = progressData;
            })
        };

        $scope.enterAchievementCenter = function () {
            $rootScope.isBack = false;
            $location.path('/achievements');
        };

        $scope.signout = function () {
            if (!!window.sessionStorage) {
                //sessionStorage.setItem('resourceSession', undefined);
                sessionStorage.clear();
            }
            if (!sessionStorage.getItem('resourceSession')) {
                console.log('销毁sessionStorage！！！');
            }
            $http.get('/signout')
                .success(function (data) {
                    var me = subjectSandbox.loadMe();
                    me = null;
                    window.location = '/webapp/login';
                })
                .error(function (err) {
                    console.log('Signout Error:  ' + err);
                })
        };
    })

    .controller('ChapterCtrl', function ($scope, $rootScope, $location, $routeParams, $q, $timeout, SandboxProvider, me, rootMaterial, DataProvider) {
        console.log('进入了ChapterCtrl..');

        //backToChapter---内循环  subjectToChpater---外循环
        $scope.me = me;
        var chapterSandbox = SandboxProvider.getSandbox();
        var chapterData = chapterSandbox.loadChapterMaterial($routeParams.cid);
        console.log('chpater.url=' + chapterData.url + '===========================');
        if (!chapterData) {
            var resourceSession = angular.fromJson(sessionStorage.getItem('resourceSession'));
            DataProvider.materialMap = resourceSession.materialMap;
            chapterData = DataProvider.materialMap[$routeParams.cid];
            if (!chapterData) {
                console.log('Error：还是没取到chapterData');
                return;
            } else {
                console.log('拿到了chapterData');
            }
            //console.log('Error:  Not get the chapterData');
            //return;
        }

        $scope.chapterTitle = chapterData.title;
        $scope.lessons = chapterData.lessons;
        var lessonState = {};
        for (var i = 0; i < chapterData.lessons.length; i++) {
            lessonState[chapterData.lessons[i].id] = false;
        }

        angular.forEach(chapterData.lessons, function (lesson, index) {
            chapterSandbox.getLessonUserdata(lesson.id, chapterData.id)
                .then(function (userdata) {
                    if (userdata.is_complete) {
                        lessonState[lesson.id] = true;
                    }
                });
        });

//TODO: 
        $scope.lessonIsLoaded = function (lesson) {
            //console.log('lessonIsLoaded....');
            var user = me;
            if (lesson.status == 'closed') {
                return false;
            }

            if (user.usergroup == 'teacher') {
                return true;
            }

            //var lesson = chapterData.lessons[lessonIndex];
            if (typeof lesson.requirements == 'undefined') {
                return true;
            } else {
                for (var i = 0; i < lesson.requirements.length; i++) {
                    if (!lessonState[lesson.requirements[i]]) {
                        return false;
                    }
                }
                return true;
            }
        };

        $scope.mShowLockDialogue = function (mid) {
            var id = mid;
            $("#lessonModal-" + id).modal("toggle");
        };

        $scope.returnToSubject = function () {
            //Mixpanel
            Utils.unregisterChapter();
            $rootScope.isBack = false;
            $rootScope.shouldReload = false;
            $location.path('/subject/' + $routeParams.sid);
        };

        //lessons loader
        if ($rootScope.shouldReload) {
            $('#lessonLoaderModal').modal('show');
            var unlockLessons = 0, successCalls = 0;
            angular.forEach(chapterData.lessons, function (lesson, index) {
                if ($scope.lessonIsLoaded(lesson))
                    unlockLessons++;
            });
            var minLoadTimeLimit = $timeout(function () {
            }, 1000);
            var deferred = $q.defer();
            var loadingPromise = deferred.promise;
            $scope.$on('lessonLoadedComplete', function () {
                successCalls++;
                if (successCalls == unlockLessons)
                    deferred.resolve();
            });
            $q.all([minLoadTimeLimit, loadingPromise]).then(function () {
                $('#lessonLoaderModal').modal('hide');
            });
        }

    })  //end of ChpaterCtrl

    .controller('achievementsCtrl', function ($scope, $rootScope, $location, achievementsMaterial, userInfo) {
        $scope.completeDownload = true;
        $scope.badges = achievementsMaterial.badges;
        $scope.awards = achievementsMaterial.awards;

        $scope.badgeName = {};
        $scope.badgeStatus = {};
        $scope.awardName = {};
        if (typeof userInfo.achievements.badges != "undefined") {
            var currentBadges = 0;
            for (var i = 0; i < $scope.badges.length; i++) {
                if (typeof userInfo.achievements.badges[$scope.badges[i].id] != "undefined") {
                    $scope.badgeName[$scope.badges[i].id] = $scope.badges[i].id;
                    $scope.badgeStatus[$scope.badges[i].id] = "unlocked";
                    currentBadges++;
                } else {
                    $scope.badgeName[$scope.badges[i].id] = "unknown-badge";
                    $scope.badgeStatus[$scope.badges[i].id] = "locked";
                }
            }
            $scope.currentBadges = currentBadges;
        }

        if (typeof userInfo.achievements.awards != "undefined") {
            var currentAwards = 0;
            for (i = 0; i < $scope.awards.length; i++) {
                if (typeof userInfo.achievements.awards[$scope.awards[i].id] != "undefined") {
                    $scope.awardName[$scope.awards[i].id] = $scope.awards[i].id;
                    currentAwards++;
                } else {
                    $scope.awardName[$scope.awards[i].id] = "unknown-award";
                }
            }
            $scope.currentAwards = currentAwards;
        }

        $('#achievementTab a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        })

        $scope.enterAward = function (id) {
            $rootScope.isBack = false;
            $location.path('/achievements/awards/' + id);
        }
        $scope.returnToSubject = function () {
            $rootScope.isBack = false;
            $location.path('/');
        }
    })

    .controller('awardsCtrl', function ($scope, $routeParams, achievementsMaterial) {
        var awardId = $routeParams.aid;
        for (var i = 0; i < achievementsMaterial.awards.length; i++) {
            if (achievementsMaterial.awards[i].id == awardId) {
                $scope.title = achievementsMaterial.awards[i].title;
                $scope.url = achievementsMaterial.awards[i].url;
                break;
            }
        }

        $scope.returnToAchievements = function () {
            $rootScope.isBack = false;
            $location.path('/achievements');
        }
    });