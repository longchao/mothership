library filters;

import 'package:angular/angular.dart';
import '../model/event.dart' as sta;

@NgFilter(name: 'schoolfilter')
class SchoolFilter {
  call(List<String> rooms, school) {
    if(school=="xw"){
      List<String> xwClasses = new List<String>();
      for(String room in rooms){
        if(room.contains("xw")){
          xwClasses.add(room);
        }
      }
      return  xwClasses;
    }else if(school=="8z"){
      List<String> z8Classes = new List<String>();
      for(String room in rooms){
        if(room.contains("8z")){
          z8Classes.add(room);
        }
      }
      return  z8Classes;
    }
  }
}

@NgFilter(name: 'eventfilter')
class EventFilter {
  call(List<sta.Event> events,String type,String lessonId){
    List<sta.Event> learningEvents = new List<sta.Event>();
    List<sta.Event> loginEvents = new List<sta.Event>();
    List<sta.Event> apiEvents = new List<sta.Event>();
    if(type=="LoginRelated"){
      for (sta.Event event in events){
        List eventType = event.info['type'];
        if(eventType.contains(type)&&!eventType.contains('notDisplay')){
          loginEvents.add(event);
        }
      }
      return loginEvents;
    }else if(type=="LearningRelated"){
      for (sta.Event event in events){
        List eventType = event.info['type'];
        if(eventType.contains(type)&& !eventType.contains('notDisplay')){
          if(lessonId == event.info['lessonId'] ){
            learningEvents.add(event);
          }
        }
      }
      return learningEvents;
    }/*else if(type=="APIRelated"){
      for (sta.Event event in events){
        if(event.info['type'].contains(type)){
          apiEvents.add(event);
        }
      }
    }*/
  }
}
