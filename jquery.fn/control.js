"use strict";
/*gool 2016.6.3*/
(function () {
    window.controls || (window.controls = {});
    var ready = false;

    $(function () {
        ready = true;
        $('[data-field],[data-control]').each(function () {
            var $this = $(this);
            var controlType = $this.attr('data-control'), initEvent = $this.attr('data-init'), setEvent = $this.attr('data-set');
            if (controlType && controls[controlType]) {
                $this.data('control', new controls[controlType](this));
                if (initEvent && typeof window[initEvent] == 'function')
                    window[initEvent].call(this, this);
                if (setEvent && typeof window[setEvent] == 'function')
                    $this.data('setEvent', window[setEvent]);
            }
        });
    });
    
    $.fn.controlJson = function (data) {
        var handler = function () {
            if (data === void 0) {
                data = {};
                $('[data-field]', this).each(function () {
                    var $this = $(this);
                    data[$this.attr('data-field')] = $this.value();
                });
                return data;
            } else
                for (var k in data)
                    $('[data-field=' + k + ']', this).value(data[k]);
        }
        if (ready)
            handler();
        else
            $(function () {
                handler();
            });
    };
    
    $.fn.appendControlJson = function (data) {
        if (data === void 0) 
            data = {};
        var cdata = this.controlJson();
        for(var k in cdata){
            if(cdata.hasOwnProperty(k))
                data[k] = cdata[k];
        }
        return data;
    };
    
    //扩展jQuery 添加value方法
    $.fn.value = function (value) {
        var $this = $(this), control = this.data("control");
        if (!control) {
            control = new nativeControl(this);
            this.data("control", control);
        }
        if (!arguments.length)
            return control.value ? control.value() : control.getValue();
        else {
            control.value ? control.value(value) : control.setValue(value);
            if ($this.data('setEvent'))
                $this.data('setEvent').call(this, value);
        }
    }

    //扩展jQuery 添加control方法
    $.control = $.fn.control = function () {
        return $(this).data("control");
    }
    window.controls || (window.controls = {});

    //控件父类
    var controlBase = function (el) {
        this.$this = $(el);
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

    ///原生控件处理
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
            }
        },
        getValue: function () {
            return this.getValueHandler();
        },
        setValue: function (val) {
            this.setValueHandler(val);
            this.$this.change();
        },
        getTextValue: function(){
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
            $(radios).each(function () {
                if (this.checked)
                    val += this.value + ',';
            });
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
        getValueHandler: $.noop,
        setValueHandler: $.noop
    });
    controls.nativeControl = nativeControl;
})()
