require('dotenv').load();
var Twitter = require('twitter');

const HASH_TAG = '#jawsdays'

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

exports.handler = function(event, context) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if(!event.status) {
    context.fail(new Error('Can not get status ' + status + '"'));
  } else {
    var params = {status: event.status + ' ' + HASH_TAG};
    client.post('statuses/update', params, function(error, result, response){
      if (error) context.fail(error);
      else context.succeed(result);
    });
  }
}
