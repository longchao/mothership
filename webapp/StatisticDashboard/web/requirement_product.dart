part of statistic;

list_schools()=>["xw1301","xw1302","xw1303","xw1304","xw1305","xw1306","xw1307","xw1308","xw1309","xw1310","xw1311","xw1312","8z1301","8z1302","8z1303","8z1304","8z1305","8z1306","8z1307","8z1308","8z1309"];

// Raw Data
map_login() => {
    "title":"已登录", "type":"mixpanel", "schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=Login", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"UserName\"]", "where=\"$_roomName\" in properties[\"UserName\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};

map_enterLesson(String lessonTitle,String lessonId) => {
    "title":"进入$lessonTitle", "type":"mixpanel", "schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=EnterLesson", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"Name\"]", "where=\"$_roomName\" in properties[\"UserName\"] and \"$lessonId\" == properties[\"LessonId\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};


map_finishLesson(String lessonTitle,String lessonId) => {
    "title":"完成$lessonTitle", "type":"mixpanel", "schema":"http://mixpanel.com/api/2.0/segmentation/", "args":["limit=10000", "event=FinishLesson", "from_date=2014-01-14", "to_date=$dateNow", "on=properties[\"Name\"]", "where=\"$_roomName\" in properties[\"UserName\"] and \"$lessonId\" == properties[\"LessonId\"]", "type=unique", "expire=$timeFuture", "api_key=$apiKey"], "api_secret":apiSecret
};

// Utilities
map_notLogin() => {
    "title":"未登录", "type":"selfMade"
};