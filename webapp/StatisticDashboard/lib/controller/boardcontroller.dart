library statistic;

import 'dart:html';
import 'dart:js';
import "dart:async";
import 'package:angular/angular.dart';
import 'package:intl/intl.dart';
import 'package:json_object/json_object.dart';
import 'package:js/js.dart' as js;
import '../model/Mixpanel.dart';
import '../model/event.dart' as sta;
part '../requirements/data_requirement.dart';
part '../model/computation.dart';

JsonObject userInfo;
JsonObject fakeUserInfo;
JsonObject chapterInfo;
String _roomName;

var userInfoUrl = "/me";
var chapterInfoUrl = "/apps?package_name=org.sunlib.exercise&type=chapter";
var allUsersUrl = "/users";

//String chapterInfoUrl = "files/all_chapter.json";
//String allUsersUrl = "files/all_user.json";
String exerciseSchema = "/webapp/navigator/#/subject/";

var currentRoomIndex = 0;
var currentChapterIndex = 0;
Map usersMap = new Map();
List<String> users_notLogin = new List<String>();

@NgController(
    selector: '[board]',
    publishAs: 'ctrl',
    visibility: 'children'
)
class BoardController {
  List<Map> chapters;
  List<Map> lessons = new List<Map>();
  List<List<Map>> rowLessons = new List<List<Map>>();
  List<sta.Event> events = new List<sta.Event>();
  List<String> rooms;
  List<Map> allUser;
  List<String> user_notLogin;
  Map user = new Map();
  Map currentChapter = new Map();
  Map userClickedLesson;
  String detailstitle;
  num eventNumber;

  String panelDetails = '';
  bool isEvent = true;

  String XW = "xw";
  String Z8 = "8z";

  BoardController() {
    var user_request = HttpRequest.getString(userInfoUrl)
      .then((value)=>userInfo = new JsonObject.fromJsonString(value));
    var chapter_request = HttpRequest.getString(chapterInfoUrl).then(onFirstLoaded);
  }

  void onFirstLoaded(String responseText){
    js.context.jQuery("#right-panel").fadeOut();
    user = userInfo;
    //fakeUserInfo = new JsonObject(); // psudo
    //fakeUserInfo.roomNames = list_schools(); //psudo
    //rooms = list_schools();
    rooms = user['rooms'];
    chapterInfo = new JsonObject.fromJsonString(responseText);
    chapters = chapterInfo.toList();
    _loadAllUsersAndFindUsers(rooms).then((_){
      giveParamAndLoadEvents();
    });
  }

  Future _loadAllUsersAndFindUsers(var rooms) {
    return HttpRequest.getString(allUsersUrl)
    .then((value){
      allUser = new JsonObject.fromJsonString(value).toList();
      findUsers(rooms);
    });
  }

  findUsers(List rooms){
    Map users = new Map();
    rooms.forEach((room){
      List<Map> userList = new List<Map>();
      for (var user in allUser){
        String userName = user['username'];
        if(userName != null && userName.contains(room)){
          userList.add(user);
        }
      }
      users["$room"]= userList;
    });
    usersMap = users;
  }

  void giveParamAndLoadEvents(){  
    js.context.jQuery("#right-panel").fadeOut();
    js.context.jQuery('#lessonLoaderModal').modal('show');
    events.clear();
    detailstitle = "";
    (querySelector("#details-body") as DivElement).innerHtml = "";
    // get Index from seletor.js
    var roomIndex = context['roomIndex'];
    var chapterIndex = context['chapterIndex'];
    if(roomIndex !=null){
      events = [];
      currentRoomIndex = roomIndex;
    }
    if(chapterIndex!=null){
      rowLessons = [];
      currentChapterIndex = chapterIndex;
    }
    _loadEvents(currentRoomIndex,currentChapterIndex).then((_){
      js.context.jQuery('#lessonLoaderModal').modal('hide');
    });
  }

  List<List<Map>> makeCombLesson(List<Map> lessons) {
    Map allLessons = new Map();
    for(var lesson in lessons){
      //if(lesson['mainline']==true){
      // MainLineLesson
      if(lesson['seq']==0){   
        List rowLesson = new List();
        rowLesson.add(lesson);
        String lessonId = lesson['id'];
        allLessons[lessonId] = rowLesson;
      }else{
        allLessons.forEach((String k,List v){
          List requirements = lesson['requirements'];
          if(k==requirements[0]){
            v.add(lesson);
          }
        });
      }
    }
    List rowLessons = new List();
    allLessons.forEach((k,v){
      rowLessons.add(v);
    });
    return rowLessons;
  }

  void onLessonClick(Map lesson){
    userClickedLesson = lesson;
    showUsers(false);
  }
  
  //open the lesson within exercise
  void openLesson(MouseEvent evt, Map lesson){
    evt.preventDefault();
    String url = exerciseSchema + currentChapter['subject'] +"/chapter/"+
        currentChapter['id'];
    window.open(url,"提高班");
  }
  
  // Give requirements and load all the data.
  Future<List<sta.Event>> _loadEvents(int roomIndex, int chapterIndex) {
    List loadingLessonCards = new List();
    //_roomName = fakeUserInfo.roomNames[roomIndex];
    _roomName = rooms[roomIndex];
    currentChapter = chapterInfo[chapterIndex];
    List<Map> lessonsMap = currentChapter['lessons'];
    lessons = lessonsMap;
    rowLessons = makeCombLesson(lessons);// for fast show CombLesson.

    Map statisticEvents = new Map();
    statisticEvents['LoginRelated'] = [map_login(),map_notLogin()];
    List<sta.Event> loginEvents = new List<sta.Event>();
    new Future((){
      // Request loginEvents data.
      List loadingData = new List();
      for(Map event in statisticEvents['LoginRelated']){
        if(event['type'].contains("Mixpanel")){ // Mixpanel Event
          Mixpanel mixpanel = new Mixpanel(event['schema'],event['args'],event['api_secret']);
          loadingData.add(mixpanel.fetchJson().then((Map dartJson)=>loginEvents.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],result:mixpanel.result))));
        }else{ // SelfMade Event
          loginEvents.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type']));
        }
      }
      return Future.wait(loadingData);
    }).then((_){
      // Compute and add loginEvents to View.
      Computation computation = new Computation(loginEvents);
      events.addAll(computation.events);
    });

    // Request LearningEvents data and compute it to bind to View.
    for (Map lesson in lessonsMap){
      String lessonId = lesson['id'];
      statisticEvents['$lessonId'] = [map_enterLesson(lessonId),map_finishLesson(lessonId),
      map_enterButNotFinishLesson(lessonId),map_notEnterLesson(lessonId)];

      List<sta.Event> learningEvents = new List<sta.Event>();
      loadingLessonCards.add(new Future((){
        List loadingData = new List();
        for(Map event in statisticEvents['$lessonId']){
          if(event['type'].contains("Mixpanel")){ // Mixpanel Event
            Mixpanel mixpanel = new Mixpanel(event['schema'],event['args'],event['api_secret']);
            loadingData.add(mixpanel.fetchJson().then((Map dartJson)=>learningEvents.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId'],result:mixpanel.result))));
          }else{ // SelfMade Event
            learningEvents.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId']));
          }
        }
        return Future.wait(loadingData);
      }).then((_){
        Computation computation = new Computation(learningEvents,lesson:lesson);
        events.addAll(computation.lesson['events']);
      }));
    }
    return Future.wait(loadingLessonCards);
  }

  void showUsers(bool _isEvent,[sta.Event event = null]){
    js.context.jQuery("#right-panel").fadeIn();
    isEvent = _isEvent;
    (querySelector('#details-body') as DivElement).innerHtml = "";
    if(_isEvent && event!=null){
      showUsersByEvent(event);
    }else{
      if(!_isEvent){
        showUsersByLesson();
      }else{
        print("Error input");
      }
    }
  }

  void showUsersByLesson(){
    detailstitle = userClickedLesson['title'];
    if(userClickedLesson['status']!='closed'){
      for(sta.Event event in userClickedLesson['events']){
        List eventType = event.info['type'];
        if(!eventType.contains('notDisplay')){
          showUsersByEvent(event);
        }
      }
    }else{
      (querySelector('#details-body') as DivElement).innerHtml = "<h3>本课尚未开放</h3>";
    }
  }

  void showUsersByEvent(sta.Event event){
    List eventType = event.info['type'];
    var title = event.info['event_name'];
    num userCount;
    StringBuffer strUserHtml = new StringBuffer();

    if(eventType.contains('Mixpanel')){
      userCount = event.info['result']['legend_size'];
      Map users = event.info['result']['data']['values'];
      List userNames = new List.from(users.keys);
      queryNameFromUsernameList(userNames).forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
    }else if(eventType.contains('SelfMade')){
      List users = event.info['result'];
      userCount = users.length;
      users.forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
    }
    generateEventBlock(title,userCount,strUserHtml);
  }

  generateEventBlock(String title, num userCount, StringBuffer strUserHtml) {
    StringBuffer blockHtml = new StringBuffer();
    String heading = "<div class='panel-heading'><h5><strong>$title($userCount)</strong></h5></div>";
    String content = "<div class='event-users-container clearfix'>$strUserHtml</div>";
    (querySelector('#details-body') as DivElement).insertAdjacentHtml('beforeEnd',heading + content);
  }

  // Query user's Chinese name from username like "xw130301"
  static List<String> queryNameFromUsernameList(var users){
    assert(users is List);
    List<String> names = new List<String>();
    for (var singleUser in usersMap["$_roomName"]){
      if(users.contains(singleUser['username'])){
        names.add(singleUser['name']);
      }
    }
    return names;
  }
}