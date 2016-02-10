// dirver
var event = {};
var context = {
  invokeid: 'invokeid',
  succeed: function(result) {
    console.log('success');
    console.log(result);
    return;
  },

  fail: function(err) {
    console.log('fail');
    console.log(err);
    return;
  }
}

// exec
var lambda = require('./index');
lambda.handler(event, context);
