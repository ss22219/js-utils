window.utils = window.utils || {};

function byId(i){
      return document.getElementById(i);
}
(function () {
        var query, params = {};

        if (query = location.href.replace(/#.+?/, '').split('?')[1]) {
            query = query.split('&');

            for (var k = 0; k < query.length; k++) {
                var v = query[k], param = v.split('=');

                if (param.length == 2)

                    params[param[0]] = param[1];
            }
        }

        utils.request = params;
})();

Object.prototype.forEach = function (callback, thisObj) {
        if (callback && typeof this.length != 'undefined') {
            for (var i = 0; i < this.length; i++) {
                if (callback.call(thisObj || this, this[i], this) === false)
                    break;
            }
        }
}

String.prototype.format = function (obj) {
        var str = this;
        for (var k in obj)
            str = str.replace(new RegExp('\\{' + k + '\\}'), obj[k]);
        return str;
}
String.prototype.formats = function (obj) {
        var str = '';
        for (var i=0;i < obj.length; i++)
            str += this.format(obj[i]);
        return str;
}

utils.httpGet = function(url, callback, error) {
        var xmlRequest = new XMLHttpRequest();
        xmlRequest.onreadystatechange = function (ev) {
            if (xmlRequest.readyState == 4) {
		if(xmlRequest.status == 303 || xmlRequest.status == 200){
                	var content = xmlRequest.responseText;
                	callback && callback(content);
		}else{
			error && error(xmlRequest.responseText);
		}
            }
        };
        xmlRequest.open('get', url, true);
        xmlRequest.send();
}
utils.JsonToUrl = function(obj){
     var str = '';
     for(var k in obj){
        if(typeof obj[k] != 'Object' && typeof obj[k] != 'function')
           str += k + '=' + obj[k] + '&';
     }
     return str.replace(/&$/,'');
}

function scroll(setting){
      setting = setting || {};
      this.setting = setting;
      var _this = this;
      var defaultSetting = {
        page : 1,
        pageSize : 30,
        templateId :'template',
        containerId : 'container',
        url : '',
        onloadDataStart : null,
        onloadDataEnd : null,
        onsuccess : null
      };
      for(var k in defaultSetting){
          this.setting[k] = setting[k] || defaultSetting[k];
      }
      _this.lock = false,_this.isLastPage = false,_this.page = 1,_this.pageSize = 30;
      window.onscroll = function(event){
          if(document.body.scrollHeight == window.screen.height + window.scrollY)
            _this.onScrollToBottom();
      }
}
    
scroll.prototype.onScrollToBottom = function(){
      if(this.lock || this.isLastPage)
        return;
      this.lock = true;
      this.loadData();
}
    
scroll.prototype.loadData = function(){
      this.setting.onloadDataStart && this.setting.onloadDataStart(this.setting.page, this.setting.pageSize);
      if(this.isLastPage)
	return;
      _this = this;
      httpGet(this.setting.url, function(data){
        
        data = JSON.parse(data);
        data = (_this.setting.onloadDataEnd && _this.setting.onloadDataEnd(data)) || data;
        
        if(!data || !data.length){
          _this.isLastPage = true;
          return;
        }
          
        var html = '',template = byId(_this.setting.templateId).innerHTML;
        
        html = template.formats(data);
        byId(_this.setting.containerId).appendHTML(html);
        _this.setting.onsuccess && _this.setting.onsuccess(data);
        _this.setting.page++;
        _this.lock = false;
      },function(errData){
        _this.lock = false;
      });
}