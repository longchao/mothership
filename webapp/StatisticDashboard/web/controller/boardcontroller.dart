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
import 'package:StatisticDashboard/mixpanel/Mixpanel.dart';
import '../model/event.dart' as sta;
import '../model/computation.dart';

part '../requirements/data_requirement.dart';

JsonObject userInfo;
JsonObject chapterInfo;
String _roomName;

var userInfoUrl = "/me";
var chapterInfoUrl = "/apps?package_name=org.sunlib.exercise&type=chapter";
var allUsersUrl = "/users";

String _allUsersUrl = "web/files/all_user.json";

var currentRoomIndex = 0;
var currentChapterIndex = 0;
Map usersMap;
List<String> users_notLogin = new List<String>();

@NgController(
    selector: '[board]',
    publishAs: 'ctrl',
    visibility: NgController.CHILDREN_VISIBILITY
)
class BoardController {
  List<Map> chapters;
  List<Map> lessons;
  List<sta.Event> events;
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
    _loadAllUsers(rooms);
    giveParamAndLoadEvents();
  }

  _loadAllUsers(var rooms) {
    HttpRequest.getString(_allUsersUrl)
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
    var roomIndex = context['roomIndex'];
    var chapterIndex = context['chapterIndex'];
    if(roomIndex !=null){
      currentRoomIndex = roomIndex;
    }
    if(chapterIndex!=null){
      currentChapterIndex = chapterIndex;
    }
    print("room"+currentRoomIndex.toString()+"chapter"+currentChapterIndex.toString());

    _loadEvents(currentRoomIndex,currentChapterIndex).then((value){
      events = value;

      // attach events to its own lesson!
      for(Map lesson in lessons){
        List eventsOfLesson = new List();
        Map eventsMap = new Map();
        for(sta.Event event in events){
          if(event.info['type'].contains('LearningRelated') && lesson['id'] == event.info['lessonId']){
            eventsOfLesson.add(event);
          }
        }
        eventsMap['events'] = eventsOfLesson;
        lesson.addAll(eventsMap);
      }

      user_notLogin = users_notLogin;
    });
  }

  // Give requirements and load all the data.
  Future<List<sta.Event>> _loadEvents(int roomIndex, int chapterIndex) {
    _roomName = userInfo.roomNames[roomIndex];
    Map chapter = chapterInfo[chapterIndex];
    lessons = chapter['lessons'];

    List statisticEvents = [map_login(),map_notLogin()];
    for (Map lesson in lessons){
      statisticEvents.add(map_enterLesson(lesson['title'],lesson['id']));
      statisticEvents.add(map_finishLesson(lesson['title'],lesson['id']));
    }

    List<sta.Event> result = new List<sta.Event>();
    for(var event in statisticEvents){
      if(event['type'].contains("Mixpanel")){
        Mixpanel mixpanel =new Mixpanel(event['schema'],event['args'],event['api_secret']);
        if(event['lessonId']!=null){
          result.add(new sta.Event(event['title'],event['type'],lessonId:event['lessonId'],mixpanel:mixpanel));
        }else{
          result.add(new sta.Event(event['title'],event['type'],mixpanel:mixpanel));
        }
      }else{
        result.add(new sta.Event(event['title'],event['type']));
      }
    }     
    return new Future<List<sta.Event>>.value(result);
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
    for(sta.Event event in userClickedLesson['events']){
      showUsersByEvent(event);
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
      userCount = event.info['result']['legend_size'];
      Map users = event.info['result']['data']['values'];
      List names = new List.from(users.keys);
      names.forEach((name)=>strUserHtml.write('<div class="col-lg-4">'+name+'</div>'));
    }
    generateEventBlock(title,userCount,strUserHtml);
  }

  generateEventBlock(String title, num userCount, StringBuffer strUserHtml) {
    StringBuffer blockHtml = new StringBuffer();
    String heading = "<div class='panel-heading'><h4>$title($userCount)</h4></div>";
    String content = "<div class='container event-users-container'>$strUserHtml</div>";
    (querySelector('#details-body') as DivElement).insertAdjacentHtml('beforeEnd',heading + content);
  }

  // Query user's Chinese name from username like "xw130301"
  List<String> queryNameFromUsernameList(var users){
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