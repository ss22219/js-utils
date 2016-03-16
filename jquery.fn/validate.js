/*
$('form').validate(justTest,scrollTo) -> 
param: justTest bool 只是检查，不修改Dom
param: scrollTo bool 滚动到错误元素
return { isValidate : bool,
         messages:[{
                      element:jQueryEl,
                      message:string
                      }]
      }
HTML:
 <form>
    Enter:
    <input type="password" data-rule="required;number;equals(target)"/>
    <input type="password" id="target"/>
 </form>
 2015.3.16 gool */
"use strict";
(function () {
    //简单的检查是否通过验证,返回true/false
    $.fn.isValidate = function () {
        return this.validate.call(this, true, false).isValidate;
    }

    //justTest 是否只是测试,默认 是
    //scrollTo 是否滚动到错误处,默认 是
    //validateHandler 错误处理函数, justTest=true 有默认值
    $.fn.validate = function (justTest, scrollTo, validateHandler) {
        if (this == window) {
            //为所有验证控件验证
            return $('[data-rule]').validate(justTest, scrollTo, validateHandler);
        } else if (!this.attr('data-rule') && $('[data-rule]', this).length > 0) {
            //如果当前元素是验证控件,为当前验证控件验证
            return $('[data-rule]', this).validate(justTest, scrollTo, validateHandler);
        } else if (this.validate && this.length == 0) {
            //如果当前元素下面包含验证控件,验证当前元素下所有控件
            return $('[data-rule]').validate(justTest, scrollTo, validateHandler);
        }

        //返回信息
        var rtv = { isValidate: true, messages: [] };

        //处理验证控件
        $(this).each(function () {
            var $this = $(this);
            //获取到控件值,$this.val()需要其他组件
            var val = $this.value || $this.val(),
                rule = $this.attr('data-rule'), //data-rule内容
                rs = getRules(rule); //解析成rule列表
            for (var k in rs) {
                var i = rs[k];
                //对当前规则判断,如果包含正则表达式属性,使用正则验证,否则使用自定义action验证
                if (rules[i] &&
                    (rules[i].rule ? !rules[i].rule.test(val) : true) //正则验证
                    &&
                    (rules[i].action ? rules[i].action($this, rule, val) : true) //自定义action验证
                    ) {
                    rtv.isValidate = false;
                    rtv.messages.push({ element: $this, message: rules[i].message }); //设置验证失败信息
                }
            }
        });


        //默认的验证结果处理
        if (justTest !== true && !validateHandler)
            validateHandler = function (msg) {
                if (msg.isValidate)
                    $(this).parent().find('.error_msg').remove();
                else
                    $(msg.messages).each(function () {
                        var el = this.element;
                        $('.error_msg', el.parent()).remove();
                        el.after('<div class="error_msg">' + this.message + '</div>');
                        if (scrollTo !== false)
                            $(window).scrollTop(el.offset().top);
                    });
            }

        if (validateHandler)
            validateHandler.call(this, rtv);
        return rtv;
    }

    //getArg('number;length(18)','length') -> 18 现在只支持一个参数
    function getArg(name, rule) {
        var reg = new RegExp(name + '\\s?\\(\\s?(.+?)\\s?\\)');
        return reg.exec(rule)[1];
    }

    //解析data-rule信息
    function getRules(rule) {
        if (!rule)
            return [];
        var rs = rule.split(';'), len = rs.length, s = [], reg = /\w+/, tmp;
        for (var i = 0; i < len ; i++) {
            if (rs[i]) {
                var tmp = reg.exec(rs[i]);
                if (tmp)
                    s.push(tmp[0].trim());
            }
        }
        return s;
    }

    //验证规则 number,required,datetime,phone是正则规则 其他的是自定义action验证
    var rules = {
        number : { rule: /^\d{0,}$/, message: '必须是一个整数' },

        required : { rule: /.+/, message: '不能为空' },

        datetime : { rule: /^(\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2})?$/, message: '不是有效的日期格式' },

        phone: { rule: /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i, message: '不是有效的手机号码' },

        length: {
            last: 0,//保存起来的data-rule中的参数值
            action: function (el, rule, val) {
                if (val === null || typeof val == 'undefined' || val === '')
                    return;
                try {
                    var length = el.data("length");
                    if (!length) {
                        length = getArg('length', rule); //获取规则参数 length(18) -> 18
                        el.data("length", length);
                    }
                    rules.length.last = length;
                    return val.length != length;
                } catch (e) {
                    console.error('length rule error!');
                }
            }, get message() {
                return '长度必须为' + rules.length.last;
            }
        },

        min: {
            last: 0,//保存起来的data-rule中的参数值
            action: function (el, rule, val) {
                if (val === null || typeof val == 'undefined' || val === '')
                    return;
                try {
                    var length = el.data("min");
                    if (!length) {
                        length = getArg('min', rule);
                        el.data("min", length);
                    }
                    rules.min.last = length;
                    return val < length;
                } catch (e) {
                    console.error('min rule error!');
                }
            }, get message() {
                return '不能小于' + rules.min.last;
            }
        },
        max: {
            last: 0,//保存起来的data-rule中的参数值
            action: function (el, rule, val) {
                if (val === null || typeof val == 'undefined' || val === '')
                    return;
                try {
                    var length = el.data("max");
                    if (!length) {
                        length = getArg('max', rule);
                        el.data("max", length);
                    }
                    rules.max.last = length;
                    return val > length;
                } catch (e) {
                    console.error('max rule error!');
                }
            }, get message() {
                return '不能大于' + rules.max.last;
            }
        },
        equals: {
            action: function (el, rule, val) {
                try {
                    var target = getArg('equals', rule);
                    return val !== $('#' + target).val();
                } catch (e) {
                    console.error('validate equals rule error!');
                }
            }, message: '两次输入的值不一致'
        }, maxLength: {
            lastLength: 0,//保存起来的data-rule中的参数值
            action: function (el, rule, val) {
                try {
                    var length = el.data("maxLength");
                    if (!length) {
                        length = getArg('maxLength', rule);
                        el.data("maxLength", length);
                    }
                    rules.maxLength.lastLength = length;
                    return val.length > length;
                } catch (e) {
                    console.error('maxLength rule error!');
                }
            }, get message() {
                return '长度不能大于' + rules.maxLength.lastLength;
            }
        }, minLength: {
            lastLength: 0,//保存起来的data-rule中的参数值
            action: function (el, rule, val) {
                try {
                    var length = el.data("minLength");
                    if (!length) {
                        length = getArg('minLength', rule);
                        el.data("minLength", length);
                    }
                    rules.minLength.lastLength = length;
                    return val.length < length;
                } catch (e) {
                    console.error('minLength rule error!');
                }
            }, get message() {
                return '长度不能小于' + rules.minLength.lastLength;
            }
        }
    };
    $.fn.validate.rules = rules;
})()
