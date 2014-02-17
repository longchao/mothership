library event;
class Event{
  Map info;

  Event({String eventName, List type, int seq, Map result, String lessonId}){
    info = new Map();
    if (eventName!=null){
      info['event_name'] = eventName;
    }
    if (type!=null){
      info['type'] = type;
      if(type.contains('LearningRelated')){ // for learning events
        info['lessonId'] = lessonId;
      }
    }

    if(seq!=null){
      info['seq'] = seq;
    }

    if(result!=null){
      info['result'] = result;
    }
  }
}   