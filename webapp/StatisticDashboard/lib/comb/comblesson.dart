library comb;
import 'package:angular/angular.dart';
import 'package:json_object/json_object.dart';

@NgComponent(
    selector: 'comblesson',
    templateUrl: 'lib/comb/comblesson.html',
    cssUrl: 'lib/comb/comblesson.css',
    publishAs: 'comb',
    map: const {
      'lesson-data': '@setRowLessons'
    }
)
class CombLesson {
  List<List<Map>> rowLessons = new List<List<Map>>();
  JsonObject lessonJson;

  set setRowLessons(String value){
    lessonJson = new JsonObject.fromJsonString(value);
    rowLessons = makeCombLesson(lessonJson);
  }

  makeCombLesson(var lessons) {
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
