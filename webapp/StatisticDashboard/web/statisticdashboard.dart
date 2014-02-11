library statistic;

import 'dart:html';
import 'dart:js';
import 'dart:convert';
import "dart:async";
import "package:js/js.dart" as js;
import "package:jsonp/jsonp.dart" as jsonp;
import 'package:crypto/crypto.dart';
import 'package:angular/angular.dart';
import 'package:intl/intl.dart';
import 'package:json_object/json_object.dart';

part 'requirement_product.dart';
part 'filters.dart';

String apiKey = '1291ff9d8ceb337db6a0069d88079474';
String apiSecret = '05b9aae8d5305855b1cdfec0db2db140';
DateTime now = new DateTime.now();
String dateNow = new DateFormat("yyyy-MM-dd").format(now);
int timeFuture = now.add(new Duration(minutes:1)).millisecondsSinceEpoch;
StringBuffer strHtml = new StringBuffer();

JsonObject userInfo;
JsonObject chapterInfo;
String _roomName;

var userInfoUrl = "/me";
var chapterInfoUrl = "/apps?package_name=org.sunlib.exercise&type=chapter";
var allUsersUrl = "";

String _allUsersUrl = "web/files/all_user.json";

var currentRoomIndex = 0;
var currentChapterIndex = 0;
Map usersMap;
List<String> users_notLogin = new List<String>();

@NgController(
    selector: '[board]',
    publishAs: 'ctrl')
class BoardController {
  List<Map> chapters;
  List<Map> lessons;
  List<List<Map>> rowLessons;
  List<Event> events;
  List<String> rooms;
  List<Map> allUser;
  List<String> user_notLogin;

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
    giveParam();
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
    //print(users);
  }
  
  void giveParam(){
    (querySelector('#users_container') as DivElement).innerHtml = "";
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
      user_notLogin = users_notLogin;
    });
  }
  
  void showUsersByEvent(Event event){
    strHtml.clear();
    //strHtml.write('<div class="panel-heading"><h4>'+event.info['event_name']+'</h4></div>');
    if(event.info['event_name']=="已登录"){
      Map users = event.info['result']['data']['values'];
      List users_login = new List();
      users.forEach((k,v){
        users_login.add(k);
      });
      queryUserNames(users_login).forEach((item)=>strHtml.write('<p>'+item+'</p>'));
    }else if(event.info['event_name']=="未登录"){
      queryUserNames(users_notLogin).forEach((item)=>strHtml.write('<p>'+item+'</p>'));
    }else{
      Map users = event.info['result']['data']['values'];
      users.forEach(appendUser);
    }
    print(strHtml.toString());

    (querySelector('#users_container') as DivElement).innerHtml = strHtml.toString();
  }

  List<String> queryUserNames(var users){
    List<String> names = new List<String>();
    for (var singleUser in usersMap["$_roomName"]){
      if(users.contains(singleUser['username'])){
        names.add(singleUser['name']);
      }
    }
    return names;
  }
  
  appendUser(String key, Map value){
    strHtml.write('<p>'+key+'</p>');//</br><p>'+value.toString()+'</p></br>');
  }

  makeCombLesson(List<Map> lessons) {
    Map allLessons = new Map();
    for(var lesson in lessons){
      if(lesson['mainline']==true){
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
    print(rowLessons);
    return rowLessons;
  }

  Future<Map> addMainlineLessons(List lessons) {
    Map allLessons = new Map();
    for(var lesson in lessons){
      if(lesson['mainline']==true){
        List rowLesson = new List();
        rowLesson.add(lesson);
        String lessonId = lesson['id'];
        allLessons[lessonId] = rowLesson;
      }
    }
    return new Future<Map>.value(allLessons);
  }

  // Give requirements and load all the data.
  Future<List<Event>> _loadEvents(int roomIndex, int chapterIndex) {
    _roomName = userInfo.roomNames[roomIndex];
    Map chapter = chapterInfo[chapterIndex];
    lessons = chapter['lessons'];
    rowLessons = makeCombLesson(lessons);

    List mixpanelEvents = [map_login(),map_notLogin()];
    //List mixpanelEvents = new List();
    for (Map lesson in lessons){
      mixpanelEvents.add(map_enterLesson(lesson['title'],lesson['id']));
      mixpanelEvents.add(map_finishLesson(lesson['title'],lesson['id']));
    }

    List<Event> result = new List<Event>();
    for(var event in mixpanelEvents){
      print(event['type']);
      if(event['type'].contains("Mixpanel")){
        MixpanelExportDataAPI mixpanel =new MixpanelExportDataAPI(event['schema'],event['args'],event['api_secret']);
        result.add(new Event(event['title'],event['type'],lessonId:event['lessonId'],mixpanel:mixpanel));
      }else{
        result.add(new Event(event['title'],event['type']));
      }
    }     
    return new Future<List<Event>>.value(result);
  }
}

class Student{
  int userId;
  String name;
  String userName;
  Student(this.userId,this.name,this.userName);
}

class Event{
  Map info;

  Event(String eventName, List type, {String lessonId, MixpanelExportDataAPI mixpanel}){
    info = new Map();
    info['event_name'] = eventName;
    info['type'] = type;

    if(lessonId!=''){
      info['lessonId'] = lessonId;
    }

    if(mixpanel!=null);{
      fetchJson(mixpanel:mixpanel,eventName:eventName);
    }
  }
  
  fetchJson({MixpanelExportDataAPI mixpanel,String eventName}) {
    Future<js.Proxy> result = jsonp.fetch(
        uriGenerator: (callback) =>
            mixpanel.apiUri+"&callback=$callback");

    result.then((js.Proxy proxy) {
      String jsonValue = js.context.JSON.stringify(proxy);
      Map dartJson = JSON.decode(jsonValue);
      if(eventName=="已登录"){
        diffNotLoginUsers(dartJson);
      }
      info['result'] = dartJson;
    });
  }

  diffNotLoginUsers(Map loginUser){
    users_notLogin.clear();
    List user = usersMap["$_roomName"];
    var loginusers = loginUser['data']['values'];
    List<String> users_all = new List<String>();
    List<String> users_login = new List<String>();
    user.forEach((item)=>users_all.add(item['username']));
    loginusers.forEach((k,v)=>users_login.add(k));
    users_all.forEach((item){
      if (!users_login.contains(item)){
        users_notLogin.add(item);
      }
    });
  }
}    

class MixpanelExportDataAPI{
  String _sig;
  String _apiUri;
  
  String _sigGenerator(List<String> args, String api_secret){ 
    var md5 = new MD5();
    args.sort();
    List<int> bytes = UTF8.encode(args.join()+api_secret);  
    md5.add(bytes);
    return CryptoUtils.bytesToHex(md5.close());
  }

  MixpanelExportDataAPI(String schema, List<String> args, String api_secret){
    _sig = _sigGenerator(args,api_secret);
    args.add("sig="+_sig);
    _apiUri = schema + "?" + args.join('&');
  }
  
  String get apiUri => Uri.encodeFull(_apiUri);
}

class MyAppModule extends Module {
  MyAppModule() {
    type(BoardController);
    type(SchoolFilter);
    type(EventFilter);
  }
}

main() {
  ngBootstrap(module: new MyAppModule());
}