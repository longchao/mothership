library dashboard;

import '../lib/model/filters.dart';
import '../lib/components/comb/comblesson.dart';
import '../lib/controller/boardcontroller.dart';
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