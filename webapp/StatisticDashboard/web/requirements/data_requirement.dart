part of statistic;

// Args to be used.
String apiKey = '1291ff9d8ceb337db6a0069d88079474';
String apiSecret = '05b9aae8d5305855b1cdfec0db2db140';
DateTime now = new DateTime.now();
String dateNow = new DateFormat("yyyy-MM-dd").format(now);
int timeFuture = now.add(new Duration(minutes:1)).millisecondsSinceEpoch;

list_schools()=>["xw1301","xw1302","xw1303","xw1304","xw1305","xw1306","xw1307","xw1308","xw1309","xw1310","xw1311","xw1312","8z1301","8z1302","8z1303","8z1304","8z1305","8z1306","8z1307","8z1308","8z1309"];

// LearningRelated
map_enterLesson(String lessonId) => {
    "title":"进入","seq":0, "lessonId":lessonId,"type":["LearningRelated","Mixpanel","notDisplay"],"schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=EnterLesson", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"UserName\"]", "where=\"$_roomName\" in properties[\"UserName\"] and \"$lessonId\" == properties[\"LessonId\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};

map_finishLesson(String lessonId) => {
    "title":"已完成", "seq":1,"lessonId":lessonId,"type":["LearningRelated","Mixpanel"], "schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=FinishLesson", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"UserName\"]", "where=\"$_roomName\" in properties[\"UserName\"] and \"$lessonId\" == properties[\"LessonId\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};

map_enterButNotFinishLesson(String lessonId) => {
    "title":"正在做","seq":2,"lessonId":lessonId, "type":["LearningRelated","SelfMade"]
};

map_notEnterLesson(String lessonId) =>{
    "title":"未进入","seq":3,"lessonId":lessonId, "type":["LearningRelated","SelfMade"]
};

// LoginRelated
map_login() => {
    "title":"已登录", "type":["LoginRelated","Mixpanel"], "schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=Login", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"UserName\"]", "where=\"$_roomName\" in properties[\"UserName\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};

map_notLogin() => {
    "title":"未登录", "type":["LoginRelated","SelfMade"]
};


// APIRelated
/*
map_funnelList()=>{
    "title":"FunnelList","type":["APIRelated","Mixpanel"], "shouldDisplay":"false","schema":"http://mixpanel.com/api/2.0/funnels/list/",  "args":["expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};*/
