library computation;

class computation {

  computation() {
  }

  static diffNotLoginUsers(Map loginUser){
    users_notLogin.clear();
    List user = usersMap["$_roomName"];
    var loginusers = loginUser['data']['values'];
    List<String> users_all = new List<String>();
    List<String> users_login = new List<String>();
    user.forEach((item)=>users_all.add(item['username']));
    loginusers.forEach((k,v)=>users_login.add(k));
    users_all.forEach((item){
      if (!users_login.contains(item)){
        users_notLogin.add(item);
      }
    });
  }
}
