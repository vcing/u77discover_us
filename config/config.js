// 所有的配置

'use strict';

let config = {

    // 服务端 host
    host: 'http://localhost:3000',

    // web 开发环境的 host
    webHost: 'http://localhost:9000',

    // 跨域白名单
    whiteOrigins: [

		'http://localhost:9000',
		'http://localhost:3000',

		'http://dev.u77pay.avosapps.com',
		'http://u77pay.avosapps.com',
		'http://money.u77.com',
		'http://admin.dev.u77.com',
        'http://www.u77.com',
        'http://dev.u77.com',
        'http://*.u77.com'
    ],

    LC_APP_ID:'ve3Y5Ajkj2sYgnPNJ4pekP6b-MdYXbMMI',
    LC_APP_KEY:'4Y5htwG9T0vwsMX6stbBfIGm',
    LC_MASTER_KEY:'nBL9bTJocG8lHXtgWbnyn1qT',
};

// 判断环境
switch (process.env.LC_APP_ENV) {

    // 当前环境为线上测试环境
    case 'stage':
        config.host    = 'http://dev.u77discover_dev.avosapps.com';
        config.webHost = 'http://dev.u77discover_dev.avosapps.com';
        break;

    // 当前环境为线上正式运行的环境
    case 'production':
        config.host    = 'http://u77discover_dev.avosapps.com';
        config.webHost = 'http://u77discover_dev.avosapps.com';
        break;
}

module.exports = config;