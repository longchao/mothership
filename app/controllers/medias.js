var qiniu = require('qiniu');

// required, type your ACCESS_KEY and SECRET_KEY here
qiniu.conf.ACCESS_KEY = 'Ap-_6XBBOas4n-w-osaYig82pVft-v63Rdu_2lPV';
qiniu.conf.SECRET_KEY = '_GjKAqSVaeTlWv-YF8fu2sbQJUKpApG_tu7WRgS3';

// specify a common bucket name for storage your files
var bucket = 'ghxz';

// get the upload token
var upToken = function(bucketname) {
  var putPolicy = new qiniu.rs.PutPolicy(bucketname);
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putPolicy.asyncOps = asyncOps;
  //putPolicy.expires = expires;

  return putPolicy.token();
};

var uploadFile = function(localFile, key, callback) {
  var extra = new qiniu.io.PutExtra();
  //extra.params = params;
  //extra.mimeType = mimeType;
  //extra.crc32 = crc32;
  //extra.checkCrc = checkCrc;

  var token = upToken(bucket);
//  console.log(token);
//  console.log(key);
//  console.log(localFile);

  qiniu.io.putFile(token, key, localFile, extra, callback);
};

exports.create = function(req, res) {

  // get the files' temporary path
  var tmp_path = req.files.file.path;
  var tmp_name = req.files.file.name;
//    console.log(tmp_path);
//    console.log(tmp_name);

  uploadFile(tmp_path, tmp_name, function(err, ret) {
    if (!err) {
      // ret.key & ret.hash
//      console.log(ret);
//      console.log(ret.key, ret.hash);
      res.json(200, {"key": ret.key, "hash": ret.hash,
        "url": encodeURI("http://ghxz.qiniudn.com/" + ret.key)});
    } else {
      console.log(err);
      res.send(500, err);
    }
  });
};

exports.list = function(req, res) {
  prefix = req.query.prefix;
  marker = req.query.marker;
  limit = req.query.limit;
  qiniu.rsf.listPrefix(bucket, prefix, marker, limit, function(err, ret) {
    if (!err) {
      // process ret.marker & ret.items
      items = ret.items;
      for (var i in items) {
        items[i].url = encodeURI("http://ghxz.qiniudn.com/" + items[i].key);
      }
      console.log(ret);
      res.json(200, ret);
    } else {
      // http://developer.qiniu.com/docs/v6/api/reference/rs/list.html
      console.log(err)
      res.send(500, err);
    }
  });
};

