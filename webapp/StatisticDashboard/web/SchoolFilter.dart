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
