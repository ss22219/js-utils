"use strict";
/*
    <div data-control="base" data-field="Name" data-init="initFunctionName" data-set="onSetValueFunctionName"></dvi>
    <script>
    function initFunctionName(){
        $(this).val('test');
    }

    function onSetValueFunctionName(val){
        $(this).val(val);
    }
    
    //$(x).value(xxx);
    //console.log($(x).value());
    
    //bind model
    bindData({Name:"join"});
    
    //post
    $(x).click(function(){
        postData(function(){ //validate form
            alert('success!');
        },function(){
            alert('error');
        });
    });
    </script>
 gool 2015.5.19 */
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
    $.fn.controlJson = function () {
        var data = {};
        $('[data-field]', this).each(function () {
            var $this = $(this);
            data[$this.attr('data-field')] = $this.value();
        });
        return data;
    };

    //扩展jQuery 添加value方法
    $.fn.value = function (value) {
        if (!arguments.length)
            return this.data("control") ? this.data("control").value() : nativeControl(this);
        else {
            var $this = $(this);
            if ($this.data("control")) {
                $this.data("control").value(value);
            }
            else
                nativeControl($this, value);
            if ($this.data('setEvent'))
                $this.data('setEvent').call(this, value);
        }
    }

    //html基础控件处理
    function nativeControl(el, setVal) {
        var $this = $(el);

        if ($this.length == 0)
            return;
        var tag = $this.get(0).tagName.toLowerCase(), type = $this.attr('type'),
            val = $this.val(), name = $this.attr('name'), valArr = typeof setVal == 'string' ? setVal.split(',') : [setVal];

        if (tag == 'input')
            switch (type) {
                case 'radio':
                case 'checkbox':
                    if (setVal === true)
                        valArr = ['True'];
                    else if (setVal === false)
                        valArr = ['False'];
                    var radios = $(':' + type + '[name=' + name + ']');
                    if (typeof setVal != 'undefined') {
                        if (radios.length <= 1) {
                            if (setVal) {
                                el[0].checked = true;
                                el.attr('checked', 'checked');
                            } else {
                                el[0].checked = false;
                                el.removeAttr('checked');
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
                    } else {
                        val = '';
                        if (radios.length <= 1)
                            return el[0].checked;
                        $(radios).each(function () {
                            if (this.checked)
                                val += this.value + ',';
                        });
                        val = val.replace(/,$/, '');
                    }
                    break;
                default:
                    if (typeof setVal != 'undefined')
                        $this.val(setVal);

            }
        else if (tag == 'select') {
            if (typeof setVal != 'undefined') {
                $this.find('option').each(function () {
                    if (this.value != setVal) {
                        this.selected = false;
                        $(this).removeAttr('selected');
                    }
                    else {
                        this.selected = true;
                        $(this).attr('selected', 'selected');
                    }
                });
                $this.change();
            }
        } else {
            if (typeof setVal != 'undefined')
                $this.val(setVal);
        }
        return val;
    }

    var modelData;
    //为控件绑定数据
    window.dataBind = function (model) {
        var handler = function () {
            for (var k in model) {
                var v = model[k];
                $('[data-field=' + k + ']').value(v);
            }
            modelData = model;
        }
        if (ready)
            handler();
        else
            $(function () {
                handler();
            });
    };

    //获取当前model数据
    window.getData = function () {
        var data = typeof modelData == 'undefined' ? modelData = {} : modelData;
        $('[data-field]').each(function () {
            var $this = $(this);
            data[$this.attr('data-field')] = $this.value();
        });
        return data;
    }

    window.controls || (window.controls = {});

    //简单控件
    controls.base = function (el) {
        this.$this = $(el);
    };
    controls.base.prototype = {
        value: function (val) {
            if (!arguments.length)
                return this.$this.data('value');
            else
                this.$this.data('value', value);
        }
    };
})()
