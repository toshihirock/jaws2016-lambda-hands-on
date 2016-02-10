require('dotenv').load();
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

exports.handler = function(event, context) {
  var params = {status: 'hello from Lambda!'};
  client.post('statuses/update', params, function(error, result, response){
    if (!error) {
      context.succeed(result);
    } else {
      context.fail(error);
    }
  });
}
