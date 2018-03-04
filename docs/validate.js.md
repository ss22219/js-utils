# validate.js 用法

表单验证，是后台开发中万年不变的话题

https://github.com/ss22219/js-utils/blob/master/jquery.fn/validate.js

## 初始化
```js
<script src="jquery.min.js"></script>
<script src="validate.js"></script>
```
## 添加验证
在需要验证的控件添加`data-rule`属性，并填验证规则
```html
<input type="txt" data-rule="required;number;minLength(10)"/>
```
`data-rule`的语法格式是：
>```name:rule(arg)[msg];```

`name`自定义名称 
`rule`验证规则名 
`arg`规则参数 
`msg`自定义提示

其中 `name`与`msg`都是可选项，某些规则需要传入一个参数

自定义提示中可以使用`{name}`与`{arg}`变量，这在自定义规则中很有用

## jQuery验证插件
validate.js提供了两个jQuery插件方法，分别是 `isValidate,validate`

用于验证控件父级元素时会验证其所有需要验证的控件，比如`$('form')`

其中`isValidate`只检查是否通过验证,`validate`则能够添加错误提示，滚动到错误控件，并返回验证信息

使用js获取控件验证状态：
```js
$('[data-rule]').isValidate() -> bool
```
获取验证消息:

```js
$('form').validate(justTest,scrollTo) -> 
    param: justTest bool 只是检查，不修改Dom
    param: scrollTo bool 滚动到错误元素
    return {
        isValidate : bool,
        messages:[{
            element:jQueryElement,
            message:string
        }]
}
```

## 内置验证规则
`validate.js`内置了一些常用的验证规则，他们分别是
```
required 非空
number 整数
mobile 手机号码
equals(id) 对比两个控件的值
length(...) 固定长度
minLength(...) 最小长度
maxLength(...) 最大长度
gt(...) 大于
lt(...) 小于
```

## 自动验证

form元素中加入data-validate标记，会为form标记内的验证控件进行自动验证
```html
<form data-validate>
    Enter:
    <input type="password" data-rule="密码:required;number[请输入一个整数];equals(target)"/>
    <input type="password" id="target"/>
</form>
```

## 自定义规则
validate.js内置了一些规则，定义在 $.validate.rules下，其结构如下:

``` js
$.validate.rules = {
    required: { rule: /./, message: '不能为空' },
    equals: {
    action: function (el, rule, val, target) {
    return val !== $('#'+target).val();
            　　　　}, message: '两次输入的值不一致'
       　　　　}
}
```
可以往`$.validate.rules`添加自定义规则，规则中包含了 `rule,action,message`

`rule`表示为一个正则规则

`action`表示一个函数验证规则，和`rule`两者是不能同时拥有

`message`可以是一个`“string”`也可以是一个函数，如果是`string`类型，那么可以使用`{name},{arg}`来替换成控件名称与参数

如果是函数，其格式是：
```
message : function (name,arg){ return '' }
```

## 自定义错误提示
validate.js会在验证控件之后加入一个标签`<div class="error_msg"></div>`该标签的模版在`$.validate.errorTemplate`中

```js
$.validate.errorTemplate = '<div class="error_msg">{msg}</div>'
```
## 自定义结果函数
添加错误提示HTML的操作由`validateHandler`实现，validate.js内置了一个简单的验证后操作处理函数

用户可以使用`window.validateHandler = function(msg, scrollTo)`来自己的验证后处理函数(添加提示标签，滚动到错误控件处)



