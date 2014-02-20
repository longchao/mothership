library mixpanel;

import 'dart:convert';
import 'dart:async';
import 'package:crypto/crypto.dart';
import "package:jsonp/jsonp.dart" as jsonp;
import "package:json_object/json_object.dart";
import "package:js/js.dart" as js;
import "dart:js";
import "dart:html";

class Mixpanel{
  String _sig;
  String _apiUri;
  Map _dartJson;

  Mixpanel(String schema, List<String> args, String api_secret){
    _sig = _sigGenerator(args,api_secret);
    args.add("sig="+_sig);
    _apiUri = schema + "?" + args.join('&');
  }

  String _sigGenerator(List<String> args, String api_secret){
    var md5 = new MD5();
    args.sort();
    List<int> bytes = UTF8.encode(args.join()+api_secret);
    md5.add(bytes);
    return CryptoUtils.bytesToHex(md5.close());
  }

  Future fetchJson() {
    return
      jsonp.fetch(uriGenerator: (callback) => Uri.encodeFull(_apiUri)+"&callback=$callback")
      .then((js.Proxy proxy) {
        String jsonValue = js.context.JSON.stringify(proxy);
        _dartJson = new JsonObject.fromJsonString(jsonValue);
        return _dartJson;
      });
  }

/*  Future fetchJson(){
    return new Future((){
      context['callback'] = (response) {
        _dartJson = context['JSON'].callMethod('stringify',[response]);
      };
      ScriptElement script = new Element.tag("script");
      script.src = Uri.encodeFull(_apiUri)+"&callback=callback";
      document.body.children.add(script);
    });
  }*/

  Map get result => _dartJson;
}
