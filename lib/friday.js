var request = require('request');

var Promise = Promise;
if (!Promise) {
  Promise = require('bluebird');
}

var apiUrlBase = 'http://kroger.softcoin.com/p/np/4230/Kroger';
var apiFFUrl = apiUrlBase +
  // Conveniently, there's a special endpoint just for Free Friday coupons:
  '/couponsByFilterTagForFreeItemFriday' +
  // Normally, this will be a tag for whichever store the frontend is
  // showing for, eg. FF_QFC. However, all Free Friday coupons also appear to
  // have this tag, which is store-agnostic, so we use this instead.
  // There also appears to be an "UBER" tag in the response, but its purpose
  // is less clear, so I don't rely on it.
  '?filtertag=FTFREEFRI';
var apiClipUrlBase = apiUrlBase + '/coupon/clip?clipsource=freefri';

function getFreeFridayDownload(jar) {
  return new Promise(function(resolve, reject) {
    // we assume the session in the jar has already logged in
    request({url: apiFFUrl,
      jar: jar, json: true}, function(err, res, body) {

      if (err) return reject(err);
      if (!body.result) return reject(body);
      console.log(body);
      var coupon = body.coupons[0];
      var apiClipUrl = apiClipUrlBase + '&id=' + coupon.coupon_id +
          '&signature=' + coupon.signature;

      request({
        // Yes, GET, not POST, not my fault the Kroger API is bad at REST.
        method: 'GET',
        url: apiClipUrl,
        jar: jar, json: true}, function(err, res, body) {

        if (err) return reject(err);
        if (!body.result) return reject(body);
      });
    });
  });
}

exports.getFreeFridayDownload = getFreeFridayDownload;
