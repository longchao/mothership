library statistic;

import 'dart:html';
import 'dart:js';
import 'dart:convert';
import "dart:async";
import "package:js/js.dart" as js;
import "package:jsonp/jsonp.dart" as jsonp;
import 'package:angular/angular.dart';
import 'package:intl/intl.dart';
import 'package:json_object/json_object.dart';
import '../../lib/mixpanel/Mixpanel.dart';
import '../model/event.dart' as sta;

part '../requirements/data_requirement.dart';
part "../model/computation.dart";

JsonObject userInfo;
JsonObject chapterInfo;
String _roomName;

var userInfoUrl = "/me";
var chapterInfoUrl = "/apps?package_name=org.sunlib.exercise&type=chapter";
var allUsersUrl = "/users";

String _allUsersUrl = "web/files/all_user.json";

var currentRoomIndex = 0;
var currentChapterIndex = 0;
Map usersMap = new Map();
List<String> users_notLogin = new List<String>();

@NgController(
    selector: '[board]',
    publishAs: 'ctrl',
    visibility: NgController.CHILDREN_VISIBILITY
)
class BoardController {
  List<Map> chapters;
  List<Map> lessons = new List<Map>();
  List<sta.Event> events = new List<sta.Event>();
  List<String> rooms;
  List<Map> allUser;
  List<String> user_notLogin;

  Map userClickedLesson;
  String detailsTitle;
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
    userInfo = new JsonObject(); // psudo
    userInfo.roomNames = list_schools(); //psudo
    rooms = userInfo.roomNames;
    chapterInfo = new JsonObject.fromJsonString(responseText);
    chapters = chapterInfo.toList();
    _loadAllUsers(rooms).then((_){
      giveParamAndLoadEvents();
    });
  }

  Future _loadAllUsers(var rooms) {
    return HttpRequest.getString(_allUsersUrl)
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
        if(user['username'].contains(room)){
          userList.add(user);
        }
      }
      users["$room"]= userList;
    });
    usersMap = users;
  }

  void giveParamAndLoadEvents(){
    // get Index from seletor.js
    events = [];
    var roomIndex = context['roomIndex'];
    var chapterIndex = context['chapterIndex'];
    if(roomIndex !=null){
      currentRoomIndex = roomIndex;
    }
    if(chapterIndex!=null){
      currentChapterIndex = chapterIndex;
    }
    print("room"+currentRoomIndex.toString()+"chapter"+currentChapterIndex.toString());
    _loadEvents(currentRoomIndex,currentChapterIndex);
  }

 /* // Give requirements and load all the data.
  Future<List<sta.Event>> _loadEvents(int roomIndex, int chapterIndex) {
    _roomName = userInfo.roomNames[roomIndex];
    Map chapter = chapterInfo[chapterIndex];
    lessons = chapter['lessons'];



    List statisticEvents = [map_login(),map_notLogin()];
    for (Map lesson in lessons){
      statisticEvents.add(map_enterLesson(lesson['id'])); // 进入
      statisticEvents.add(map_finishLesson(lesson['id'])); // 已完成
      statisticEvents.add(map_enterButNotFinishLesson(lesson['id'])); // 正在做
      statisticEvents.add(map_notEnterLesson(lesson['id'])); // 未进入
    }

    List<sta.Event> result = new List<sta.Event>();
    Future addEvent = new Future((){
      List some = new List();
      for(var event in statisticEvents){
        if(event['type'].contains("Mixpanel")){ // Mixpanel Event
          Mixpanel mixpanel = new Mixpanel(event['schema'],event['args'],event['api_secret']);
          if(event['type'].contains("LearningRelated")){
            some.add(mixpanel.fetchJson().then((Map dartJson)=>result.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId'],result:dartJson))));
          }else{
            some.add(mixpanel.fetchJson().then((Map dartJson)=>result.add(new sta.Event(eventName:event['title'],type:event['type'],result:mixpanel.result))));
          }
        }else{ // SelfMade Event
          if(event['type'].contains("LearningRelated")){
            result.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId']));
          }else{
            result.add(new sta.Event(eventName:event['title'],type:event['type']));
          }
        }
      }
      Future future_result = Future.wait(some);
      return future_result;
    }).then((_){
      Computation computation = new Computation(lessons,result);
      events = computation.events;
      lessons = computation.lessons;
      user_notLogin = users_notLogin;
    });
  }*/

  // Give requirements and load all the data.
  Future<List<sta.Event>> _loadEvents(int roomIndex, int chapterIndex) {
    _roomName = userInfo.roomNames[roomIndex];
    Map chapter = chapterInfo[chapterIndex];
    List<Map> lessonsMap = chapter['lessons'];
    lessons = lessonsMap;

    List<Map> lessonsList = new List();

    Map statisticEvents = new Map();
    statisticEvents["login"] = map_login();
    statisticEvents["notLogin"] = map_notLogin();

    for (Map lesson in lessonsMap){
      String lessonId = lesson['id'];
      statisticEvents["$lessonId"] = [map_enterLesson(lesson['id']),map_finishLesson(lesson['id']),
      map_enterButNotFinishLesson(lesson['id']),map_notEnterLesson(lesson['id'])];
    }

    for(Map lesson in lessonsMap){ // 每加载并计算一节课的数据，就向Lessons & Events MODEL 中添加相关数据。
      String lessonId = lesson['id'];
      List<sta.Event> result = new List<sta.Event>();
      Future addEvent = new Future((){
        List some = new List();
        for(Map event in statisticEvents['$lessonId']){
          if(event['type'].contains("Mixpanel")){ // Mixpanel Event
            Mixpanel mixpanel = new Mixpanel(event['schema'],event['args'],event['api_secret']);
            if(event['type'].contains("LearningRelated")){
              some.add(mixpanel.fetchJson().then((Map dartJson)=>result.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId'],result:dartJson))));
            }else{
              some.add(mixpanel.fetchJson().then((Map dartJson)=>result.add(new sta.Event(eventName:event['title'],type:event['type'],result:mixpanel.result))));
            }
          }else{ // SelfMade Event
            if(event['type'].contains("LearningRelated")){
              result.add(new sta.Event(eventName:event['title'],seq:event['seq'],type:event['type'],lessonId:event['lessonId']));
            }else{
              result.add(new sta.Event(eventName:event['title'],type:event['type']));
            }
          }
        }
        Future future_result = Future.wait(some);
        return future_result;
      }).then((_){
        Computation computation = new Computation(lesson,result);
        events.addAll(computation.lesson['events']);
        //lessonsList.add(computation.lesson);
        //if(lessonsList.length == lessonsMap.length){
        //lessons = lessonsList;
        //}
        //user_notLogin = users_notLogin;
      });
    }
  }

  void showUsers(bool _isEvent,[sta.Event event = null]){
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
    detailsTitle = userClickedLesson['title'];
    if(userClickedLesson['status']!='closed'){
      for(sta.Event event in userClickedLesson['events']){
        if(!event.info['type'].contains('notDisplay')){
          showUsersByEvent(event);
        }
      }
    }else{
      (querySelector('#details-body') as DivElement).innerHtml = "<h3>本课尚未开放</h3>";
    }
  }

  void showUsersByEvent(sta.Event event){
    var title = event.info['event_name'];
    num userCount;
    StringBuffer strUserHtml = new StringBuffer();

    if(isEvent){  // Single Mode
      if(event.info['event_name']=="已登录"){
        Map users = event.info['result']['data']['values'];
        List users_login = new List.from(users.keys);
        userCount = users_login.length;
        queryNameFromUsernameList(users_login).forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
      }else if(event.info['event_name']=="未登录"){
        userCount = users_notLogin.length;
        queryNameFromUsernameList(users_notLogin).forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
      }
    }else{  // Append Mode
      if(event.info['type'].contains('Mixpanel')){
        userCount = event.info['result']['legend_size'];
        Map users = event.info['result']['data']['values'];
        List userNames = new List.from(users.keys);
        queryNameFromUsernameList(userNames).forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
      }else if(event.info['type'].contains('SelfMade')){
        List users = event.info['result'];
        userCount = users.length;
        users.forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
      }
    }
    generateEventBlock(title,userCount,strUserHtml);
  }

  generateEventBlock(String title, num userCount, StringBuffer strUserHtml) {
    StringBuffer blockHtml = new StringBuffer();
    String heading = "<div class='panel-heading'><h5>$title($userCount)</h5></div>";
    String content = "<div class='container event-users-container'>$strUserHtml</div>";
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