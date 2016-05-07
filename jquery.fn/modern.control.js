"use strict";
if (typeof exports == 'undefined') var exports = {};
exports.control = function () {
    var controls = {};

    var controlBase = function (el) {
        this.$this = $(el);
        this.init && this.init();
    };
    controlBase.extend = function (proto) {
        var classe = function (el) {
            controlBase.call(this, el);
        }
        classe.prototype = new controlBase();
        for(var k in proto)
            classe.prototype[k] = proto[k];
        return classe;
    }
    controlBase.prototype = {
        get value() {
            return this.value;
        },
        set value(val) {
            this.value = val;
        }
    }

    ///原生控件处理
    var nativeControl = controlBase.extend();
    nativeControl.prototype.init = function () {
        var tag = this.$this.get(0).tagName.toLowerCase();
        var type = this.type = this.$this.attr('type');
        if (tag == 'input')
            switch (type) {
                case 'radio':
                case 'checkbox':
                    this.setValueHandler = this.setRadioCheckBoxValue;
                    this.getValueHandler = this.getRadioCheckBoxValue;
            }
        else if (tag == 'select') {
            this.setValueHandler = this.setSelectValue;
        }
    }
    Object.defineProperty(nativeControl.prototype, 'value', {
        get: function () {
            return this.getValueHandler();
        },
        set: function (val) {
            this.setValueHandler(val);
            this.$this.change();
        }
    });
    nativeControl.prototype.setRadioCheckBoxValue = function (val) {
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
    };
    nativeControl.prototype.getRadioCheckBoxValue = function () {
        var radios = $(':' + this.type + '[name=' + name + ']');
        val = '';
        if (radios.length <= 1)
            return this.$this[0].checked;
        $(radios).each(function () {
            if (this.checked)
                val += this.value + ',';
        });
        val = val.replace(/,$/, '');
    };
    nativeControl.prototype.setSelectValue = function (val) {
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
    };
    nativeControl.prototype.getValueHandler = function () {
        return this.$this.val();
    };
    nativeControl.prototype.setValueHandler = function (val) {
        if (typeof val != 'undefined')
            this.$this.val(val);
    };
    controls.nativeControl = nativeControl;

    //扩展jQuery 添加value属性
    Object.defineProperty($.fn, 'value', {
        configurable: true,
        get: function () {
            return this.data("control") ? this.data("control").value : this.val();
        },
        set: function (value) {
            var $this = $(this);
            if ($this.data("control"))
                $this.data("control").value = value;
            else
                $this.val(value);
        }
    });

    //初始化全部控件
    var init = function () {
        return $('[data-field],[data-control]').each(function () {
            var $this = $(this);
            var controlType = $this.attr('data-control');
            if (controlType && controls[controlType])
                $this.data('control', new controls[controlType](this));
            else
                $this.data('control', new controls['nativeControl'](this));
        });
    };
    $(init);

    function getData() {
        var data = typeof modelData == 'undefined' ? modelData = {} : modelData;
        $('[data-field]').each(function () {
            var $this = $(this);
            data[$this.attr('data-field')] = $this.value;
        });
        return data;
    }

    function bindData(data) {
        for (var k in model) {
            var v = model[k];
            if (typeof v != 'object')
                $('[data-field=' + k + ']').value = v;
            else
                dataBind(v);
        }
        window.modelData = model;
    }

    var control = {
        controls: controls,
        controlBase: controlBase,
        init: init,
        getData: getData,
        bindData: bindData
    };
    return control;
}
