"use strict";
/*gool 2017.11.4*/
(function () {
    window.controls || (window.controls = {});

    //初始化
    $(function () {
        $('[data-field],[data-control]').each(function () {
            $(this).control()
        });
    });


    //处理控件嵌套控件的情况
    function getControls(el) {
        el = $(el)
        var result = []
        var controls = el.find('[data-control]')
        var fields = el.find('[data-field]')
        fields.each(function () {
            var field = this, find = false
            controls.each(function () {
                if ($(this).find(field).length) {
                    find = true
                    return false
                }
            })
            if (!find)
                result.push(field)
        })
        return $(result)
    }

    //获取或设置控件列表的值
    $.fn.controlJson = function (data) {
        var _this = this
        if (!arguments.length) {
            data = {};
            getControls(this).each(function () {
                var $this = $(this);
                data[$this.attr('data-field')] = $this.value();
            });
            return data;
        } else { //等页面dom完成后再赋值
            var el = this, setVal = function() {
                getControls(el).each(function () {
                    var field = $(this).attr('data-field')
                    for (var k in data)
                        if (field == k)
                            $(this).value(data[k]);
                })
            }
            $.isReady ? setVal() : $(setVal)
        }

    };

    //合并data与控件列表的值
    $.fn.appendControlJson = function (data) {
        if (!arguments.length)
            data = {};
        var cdata = this.controlJson();
        for (var k in cdata) {
            if (cdata.hasOwnProperty(k))
                data[k] = cdata[k];
        }
        return data;
    };

    //扩展jQuery 添加value方法 该方法调用具体的控件getValue，setValue方法
    $.fn.value = function (value) {
        var $this = $(this), control = $this.control();

        //没有参数就是获取值
        if (!arguments.length)
            return control.value ? control.value() : control.getValue();
        else
            control.value ? control.value(value) : control.setValue(value);

    }

    //扩展jQuery 添加control方法
    $.control = $.fn.control = function () {
        var $this = $(this), control = $this.data("controlCache");
        if (!control) {
            var controlType = $this.attr('data-control');
            //初始化控件
            if (controlType && controls[controlType])
                control = new controls[controlType](this);
            else
                control = new nativeControl(this);
            $this.data('controlCache', control);
        }
        return control;
    }

    //控件父类
    var controlBase = function (el) {
        this.$el = this.$this = $(el);
        if (this.$this.length)
            this.init();
    };
    controlBase.extend = function (proto) {
        var classe = function (el) {
            controlBase.call(this, el);
        }
        classe.prototype = new controlBase();
        for (var k in proto)
            classe.prototype[k] = proto[k];
        return classe;
    }
    controlBase.prototype = {
        getValue: $.noop,
        setValue: $.noop,
        init: $.noop
    }
    controls.controlBase = controlBase;

    ///原生控件处理 input,select标签
    var nativeControl = controlBase.extend({
        init: function () {
            var tag = this.$this.get(0).tagName.toLowerCase();
            var type = this.type = this.$this.attr('type');
            if (tag == 'input')
                switch (type) {
                    case 'radio':
                    case 'checkbox':
                        this.setValueHandler = this.setRadioCheckBoxValue;
                        this.getValueHandler = this.getRadioCheckBoxValue;
                        break;
                    default:
                        this.setValueHandler = this.setTextValue;
                        this.getValueHandler = this.getTextValue;
                }
            else if (tag == 'select') {
                this.setValueHandler = this.setSelectValue;
                this.getValueHandler = this.getSelectValue;
            } else {

            }
        },
        getValue: function () {
            return this.getValueHandler();
        },
        setValue: function (val) {
            this.setValueHandler(val);
            this.$this.change();
        },
        getTextValue: function () {
            return this.$this.val();
        },
        setTextValue: function (val) {
            this.$this.val(val);
        },
        setRadioCheckBoxValue: function (val) {
            var valArr = typeof val == 'string' ? val.split(',') : [val];
            var name = this.$this.attr('name');
            var radios = $(':' + this.type + '[name=' + name + ']');

            if (val === true)
                valArr = ['True'];
            else if (val === false)
                valArr = ['False'];

            if (typeof val != 'undefined') {
                if (radios.length <= 1) {
                    if (val) {
                        this.$this[0].checked = true;
                        this.$this.attr('checked', 'checked');
                    } else {
                        this.$this[0].checked = false;
                        this.$this.removeAttr('checked');
                    }
                }
                $(radios).each(function () {
                    var radio = this;
                    radio.checked = false;
                    $(radio).removeAttr('checked');
                    $(valArr).each(function () {
                        if (this == radio.value) {
                            radio.checked = true;
                            $(radio).attr('checked', 'checked');
                        }
                    });
                });
            }
        },
        getRadioCheckBoxValue: function () {
            var name = this.$this.attr('name'), radios = $(':' + this.type + '[name=' + name + ']'), val = '';
            if (radios.length <= 1)
                return this.$this[0].checked;
            var values = {};
            $(radios).each(function () {
                if (this.checked)
                    values[this.value] = this.value;
            });
            for (var k in values)
                val += k + ','

            return val.replace(/,$/, '');
        },
        setSelectValue: function (val) {
            this.$this.find('option').each(function () {
                if (this.value != val) {
                    this.selected = false;
                    $(this).removeAttr('selected');
                }
                else {
                    this.selected = true;
                    $(this).attr('selected', 'selected');
                }
            });
        },
        getSelectValue: function () {
            return this.$this.val();
        },
        getValueHandler: function () {
            return this.$this.val()
        },
        setValueHandler: function (val) {
            this.$this.val(val)
        }
    });
    controls.nativeControl = nativeControl;
})()
