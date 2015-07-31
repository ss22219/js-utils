"use strict";
/*
    <div data-control="default" data-field="Name" data-init="initFunctionName" data-set="onSetValueFunctionName"></dvi>
    <script>
    function initFunctionName(){
        $(this).val('test');
    }

    function onSetValueFunctionName(val){
        $(this).val(val);
    }
    
    //$(x).value = xxx;
    //console.log($(x).value);
    
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
    window.k_ready = false
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

    typeof KindEditor != 'undefined' && KindEditor.ready(function (K) {
        k_ready = true;
        window.K = K;
    });
    //扩展jQuery 添加value属性
    Object.defineProperty($.fn, 'value', {
        get: function () {
            return this.data("control") ? this.data("control").value : nativeControl(this);
        },
        set: function (value) {
            var $this = $(this);
            if ($this.data("control")) {
                $this.data("control").value = value;
            }
            else
                nativeControl($this, value);

            if ($this.data('setEvent'))
                $this.data('setEvent').call(this, value);
        }
    });

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
            if (typeof setVal != 'undefined')
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
        } else {
            if (typeof setVal != 'undefined')
                $this.val(setVal);
        }
        return val;
    }

    //为控件绑定数据
    window.dataBind = function (model) {
        var handler = function () {
            for (var k in model) {
                var v = model[k];
                if (typeof v != 'object')
                    $('[data-field=' + k + ']').value = v;
                else
                    dataBind(v);
            }
            window.modelData = model;
        }
        if (ready)
            handler();
        else
            $(function () {
                handler();
            });
    };

    //获取当前model数据
    window.setData = function () {
        var data = typeof modelData == 'undefined' ? modelData = {} : modelData;
        $('[data-field]').each(function () {
            var $this = $(this);
            data[$this.attr('data-field')] = $this.value;
        });
        return data;
    }

    //提交当前model
    window.postData = function (successCallback, errorCallback, validateCallback) {
        if ($('[data-rule]').length > 0) {
            var result = $.fn.validate();
            if (!result.isValidate) {
                if (validateCallback)
                    validateCallback(result);
                else
                    DialogBox.alert("有未通过验证的输入项目");
                return false;
            }
        }
        var data = setData();
        ARAPD("post", location.href, function (messageObj) {
            try {
                messageObj.obj = JSON.parse(messageObj.obj);
            } catch (e) {

            }
            if (messageObj && messageObj.isSuccess && messageObj.obj && (messageObj.obj.IsSuccess || messageObj.obj.errcode == 0)) {
                if (successCallback)
                    successCallback(messageObj.obj);
            } else {
                if (errorCallback)
                    errorCallback(messageObj.obj);
            }
        }, null, data);
    };
})()

window.controls || (window.controls = {});

//简单控件
controls.default = function (el) {
    this.$this = $(el);
};
Object.defineProperty(controls.default.prototype, 'value', {
    get: function () {
        return this.$this.data('value');
    },
    set: function (value) {
        this.$this.data('value', value);
    }
});

//WdatePicker控件
controls.datetime = function (el) {
    this.$this = $(el);
    this.$this.attr('onclick', "WdatePicker({dateFmt:'" + (this.$this.attr("data-format") ? this.$this.attr("data-format") : "yyyy/MM/dd HH:mm:ss") + "'})");

};
Object.defineProperty(controls.datetime.prototype, 'value', {
    get: function () {
        return this.$this.val();
    },
    set: function (value) {
        this.$this.val(value.replace('T', ' '));
    }
});

//单图控件，依赖kindeditor图片控件
controls.singleImg = function (el) {
    this.$this = $(el);
    var genernateId = function (prefix) {
        var rand = Math.floor(Math.random() * 100000);
        if ($('#' + prefix + rand).length == 0)
            return prefix + rand;
        else
            return genernateId(prefix);
    }
    var imgdiv_id = genernateId('imgdiv_id'), uploadiv_id = genernateId('uploadiv_id'), img_id = genernateId('img_id'), select_img = genernateId('select_img'), del_img_id = genernateId('del_img_id');
    this.img_id = img_id;
    this.imgdiv_id = imgdiv_id;
    this.uploadiv_id = uploadiv_id;
    var _this = this;
    var html =
        '<div class="mod-form__control" style="height: 100%;">'
            + '<div class="mod-helper-imgupload" id="' + uploadiv_id + '" style="width: 100%; height: 100%;">'
                + '<div class="icon">'
                + '</div>'
            + '</div>'
            + '<div id="' + imgdiv_id + '" class="mod-helper-imguploaded ui-mr-medium" style="display: none;padding:0;margin:0;height:100%">'
                    + '<img id="' + img_id + '" src="" alt=""  height="100%" width="100%">'
                    + '<div id="' + select_img + '" class="edit">'
                        + '<div class="center">'
                            + '<span id="' + del_img_id + '" class="mod-icon mod-icon_del" title="编辑"></span>'
                        + '</div>'
                    + '</div>'
                + '</div>'
        + '</div>';
    this.$this.html(html);
    var handler = function (btnid, auurl, cbfun, imgview, remote) {
        var editor = K.editor({
            uploadJson: auurl,
            allowFileManager: true,
        });
        K(btnid).click(function () {
            editor.loadPlugin('image', function () {
                editor.plugin.imageDialog({
                    showRemote: remote != null && remote != undefined && remote != false,
                    clickFn: function (url) {
                        if (cbfun) {
                            cbfun(url, imgview);
                        }
                        editor.hideDialog();
                    }
                });
            });
        });

    }

    if (k_ready) {
        handler('#' + uploadiv_id, '/Utility/KindEditAu/Wsq', KAuCB,
            {
                src: '#' + img_id,
                val: "#" + img_id,
                upload: "#" + uploadiv_id,
                div: "#" + imgdiv_id
            });
    } else {
        KindEditor.ready(function (K) {
            handler('#' + uploadiv_id, '/Utility/KindEditAu/Wsq', KAuCB,
            {
                src: '#' + img_id,
                val: "#" + img_id,
                upload: "#" + uploadiv_id,
                div: "#" + imgdiv_id
            })
        });
    }
    function KAuCB(url, imgview) {
        $(imgview.src).attr("src", url).css("display", "block");
        $(imgview.val).val(url);
        $(imgview.upload).css("display", "none");
        $(imgview.div).css("display", "block");
        _this.value = url;
    }

    $("#" + del_img_id).click(function () {
        DialogBox.confirm({
            content: '确定要删除图片？',
            okFn: function () {
                $("#" + img_id).attr("src", "");
                $("#" + imgdiv_id).css("display", "none");
                $("#" + uploadiv_id).css("display", "block");
            }
        });
    });

};
Object.defineProperty(controls.singleImg.prototype, 'value', {
    get: function () {
        return $("#" + this.img_id).attr('src');
    },
    set: function (value) {
        $("#" + this.img_id).attr('src', value);
        if (value) {
            $("#" + this.imgdiv_id).css("display", "block");
            $("#" + this.uploadiv_id).css("display", "none");
        }
        this.$this.blur();
    }
});

//微信卡卷颜色选择
controls.wxCardColor = function (el) {
    var $this = $(el), _this = this;
    this.$this = $this;
    this.inited = false;
    ARAD('get', '/WeiXinCard/GetColors', function (data) {
        _this.inited = true;
        var colors = eval(data.obj), html = '';
        $(colors).each(function () {
            html += '<span class="c_b" style="background:' + this.value + '" name="' + this.name + '"></span>';
        });
        $this.html(html);
        $this.find('span').click(function () {
            $this.find('span').removeClass('selected');
            $(this).addClass('selected');
            $('#background_block').css("background", $(this).css("background"));
        });
        if (!_this._value)
            $('.c_b').first().click()
        else
            _this.value = _this._value;
    });
}
Object.defineProperty(controls.wxCardColor.prototype, 'value', {
    get: function () {
        return this.$this.find('.selected').attr('name');
    },
    set: function (value) {
        if (this.inited)
            this.$this.find('[name=' + value + ']').click();
        else
            this._value = value;
    }
});