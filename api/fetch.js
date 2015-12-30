var AV      = require('../cloud/av.js');
var router  = require('express').Router();
var q       = require('q');
var cheerio = require('cheerio');
var request = require('request');
var iconv   = require('iconv-lite');
var err 	= require('../cloud/error.js');
var _       = require('lodash');
var moment  = require('moment');

var support = {
	'kongregate.com':function(url){
		var deffered = q.defer();
		var remove = ['!','#','?','&'];
		var originUrl = url;
		_.map(remove,function(bad){
			if(url.indexOf(bad) != -1){
				url = url.split(bad)[0];
			}
		});
		url += "/show_hover";
		request({
			url:url,
			method:'GET',
			timeout:15000
		},function(err,res,body){
			if(err || !body){
				err.status = 101;
				err.msg = "未找到游戏资源.";
				err.err = err;
				deffered.reject(err);
				return false;
			}
			if(res.statusCode == 404){
				var err = {
					status : 101,
					msg : "未找到游戏资源."
				}
				deffered.reject(err);
				return false;
			}
			var html = body;
			var $ = cheerio.load(html);
			if($('.screenshot_img').length == 0){
				var err = {
					status : 101,
					msg : "未找到游戏资源."
				}
				deffered.reject(err);
				return false;
			}
			downloadQuene = [];
			_.map($('.screenshot_img'),function(dom){
				downloadQuene.push(downloadImage($(dom).attr('src')));
			});
			q.all(downloadQuene).then(function(results){
				var title = $('.gm_desc.gm_title h1').text() || $('.game_title').text();
				var description = $('#gm_summary p').text() || $('.game_cont .desc').text();
				if(title && description){
					var result = {
						title:title,
						description:description,
						img:results,
						url:originUrl,
						status:0
					}
					deffered.resolve(result);
				}else{
					var err = {
						status : 101,
						msg : "游戏数据获取失败."
					}
					deffered.reject(err);
					return false;
				}
			},function(err){
				err.status = 102;
				err.msg = "图片存储错误.";
				deffered.reject(err);
				return false;
			});	
		});
		return deffered.promise;
	}
}

function downloadImage(url){
	// 去掉图片参数
	var remove = ['!','#','?','&'];
	_.map(remove,function(bad){
		if(url.indexOf(bad) != -1){
			url = url.split(bad)[0];
		}
	});
	var deffered = q.defer();
	var auth = new Buffer('u77fetch:u77fetch');
	var saveUrl = "http://v0.api.upyun.com/u77img/discover-fetch/"+moment().year()+"/"+moment().month()+"/"+randomString(16)+'.'+getExtension(url);
	request.get({
		url:url,
		method:'GET',
		timeout:15000
	},function(err,res,body){
		if(err || !body){
			deffered.reject(err ? err : 'no body');
		}
	})
	.pipe(request({
		url:saveUrl,
		method:'PUT',
		headers:{
			"Authorization":'Basic '+auth.toString('base64')
		}
	},function(err,res,body){
		if(err || body || res.headers['x-error-code']){
			deffered.reject(err?err:body || res.headers['x-error-code']);
		}else{
			deffered.resolve({url:saveUrl.replace('v0.api.upyun.com/u77img','img.u77.com')});
		}
	}));
	
	return deffered.promise;
}

function getExtension(url){
	var _bad = ['!','#','?'];
	var _arr = url.split('.');
	_ext = _arr[_arr.length - 1];
	if(_ext.length <= 4){
		return _ext;
	}else{
		_.map(_bad,function(bad){
			if(_ext.indexOf(bad) != -1){
				_ext = _ext.split(bad)[0];
			}
		});
		return _ext;
	}
}

function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

function fetch(url){
	var _fn;
	_.mapKeys(support,function(fn,key){
		if(url.indexOf(key) != -1){
			_fn = fn;
		}
	});
	if(_fn === undefined){
		var deffered = q.defer();
		var err = {
			status : 101,
			msg : "未找到游戏资源."
		}
		deffered.reject(err);
		return deffered.promise;
	}
	return _fn(url);
}

function createGame(url,res){
	fetch(url).then(function(result){
		result.originUrl = result.url;

		delete result.url;
		result.u77Id = result.u77Id || 0;
		result.times = 0;
		res.json(result);
	},function(err){
		if(err.status){
			res.json(err);
		}else{
			err.status = 111;
			err.msg = '创建游戏出错,请重试';
			res.json(err);
		}
		
	});
}

router.get('/:url',function(req,res){
	var url = req.params.url;
	createGame(url,res);		
});

router.post('/:url',function(req,res){
	var url = req.params.url;
});



module.exports = router;
