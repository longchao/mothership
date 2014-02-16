import 'model/filters.dart';
import 'components/comb/comblesson.dart';
import 'controller/boardcontroller.dart';
import 'package:angular/angular.dart';

class MyAppModule extends Module {
  MyAppModule() {
    type(BoardController);
    type(SchoolFilter);
    type(EventFilter);
    type(CombLesson);
  }
}

main() {
  ngBootstrap(module: new MyAppModule());
}