console.log('Loading function');

// API Gatewayの設定
const HOST = '';
const PATH = '';
const X_API_KEY = '';

// S3の設定
const BUCKET = '';
const KEY = '';
const TEXT_DELIMITER = '';

var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var https = require('https');


// デリミタで指定された文字で文字列を分割し、ランダムの値を返却
function getRandomMessage(data, delimiter) {
    var lines = data.split(delimiter);
    var message = lines[Math.floor(Math.random() * lines.length)];
    return message;
}

// messageで指定された文字列をAPI Gateway経由でツイートする
function tweet(message, cb) {
    
    var options = {
        host: HOST,
        port: 443,
        path: PATH,
        method: 'GET',
        headers: {
            'x-api-key': X_API_KEY
        }
    };
    
    var req = https.request(options, function(res) {
        console.log("response code = " + res.statusCode)
        
        var body = '';
        res.setEncoding('utf8');
        
        res.on('data', function(chunk) {
           body += chunk; 
        });
        
        res.on('end', function() {
           ret = JSON.parse(body);
           console.log(ret);
           cb(null);
        });
        
    });
    
    req.on('error', function(err) {
        cb(err);
    });
    
    req.end();
}

// メイン
exports.handler = function(event, context) {

    var params = {
        Bucket: BUCKET,
        Key: KEY
    };
    
    var data = "";
    var s3 = new aws.S3();
    
    // S3からテキストデータの取得
    var s3stream = s3.getObject(params).createReadStream();
    s3stream.setEncoding('utf-8');
    
    s3stream.on('error', function(err) {
       context.fail(err);
    });
    
    s3stream.on('data', function(chunk) {
       data += chunk; 
    });
    
    s3stream.on('end', function() {
       console.log("S3 data = " + data);
       
       // いずれかのメッセージを取得
       var message = getRandomMessage(data, TEXT_DELIMITER);
       
       // ツイート
       tweet(message, function(err) {
           if(err) context.fail(err);
           else context.succeed(message);
       });
    });
};
