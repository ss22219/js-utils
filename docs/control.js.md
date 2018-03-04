# control.js 用法
> control.js是一个轻量级控件框架，简化取值设置值操作，并且把第三方控件自定义控件规范化

## 初始化
```js
<script src="jquery.min.js"></script>
<script src="control.js"></script>
```

## 基本用法
HTML:
```html
<form>
    <input type="text" data-field="name"/>
    <input type="checkbox" name="checked" data-field="checked"/>
    <input type="checkbox" checked=checked value="1" name="select" data-field="select"/>
    <input type="checkbox" value="2" name="select" data-field="select"/>
    <input type="checkbox" checked=checked value="3" name="select" data-field="select"/>
</form>
```
JS:
```js
var initData = {
    name : 'MyName1',
    checked: true,
    select: '2,3'
}
$('form').controlJson(initData)

$('[data-field="name"]').value('MyName')
var name = $('[data-field="name"]').value()

$('form').appendControlJson({name : 'MyName1'})

formData = $('form').controlJson()
$.ajax({
    url: '',
    data: fromData
})
```

control.js只会处理包含`data-field`的控件，`data-field`为生成json中的key，跟input中`name`属性类似

control.js定义了 `value, controlJson, appendControlJson, control` jQuery扩展方法

`value`是`$(xxx).val()`的扩展，能够进一步处理自定义控件，并对checkbox多选做了另外处理

`controlJson`设置和获取整个表单的所有控件值，一般在表单初始化，或者提交表单时用到

`appendControlJson`单独设置一些控件的值，通常用于某几个控件修改时用到

`control`方法获取当前自定义控件的实例

## 自定义控件
control.js将控件分为原生html控件和自定义控件，input等控件的处理在`controls.nativeControl`定义

```
<div data-control="simple"></div>

<script>
    controls.simple = controls.controlBase.extend({
        val: null,
        init: function(){
            this.$el.html('I\'m simple control')
        },
        getValue: function(){
            return this.val
        },
        setValue: function(val){
            this.val = val
            this.$el.html('val:' + val)
        }
    })

    var val = $('[data-control="simple"]').value()
    $('[data-control="simple"]').value('Hello!')

    var controlObj = $('[data-control="simple"]').control()
    val = controlObj.getValue()
</script>
```

在标签上添加`data-control="xxx"`属性，该属性指向了`controls.xxx`的控件定义

向`controls`添加自定义控件，控件必须定义`getValue, setValue`方法

可以使用`controls.controlBase.extend`继承自定义控件

继承后在自定义`init`方法中添加初始化操作，使用`this.$this, this.$el`获取当前控件的jQuery对象

## 兼容validate.js
自定义控件兼容validate.js，但是不能触发blur事件，只有在手动执行`isValidate, validate`方法时才能验证控件

## 封装umeditor
编写一个自定义控件封装umeditor
HTML:
```html
<textarea data-control="umeditor"></textarea>
```
JS:
```js
controls.umeditor = controls.controlBase.extend({
    editor: null,
    init: function () {
        if (!this.$el.attr('id'))
            this.$el.attr('id', this.generateId())
        this.editor = UM.getEditor(this.$el.attr('id'))
    },
    generateId: function () {
        var i = 0
        while ($('#umeditor_' + i).length) {
            i++
        }
        return 'umeditor_' + i
    },
    val: null,
    setValue: function (val) {
        var _this = this
        this.val = val
        if (this.editor.isReady)
            this.editor.setContent(val)
        else
            this.editor.ready(function () {
                _this.editor.setContent(_this.val)
            })
    },
    getValue: function () {
        return this.editor.getContent()
    }
})
```