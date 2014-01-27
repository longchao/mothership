library statistic;

import 'dart:html';
import 'dart:js';
import 'dart:convert';
import "package:js/js.dart" as js;
import "dart:async";
import "package:jsonp/jsonp.dart" as jsonp;
import 'package:crypto/crypto.dart';
import 'package:angular/angular.dart';
import 'package:intl/intl.dart';
import 'package:message/message.dart';
import 'package:json_object/json_object.dart';

part 'requirement_product.dart';

String apiKey = '1291ff9d8ceb337db6a0069d88079474';
String apiSecret = '05b9aae8d5305855b1cdfec0db2db140';
DateTime now = new DateTime.now();
String dateNow = new DateFormat("yyyy-MM-dd").format(now);
int timeFuture = now.add(new Duration(minutes:1)).millisecondsSinceEpoch;
String _roomName;
StringBuffer strHtml = new StringBuffer();
var userInfoUrl = "/users/me";
var lessonInfoUrl = "apps?package_name=org.sunlib.exercise&type=chapter";


@NgController(
    selector: '[board]',
    publishAs: 'ctrl')
class BoardController {

  List<Student> students;
  List<Event> events;
  
  BoardController() {
  //  students = _loadUserData();
  //  events = _loadEvents();
  }
  
  void giveRoom(){ 
    (querySelector('#right-panel') as DivElement).innerHtml="";
    _roomName = (querySelector("#inputRoomName") as InputElement).value;
    events = _loadEvents();    
  }
  
  void showUsers(Event event){
    Map users = event.info['result']['data']['values'];
    strHtml.clear();
    users.forEach(appendUser);
    (querySelector('#right-panel') as DivElement).innerHtml = strHtml.toString();  
  }
  
  appendUser(String key, Map value){
    strHtml.write('<p>'+key+'</p></br><p>'+value.toString()+'</p></br>');
  }
   
  // Give requirements and load all the data.
  _loadEvents() {
    List<String> lessons = ["章节预习","对顶角基础","邻补角基础","同位角基础"]; // TODO: should get available lessons from api.
    List mixpanelEvents = [map_login()];
    for (String lesson in lessons){
      mixpanelEvents.add(map_enterLesson(lesson));
      mixpanelEvents.add(map_finishLesson(lesson));
    }
    
    List<Event> result = new List<Event>();
    
    for(var event in mixpanelEvents ){
      if(event['type']=="mixpanel"){
        MixpanelExportDataAPI mixpanel =new MixpanelExportDataAPI(event['schema'],event['args'],event['api_secret']);
        result.add(new Event(event['title'],mixpanel:mixpanel));
      }else{
        assert(event['type']=="selfMade");
        result.add(new Event(event['title']));
      }
    }     
    return result;
  }
  
  //String jsonDataAsString = '''''';


  List<Student> _loadUserData() {
   // File allUserFile = new File("../all_user_xw1303.json");
   // Future<String> future = allUserFile.readAsString(UTF8);
   // future.then((value)=>handleValue(value))
         // .catchError((error)=>context['console'].callMethod('log', [error.toString()]));
    return handleValue(jsonDataAsString);
  }
  
  List<Student> handleValue(value){
    List parsedList = JSON.decode(value);
    List<Student> result = new List<Student>();;
    
    for(var i=0;i<parsedList.length;i++){
        result.add(new Student(parsedList[i]["id"],
            parsedList[i]["name"],parsedList[i]["number"]));
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
  //Student _student;
  
  Event(String eventName,{MixpanelExportDataAPI mixpanel}){
    info = new Map();
    info['event_name'] = eventName;
    if(mixpanel!=null);{
      fetJson(mixpanel);
    }
  }
  
  void fetJson(MixpanelExportDataAPI mixpanel) {
    Future<js.Proxy> result = jsonp.fetch(
        uriGenerator: (callback) =>
            mixpanel.apiUri+"&callback=$callback");

    result.then((js.Proxy proxy) {
      String jsonValue = js.context.JSON.stringify(proxy);
      Map dartJson = JSON.decode(jsonValue);
      info['result'] = dartJson; 
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
    print(_apiUri);
  }
  
  String get apiUri => Uri.encodeFull(_apiUri);
  
}
class MyAppModule extends Module {
  MyAppModule() {
    type(BoardController);
  }
}

void onDataLoaded(String responseText){
  JsonObject data = new JsonObject.fromJsonString(responseText);
  //JsonObject userInfo = new JsonObject();
  //userInfo.roomName = ["初一9班","初一10班"];
  print(data.toString());
  print(data.name);
}

main() {
  ngBootstrap(module: new MyAppModule());
  var request = HttpRequest.getString(userInfoUrl).then(onDataLoaded);
}