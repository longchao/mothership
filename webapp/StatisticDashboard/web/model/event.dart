library event;

import 'dart:convert';
import "dart:async";
import "package:js/js.dart" as js;
import "package:jsonp/jsonp.dart" as jsonp;
import 'package:StatisticDashboard/mixpanel/Mixpanel.dart';

class Event{

  Map info;

  Event(String eventName, List type, {String lessonId, Mixpanel mixpanel}){
    info = new Map();
    info['event_name'] = eventName;
    info['type'] = type;

    // for learning events
    if(lessonId!=''){
      info['lessonId'] = lessonId;
    }

    // for mixpanel events
    if(mixpanel!=null);{
      fetchJson(mixpanel:mixpanel,eventName:eventName);
    }
  }

  fetchJson({Mixpanel mixpanel,String eventName}) {
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