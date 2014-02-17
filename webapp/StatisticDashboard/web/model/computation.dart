/*
part of statistic;
class Computation {
  List<Map> _lessons;
  List<sta.Event> _events;
  List<Map> _allUsersList = usersMap["$_roomName"];
  List<String> _users_all = new List<String>();

  Computation(List<Map> lessons, List<sta.Event> events) {
    this._lessons = lessons;
    this._events = events;
    computeValue();
  }

  _diffNotLoginUsers(){
    Map loginUsers = new Map();
    for(sta.Event event in _events){
      if (event.info['event_name']=="已登录"){
        loginUsers = event.info['result']['data']['values'];
      }
    }
    users_notLogin.clear();
    List user = usersMap["$_roomName"];
    List<String> users_all = new List<String>();
    List<String> users_login = new List<String>();
    user.forEach((item)=>users_all.add(item['username']));
    loginUsers.forEach((k,v)=>users_login.add(k));
    users_all.forEach((item){
      if (!users_login.contains(item)){
        users_notLogin.add(item);
      }
    });
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

  List<sta.Event> computeValue(){
    _diffNotLoginUsers();
    bindEventToLesson();
    for(Map lesson in _lessons){
      for (sta.Event event in lesson['events']){
        if(event.info['event_name']=="正在做"){
          List enterList = new List.from(new Map.from(lesson['events'][0].info['result']['data']['values']).keys);
          List finishList = new List.from(new Map.from(lesson['events'][1].info['result']['data']['values']).keys);
          print(enterList);
          print(finishList);
          event.info['result'] = _diffUsers(enterList,finishList);
        }

        if(event.info['event_name']=="未进入"){
          _allUsersList.forEach((item)=>_users_all.add(item['username']));
          List enterList = new List.from(new Map.from(lesson['events'][0].info['result']['data']['values']).keys);
          event.info['result'] = _diffUsers(_users_all,enterList);
        }
      }
    }
  }

  void bindEventToLesson(){
    for(Map lesson in _lessons){
      List eventsOfLesson = new List();
      Map eventsMap = new Map();
      for(sta.Event event in _events){
        if(event.info['type'].contains('LearningRelated')
        && lesson['id'] == event.info['lessonId']){
          eventsOfLesson.add(event);
        }
      }
      eventsOfLesson.sort((sta.Event a,sta.Event b)=>(a.info['seq'] as int).compareTo((b.info['seq'] as int)));
      eventsMap['events'] = eventsOfLesson;
      lesson.addAll(eventsMap);
    }
  }
  get events =>_events;
  get lessons=>_lessons;
}
*/

part of statistic;

class Computation {
  Map _lesson;
  List<sta.Event> _events;
  List<Map> _allUsersList = usersMap["$_roomName"];
  List<String> _users_all = new List<String>();

  Computation(Map lesson, List<sta.Event> events) {
    this._lesson = lesson;
    this._events = events;
    computeValue();
  }

  _diffNotLoginUsers(){
    Map loginUsers = new Map();
    for(sta.Event event in _events){
      if (event.info['event_name']=="已登录"){
        loginUsers = event.info['result']['data']['values'];
      }
    }
    users_notLogin.clear();
    List user = usersMap["$_roomName"];
    List<String> users_all = new List<String>();
    List<String> users_login = new List<String>();
    user.forEach((item)=>users_all.add(item['username']));
    loginUsers.forEach((k,v)=>users_login.add(k));
    users_all.forEach((item){
      if (!users_login.contains(item)){
        users_notLogin.add(item);
      }
    });
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

  List<sta.Event> computeValue(){
    //_diffNotLoginUsers();
    bindEventToLesson();
    for (sta.Event event in lesson['events']){
      if(event.info['event_name']=="正在做"){
        List enterList = new List.from(new Map.from(lesson['events'][0].info['result']['data']['values']).keys);
        List finishList = new List.from(new Map.from(lesson['events'][1].info['result']['data']['values']).keys);
        event.info['result'] = _diffUsers(enterList,finishList);
      }

      if(event.info['event_name']=="未进入"){
        _allUsersList.forEach((item)=>_users_all.add(item['username']));
        List enterList = new List.from(new Map.from(lesson['events'][0].info['result']['data']['values']).keys);
        event.info['result'] = _diffUsers(_users_all,enterList);
      }
    }
  }

  void bindEventToLesson(){
      _events.sort((sta.Event a,sta.Event b)=>(a.info['seq'] as int).compareTo((b.info['seq'] as int)));
      Map eventsMap = new Map();
      eventsMap['events'] = _events;
      _lesson.addAll(eventsMap);
  }

  get events =>_events;
  get lesson=>_lesson;
}

