var request = require('request');
var cheerio = require('cheerio');

var Promise = Promise;
if (!Promise) {
  Promise = require('bluebird');
}

// kroger.softcoin.com doesn't actually seem to have a login mechanism - only
// sites for end stores, like www.qfc.com, do. As such, we log in at
// www.qfc.com (just because that's the closest store to me personally),
// then make another request with the cookie jar to handoff to the main
// kroger.softcoin.com session (see next function).
function loginOnQfc(email, password) {
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

var krogerRedirectUrl = encodeURIComponent(
  'http://kroger.softcoin.com/p/np/4230/login/payload/process?' +
  'destination=/programs/kroger/freefri/&banner=QFC&origin=freefri');

var qfcCouponsUrl = 'https://www.qfc.com/coupons'; // + '?redirectUrl=' +
  // krogerRedirectUrl;

// Copies autentication information from a www.qfc.com session to a
// kroger.softcoin.com session for doing coupon management / API calls,
// using some loopy behind-the-scenes voodoo involving a self-submitting
// form with a giant "encoded" chunk.
function handoffQfcToSoftcoin(trio) {
  var jar = trio.jar;
  return new Promise(function(resolve,reject){
    request({
      url: qfcCouponsUrl,
      jar: jar}, function(err, res, body){
        if(err) return reject(err);

        var $ = cheerio.load(body);

        var form = $('form');
        var formMethod = form.attr('method');
        var formAction = form.attr('action');
        var encodedValue = $('input[name="encoded"]', form).attr('value');

        request({method: formMethod, url: formAction, jar: jar,
          form: {encoded: encodedValue}},  function(err, res, body) {
            if (err) return reject(err);
            else return resolve({res: res, body: body, jar: jar});
          });
    });
  });
}

function loginAsUser(email,password){
  return loginOnQfc(email,password).then(handoffQfcToSoftcoin);
}

exports.loginAsUser = loginAsUser;
