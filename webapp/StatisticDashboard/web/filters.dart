part of statistic;

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
  call(List<Event> events,String type,String lessonId){
    List<Event> learningEvents = new List<Event>();
    List<Event> loginEvents = new List<Event>();
    if(type=="LoginRelated"){
      for (Event event in events){
        if(event.info['type'].contains(type)){
          loginEvents.add(event);
        }
      }
      return loginEvents;
    }else if(type=="LearningRelated"){
      for (Event event in events){
        if(event.info['type'].contains(type)){
          if(lessonId == event.info['lessonId']){
            learningEvents.add(event);
          }
        }
      }
      return learningEvents;
    }
  }
}
