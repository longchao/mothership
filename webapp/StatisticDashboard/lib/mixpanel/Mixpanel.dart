library mixpanel;

import 'dart:convert';
import 'dart:async';
import 'package:crypto/crypto.dart';
import "package:jsonp/jsonp.dart" as jsonp;
import "package:js/js.dart" as js;

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
      jsonp.fetch(uriGenerator: (callback) =>  Uri.encodeFull(_apiUri)+"&callback=$callback")
      .then((js.Proxy proxy) {
        String jsonValue = js.context.JSON.stringify(proxy);
        _dartJson = JSON.decode(jsonValue);
        return _dartJson;
      });
  }

  Map get result => _dartJson;
}
