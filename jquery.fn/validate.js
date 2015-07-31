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
 2015.5.19 gool */
"use strict";

$.fn.validate = function (justTest, scrollTo) {
    if (this == window) {
        return $('[data-rule]').validate(justTest, scrollTo);
    } else if (!this.attr('data-rule') && $('[data-rule]', this).length > 0) {
        return $('[data-rule]', this).validate(justTest, scrollTo);
    } else if (this.validate && this.length == 0) {
        return $('[data-rule]').validate(justTest, scrollTo);
    }
    var rtv = { isValidate: true, messages: [] };
    var getArg = function (name, rule) {
        var reg = new RegExp(name + '\\s?\\(\\s?(.+?)\\s?\\)');
        return reg.exec(rule)[1];
    }
    var rules = {
        number: { rule: /^\d{0,}$/, message: '必须是一个整数' },

        required: { rule: /.+/, message: '不能为空' },

        datetime: { rule: /^(\d{4}\/\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{1,2}:\d{1,2})?$/, message: '不是有效的日期格式' },
        min: {
            last: 0,
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
            last: 0,
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
                    target = getArg('equals', rule);
                    return val !== $('#' + target).val();
                } catch (e) {
                    console.error('validate equals rule error!');
                }
            }, message: '两次输入的值不一致'
        }, maxLength: {
            lastLength: 0,
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
            lastLength: 0,
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
    $(this).each(function () {
        var $this = $(this);
        if (justTest !== true) {
            var checker = function () {
                $this.validate(false, false);
            }
            $this.bind('blur', checker);
        }
        var val = $this.value || $this.val(), rule = $this.attr('data-rule'), rs = getRules(rule);
        for (var k in rs) {
            var i = rs[k];
            if (rules[i] && (rules[i].rule ? !rules[i].rule.test(val) : true) && (rules[i].action ? rules[i].action($this, rule, val) : true)) {
                rtv.isValidate = false;
                rtv.messages.push({ element: $this, message: rules[i].message });
            }
        }
    });


    if (justTest)
        return rtv;
    if (window.validateHandler)
        validateHandler.call(this, rtv);
    else {
        var getParent = function (el) {
            var el = el[0];
            while (el && el.tagName && el.tagName.toLowerCase() != 'tr' && el.tagName.toLowerCase() != 'body')
                el = $(el).parent()[0];
            return $(el);
        };
        if (rtv.isValidate)
            getParent(this).find('.error_msg').remove();
        else
            $(rtv.messages).each(function () {
                var el = getParent(this.element);
                el.find('.error_msg').remove();
                if (/^\s+$/.test(el.find('td').last().html()))
                    el.find('td').last().remove();
                el.find('td').last().after('<td class="error_msg">' + this.message + '</td>');
                if (scrollTo !== false)
                    $(window).scrollTop(el.offset().top);
            });
    }
    return rtv;
}
$.fn.isValidate = function (justTest, scrollTo) {
    return this.validate.call(this, justTest, scrollTo).isValidate;
}