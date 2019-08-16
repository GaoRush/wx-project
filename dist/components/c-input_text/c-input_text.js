'use strict';

// components/c-input_text/c-input_text.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    'placeholder': {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    name_parent: '', //家长姓名
    sex_parent: '男', //性别
    phone: '', //手机号码
    code: '', //验证码
    email: '', //邮箱
    region: ['请选择', '请选择', '请选择'], //地区
    radioValue: '男', //默认的性别,
    btn_disabled: false, //报名按钮
    warn_input_name: false,
    cancel_input_name: false,
    warn_input_phone: false,
    cancel_input_phone: false,
    warn_input_email: false,
    cancel_input_email: false,
    warn_input_region: false,
    warn_input_code: false
  },

  /**
   * 组件的方法列表
   */
  methods: {}
});