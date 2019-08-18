'use strict';

var url = 'https://duode.cenbel.com';

var config = {
  url: url,
  imgUrl: url + '/images/',
  uploadUrl: url + '/api/weixin/upload_ajax.ashx',
  // imgUrl: './images/',
  // getUrl: url + '/data/get/getData.ashx',
  apiUrl: url + '/api/weixin/wx.ashx?action='

};

//export default config;
module.exports = config;