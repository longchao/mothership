/**
 * Created by solomon on 14-1-9.
 */

    var UserRelated = {

        identifyId: function(id,callback){
            mixpanel.identify(id);
        },

        // SP means super properties, which is an usage of Mixpanel.
        registerSP: function(id,user_name,name){
            mixpanel.register({
                UserId:id,
                UserName:user_name,
                Name:name
            });
        },

        login: function(callback){
            mixpanel.track("Login");
        },

        logout: function(){
            mixpanel.track("Logout");
        },

        setActive: function(){
            mixpanel.people.set_once("FirstActive", new Date());
            mixpanel.people.set("LastActive", new Date());
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
            Utils.unregisterSP(false,false,true); //unregister quiz
        },

        finishLesson: function(lesson_id,lesson_title,star,correct_count,correct_percent,pass){
            mixpanel.track("FinishLesson",{LessonId:lesson_id, LessonTitle:lesson_title, Star:star, CorrectCount:correct_count,CorrectPercent:correct_percent, Pass:pass});
            Utils.unregisterSP(false,true,true); //unregister lesson
        }
    }

    var Utils = {
        unregisterSP: function(chapter,lesson,quiz){

            if(chapter){
                mixpanel.unregister("ChapterId");
                mixpanel.unregister("ChapterTitle");
            }

            if(lesson){
                mixpanel.unregister("LessonId");
                mixpanel.unregister("LessonTitle");
            }

            if(quiz){
                mixpanel.unregister("QuizId");
                mixpanel.unregister("QuizTitle");
            }
        }
    }

    //var BrowserRelated = {}

    function initMixpanel(id,user_name,name){
        UserRelated.identifyId(id/*,UserRelated.registerSP(id,user_name,name)*/);
    }

    /*function signIn(){
        UserRelated.login(UserRelated.setActive());
    }*/



