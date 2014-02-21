part of statistic;

class Computation {
  Map _lesson;
  List<sta.Event> _events;
  List<Map> _allUsersList = usersMap["$_roomName"];
  List<String> _users_all = new List<String>();

  Computation( List<sta.Event> events, {Map lesson}) {
    this._events = events;
    if(lesson!=null){
      this._lesson = lesson;
      _computeValue();  // For learning events
    }else{
      _diffNotLoginUsers();  // For login events
    }
  }

  void _diffNotLoginUsers(){
    _events.sort((sta.Event a,sta.Event b)=>(a.info['seq'] as int).compareTo((b.info['seq'] as int)));
    for(sta.Event event in _events){
      if(event.info['event_name']=="未登录"){
        List<String> usersAllList = new List<String>();
        _allUsersList.forEach((item)=>usersAllList.add(item['username']));
        List loginList = new List.from(new Map.from(_events[0].info['result']['data']['values']).keys);
        event.info['result'] = _diffUsers(usersAllList,loginList);
      }
    }
  }

  // diff user who is in list1 but not list2
  List _diffUsers(List list1, List list2){
    List users = new List();
    list1.forEach((item){
      if(!list2.contains(item)){
        users.add(item);
      }
    });
    return BoardController.queryNameFromUsernameList(users);
  }

  List<sta.Event> _computeValue(){
    _bindEventToLesson();
    for (sta.Event event in _lesson['events']){
      if(event.info['event_name']=="正在做"){
        List enterList = new List.from(new Map.from(_lesson['events'][0].info['result']['data']['values']).keys);
        List finishList = new List.from(new Map.from(_lesson['events'][1].info['result']['data']['values']).keys);
        event.info['result'] = _diffUsers(enterList,finishList);
      }

      if(event.info['event_name']=="未进入"){
        _allUsersList.forEach((item)=>_users_all.add(item['username']));
        List enterList = new List.from(new Map.from(_lesson['events'][0].info['result']['data']['values']).keys);
        event.info['result'] = _diffUsers(_users_all,enterList);
      }
    }
  }

  void _bindEventToLesson(){
    _events.sort((sta.Event a,sta.Event b)=>(a.info['seq'] as int).compareTo((b.info['seq'] as int)));
    Map eventsMap = new Map();
    eventsMap['events'] = _events;
    _lesson.addAll(eventsMap);
  }

  get events =>_events;
  get lesson =>_lesson;
}

