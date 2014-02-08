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
part 'all_user.dart';

String apiKey = '1291ff9d8ceb337db6a0069d88079474';
String apiSecret = '05b9aae8d5305855b1cdfec0db2db140';
DateTime now = new DateTime.now();
String dateNow = new DateFormat("yyyy-MM-dd").format(now);
int timeFuture = now.add(new Duration(minutes:1)).millisecondsSinceEpoch;
StringBuffer strHtml = new StringBuffer();

JsonObject userInfo;
JsonObject chapterInfo;
String _roomName;

var userInfoUrl = "/users/me";
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
  List<Student> students;
  List<Event> events;
  List<String> rooms;
  Http _http;
  List<Map> allUser;



  BoardController(Http this._http) {
    var user_request = HttpRequest.getString(userInfoUrl).then((value){userInfo = new JsonObject.fromJsonString(value);});
    var chapter_request = HttpRequest.getString(chapterInfoUrl).then(onFirstLoaded);
  }

  void onFirstLoaded(String responseText){
    userInfo = new JsonObject(); // psudo
    userInfo.roomNames = ["xw1303","xw1309"]; //psudo
    rooms = userInfo.roomNames;
    chapterInfo = new JsonObject.fromJsonString(responseText);
    chapters = chapterInfo.toList();
    _loadAllUsers(rooms);
    giveParam(0,0);
  }

  _loadAllUsers(var rooms) {
/*    return _http.get(_allUsersUrl)
    .then((HttpResponse response) {
      print(response.data);
      allUser = new JsonObject.fromJsonString(response.data).toList();
    });//.then(findUsers(rooms));*/
  HttpRequest.getString(_allUsersUrl).then((value){allUser = new JsonObject.fromJsonString(value).toList();findUsers(rooms);
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

      //print("-=-=-=-=-=-=-=-=current room is $room");
      //print(users["$room"]);
    usersMap = users;
    print(users);
  }
  
  void giveParam(int roomIndex,int chapterIndex){
    print("room"+roomIndex.toString()+"chapter"+chapterIndex.toString());
    if(roomIndex !=null){
      currentRoomIndex = roomIndex;
    }

    if(chapterIndex!=null){
      currentChapterIndex = chapterIndex;
    }

    events = _loadEvents(currentRoomIndex,currentChapterIndex);
  }
  
  void showUsers(Event event){
    strHtml.clear();
    if(event.info['event_name']=="未登录"){
      users_notLogin.forEach((item)=>strHtml.write('<p>'+item+'</p>'));
    }else{
      Map users = event.info['result']['data']['values'];
      users.forEach(appendUser);
    }
    (querySelector('#right-panel') as DivElement).innerHtml = strHtml.toString();
  }
  
  appendUser(String key, Map value){
    strHtml.write('<p>'+key+'</p>');//</br><p>'+value.toString()+'</p></br>');
  }
   
  // Give requirements and load all the data.
  _loadEvents(int roomIndex, int chapterIndex) {
    _roomName = userInfo.roomNames[roomIndex];
   // print(_roomName);
    Map chapter = chapterInfo[chapterIndex];
    List<Map> lessons = chapter['lessons'];
    List mixpanelEvents = [map_login(),map_notLogin()];
    for (Map lesson in lessons){
      mixpanelEvents.add(map_enterLesson(lesson['title'],lesson['id']));
      mixpanelEvents.add(map_finishLesson(lesson['title'],lesson['id']));
    }
    
    List<Event> result = new List<Event>();
    
    for(var event in mixpanelEvents ){
      if(event['type']=="mixpanel"){
        MixpanelExportDataAPI mixpanel =new MixpanelExportDataAPI(event['schema'],event['args'],event['api_secret']);
        result.add(new Event(event['title'],mixpanel:mixpanel));
      }else{
        result.add(new Event(event['title']));
      }
    }     
    return result;
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

  Event(String eventName,{MixpanelExportDataAPI mixpanel}){
    info = new Map();
    info['event_name'] = eventName;
    //if(mixpanel!=null);{
        fetchJson(mixpanel:mixpanel,eventName:eventName);
    //}
  }
  
  void fetchJson({MixpanelExportDataAPI mixpanel,String eventName}) {
    Future<js.Proxy> result = jsonp.fetch(
        uriGenerator: (callback) =>
            mixpanel.apiUri+"&callback=$callback");

    result.then((js.Proxy proxy) {
      String jsonValue = js.context.JSON.stringify(proxy);
      Map dartJson = JSON.decode(jsonValue);
      info['result'] = dartJson;

      if(eventName=="已登录"){
        diffNotLoginUsers(dartJson);
      }
    });
  }

  diffNotLoginUsers(Map loginUser){
    List user = usersMap["$_roomName"];
    print(user.toString());
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
   // print(_apiUri);
  }
  
  String get apiUri => Uri.encodeFull(_apiUri);
  
}
class MyAppModule extends Module {
  MyAppModule() {
    type(BoardController);
  }
}

main() {
  ngBootstrap(module: new MyAppModule());
}