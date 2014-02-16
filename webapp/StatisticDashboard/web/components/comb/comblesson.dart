import 'dart:html' as dom;
import 'package:angular/angular.dart';
import '../../model/event.dart' as sta;

@NgComponent(
    selector: 'comblesson',
    templateUrl: 'web/components/comb/comblesson.html',
    cssUrl: 'web/components/comb/comblesson.css',
    publishAs: 'comb',
    map: const {
      'lessons-data': '=>setRowLessons',
      'events-data': '=>setEvents',
      'on-lesson-click': '&onLessonClick'
    }
)
class CombLesson implements NgShadowRootAware {
  List<List<Map>> rowLessons = new List<List<Map>>();
  List<sta.Event> events = new List<sta.Event>();
  ParsedFn onLessonClick;
  NgModel ngModel;

  CombLesson(this.ngModel);
  onShadowRoot(dom.ShadowRoot shadowRoot){}

  set setRowLessons(List<Map> value){
    rowLessons = makeCombLesson(value);
  }

  set setEvents(List<sta.Event> value){
    events = value;
  }

  void onItemClicked(Map lesson){
    ngModel.modelValue = lesson;
    onLessonClick();
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
    return rowLessons;
  }
}