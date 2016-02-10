console.log('Loading function');

// API Gatewayの設定
const HOST = '';
const PATH = '';
const X_API_KEY = '';

// S3の設定
const BUCKET = 'jaws2016lambda';
const KEY = 'tweetList.txt';
const TEXT_DELIMITER = '\r\n';

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
    
    var body = JSON.stringify({
       status: "tweet from Lambda"
    })
    
    var options = {
        host: HOST,
        port: 443,
        path: PATH,
        method: 'POST',
        headers: {
            'x-api-key': X_API_KEY,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
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
            
            if(res.statusCode !== 200) {
                cb(new Error('Error. status code =  ' + res.statusCode 
                  + '. Error message = ' + JSON.parse(body).errorMessage));
            } else {
              console.log(body);
              cb(null);  
            }
        });
        
    });
    req.write(body);
    req.end();
    
    req.on('error', function(err) {
        cb(err);
    });
    
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
