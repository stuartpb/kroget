// Okay, so, slightly disingenuously, this script actually makes requests to
// QFC.com right now, not Kroger or a base/bannerless URL. Finding a neutral
// endpoint for this is left an exercise for the reader.

var request = require('request');

var Promise = Promise;
if (!Promise) {
  Promise = require('bluebird');
}

function loginAsUser(email, password) {
  var jar = request.jar();
  return new Promise(function(resolve,reject){
    request({
      url: 'https://www.qfc.com/signin',
      jar: jar}, function(err,res, body){
        if(err) return reject(err);
        request.post({
          url:'https://www.qfc.com/user/authenticate', jar: jar,
          body: JSON.stringify(
            {email: email,
            password: password,
            rememberMe: null})},  function(err, res, body) {
            if (err) return reject(err);
            else return resolve({res: res, body: body, jar: jar});
          });
    });
  });
}

exports.loginAsUser = loginAsUser;
