library mixpanel;

import 'dart:convert';
import 'package:crypto/crypto.dart';

class Mixpanel{
  String _sig;
  String _apiUri;

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

  String get apiUri => Uri.encodeFull(_apiUri);
}
