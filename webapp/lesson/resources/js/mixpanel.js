/**
 * Created by solomon on 14-1-9.
 */

    var UserRelated = {

        identifyId: function(id,callback){
            mixpanel.identify(id);
        },

        // SP means super properties, which is an usage of Mixpanel.
        registerSP: function(id,user_name,name,user_group){
            mixpanel.register({
                UserId:id,
                UserName:user_name,
                Name:name,
                UserGroup:user_group
            });
        },

        login: function(callback){
            mixpanel.track("Login");
        },

        logout: function(){
            mixpanel.track("Logout");
        },

        setActive: function(callback){
            mixpanel.people.set_once("FirstActive", new Date());
            mixpanel.people.set("LastActive", new Date());
        },

        setProfile: function(id,user_name,name,user_group){
            mixpanel.people.set({
                UserId:id,
                UserName:user_name,
                $name:name, // SP to show on Profile MainPage.
                UserGroup:user_group
            })
        }
    }


    var LearningRelated = {

        enterChapter: function(chapter_id,chapter_title){
            mixpanel.track("EnterChapter",{ChapterId:chapter_id, ChapterTitle:chapter_title});
            mixpanel.register({ChapterId:chapter_id,ChapterTitle:chapter_title});
        },

        enterLesson: function(lesson_id,lesson_title){
            mixpanel.track("EnterLesson",{LessonId:lesson_id, LessonTitle:lesson_title});
            mixpanel.register({LessonId:lesson_id,LessonTitle:lesson_title});
        },

/*
        enterVideo: function(id,title,length,parent_lesson_id,parent_lesson_title,parent_chapter_id,parent_chapter_title){
            mixpanel.track("EnterVideo",{VideoId:id, VideoTitle:title,VideoLength:length});
        },
*/

        finishVideo: function(id,title,length,played_length,played_ratio){
            mixpanel.track("FinishVideo",{VideoId:id, VideoTitle:title, VideoLength:Math.floor(length), VideoPlayedLength:Math.floor(played_length), VideoPlayedRatio:played_ratio});
        },

        rateVideo: function(id,title,rating){
            mixpanel.track("RateVideo",{VideoId:id, VideoTitle:title, VideoRating:rating});
        },

        enterQuiz: function(quiz_id,quiz_title){
            mixpanel.track("EnterQuiz",{QuizId:quiz_id, QuizTitle:quiz_title});
            mixpanel.register({QuizId:quiz_id,QuizTitle:quiz_title});
        },

        finishProblem: function(id,body,type,correct_answer,user_answer,correct_or_not,hint_or_not,time_spent){
            mixpanel.track("FinishProblem",{
                ProblemId:id,
                ProblemBody:body,
                ProblemType:type,
                CorrectAnswer:correct_answer,
                UserAnswer:user_answer,
                CorrectOrNot:correct_or_not, //boolean
                HintOrNot:hint_or_not, //boolean,
                TimeSpent:time_spent
            });
        },

        //quitQuiz: function(id,title,time_spent){ //should unregister quiz
        //    mixpanel.track("QuitQuiz",{QuizId:id, QuizTitle:title, TimeSpent:time_spent});
        //},

        finishQuiz: function(quiz_id,quiz_title,correctRatio,time_spent){
            mixpanel.track("FinishQuiz",{QuizId:quiz_id,QuizTitle:quiz_title,CorrectRatio:correctRatio,TimeSpent:Math.floor(time_spent)});
            Utils.unregisterQuiz();
        },

        finishLesson: function(lesson_id,lesson_title,star,correct_count,correct_percent,pass){
            mixpanel.track("FinishLesson",{LessonId:lesson_id, LessonTitle:lesson_title, Star:star, CorrectCount:correct_count,CorrectPercent:correct_percent, Pass:pass});
            Utils.unregisterLesson();
        },

        quitChapter: function(){
            Utils.unregisterChapter();
        }
    }

    var Utils = {

        unregisterQuiz: function(){
            mixpanel.unregister("QuizId");
            mixpanel.unregister("QuizTitle");
        },

        unregisterLesson: function(){
            this.unregisterQuiz();
            mixpanel.unregister("LessonId");
            mixpanel.unregister("LessonTitle");
        },

        unregisterChapter: function(){
            this.unregisterLesson();
            mixpanel.unregister("ChapterId");
            mixpanel.unregister("ChapterTitle");
        }
    }

    //var BrowserRelated = {}

    function initMixpanelWithSP(id,user_name,name,user_group){
        UserRelated.identifyId(id,UserRelated.registerSP(id,user_name,name,user_group));
    }

    function initMixpanel(id){
        UserRelated.identifyId(id);
    }

    function signIn(id,user_name,name,user_group){
        UserRelated.login(UserRelated.setActive(UserRelated.setProfile(id,user_name,name,user_group)));
    }

    function unregisterAllSP(){
        Utils.unregisterChapter();
    }


