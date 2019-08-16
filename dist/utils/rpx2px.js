"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (rpx) {
    return rate * rpx;
};

var rate = wx.getSystemInfoSync().windowWidth / 750;