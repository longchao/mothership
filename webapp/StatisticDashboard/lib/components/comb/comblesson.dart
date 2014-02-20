library comb;

import 'dart:html' as dom;
import 'package:angular/angular.dart';
import '../../model/event.dart' as sta;

@NgComponent(
    selector: 'comblesson',
    templateUrl: '../lib/components/comb/comblesson.html',
    cssUrl: '../lib/components/comb/comblesson.css',
    publishAs: 'comb',
    map: const {
      'lessons-data': '=>setRowLessons',
      'events-data': '<=>events',
      'on-lesson-click': '&onLessonClick'
    }
)
class CombLesson implements NgShadowRootAware {
  List<List<Map>> rowLessons = new List<List<Map>>();
  List<sta.Event> events = new List<sta.Event>();
  var onLessonClick;
  NgModel ngModel;
  CombLesson(this.ngModel);
  onShadowRoot(dom.ShadowRoot shadowRoot){}

  set setRowLessons(List<Map> value){
    rowLessons = makeCombLesson(value);
  }

  void onItemClicked(Map lesson){
    print("-=-=-=-=-=-=-=-=-=-=> "+lesson['id']);
    ngModel.modelValue = lesson;
    onLessonClick();
  }

  List<List<Map>> makeCombLesson(List<Map> lessons) {
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
    return rowLessons;
  }
}