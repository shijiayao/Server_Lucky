// 原生模块
import fs from 'fs';
import path from 'path';
import url from 'url';

// 导入模块文件
import GlobalMJS from '../global/global.mjs';

const { _ROOT_PATH_: rootPath } = GlobalMJS;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function sleep(time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export default {
    exampleConfig : {
        url     : 'local.com',
        rootPath,
        default : true, // 默认的服务
        static  : {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Project/Personal/local_code/FE'                                 : ['/FE'],
            '/Project/Personal/local_code/FE/npm-install-public/node_modules' : ['/FE/install-public'],
            '/Project/Work/ShangHai.SongHeng/public-tssp/lib'                 : ['/assets/public-tssp/lib'],
            '/Project/Work/ShangHai.SongHeng/public-dsp/dist'                 : ['/assets/plugins/newdsp']
        },
        customMiddleware : {
            '/'(self, path, request, response, next) {
                if (request.path === '/' || request.path.indexOf('/index') === 0) {
                    let indexFile = fs.readFileSync(path.join(__dirname, path.relative(__dirname, '/Web/node_server/web_root/html'), 'index.html'), {
                        encoding : 'utf-8'
                    });

                    response.status(200).send(indexFile.replace('__IP__', String(request.ip || '').replace('::ffff:', '')).replace('__X-FORWARDED-FOR__', request.headers['x-forwarded-for'] || ''));
                } else {
                    next();
                }
            },
            '/jsonp-proxy/:param?'(self, path, request, response, next) {
                // http://local.com/jsonp-proxy/abc=1?callback=abcfn
                // console.log('Request Type:', request.params);
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query);

                let paramsArray = request.params.param ? String(request.params.param).split('&') : [];
                let queryObject = request.query;
                let callbackName = 'callback';
                let sendObject = {};

                paramsArray.forEach((element) => {
                    let elementArray = element.split('=');

                    if (!isNaN(Number(elementArray[1])) || elementArray[1] === 'true' || elementArray[1] === 'false') {
                        elementArray[1] = JSON.parse(elementArray[1]);
                    }

                    sendObject[elementArray[0]] = elementArray[1] || '';
                });

                for (const key in queryObject) {
                    if (String(key).toLocaleLowerCase().indexOf(callbackName) > -1) {
                        callbackName = key;
                    }
                }

                self.app.set('jsonp callback name', callbackName);
                response.jsonp(sendObject);

                // response.format({
                //   json() {
                //     response.send(`${queryObject[callbackName]}(${JSON.stringify(sendObject)})`);
                //   },
                //   default() {
                //     response.send(request.query);
                //   }
                // });
            },
            '/create-outer-dsp-test-page/:param?'(self, path, request, response, next) {
                // console.log('Request Type:', request.params);
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query);

                let templateFile = fs.readFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp-template.html', { encoding : 'utf-8' });

                fs.writeFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp.html', templateFile.replace('--TEMPLATE-STRING--', request.body.content));

                response.json({ code : 200, message : 'ok' });
            },
            async '/ecms/:param?'(self, path, request, response, next) {
                let indexFile = fs.readFileSync('C:/Users/Administrator/Downloads/ecms.json', { encoding : 'utf-8' });

                await sleep(5000);

                response.json(JSON.parse(indexFile));
            },
            '/local-json/:param?'(self, path, request, response, next) {
                let jsonFile = fs.readFileSync('D:\\Work\\Code\\Test\\Json\\local-zt.json', { encoding : 'utf-8' });
                let jsonArray = JSON.parse(jsonFile);

                jsonArray.sort(() => Math.random() - 0.5);

                let queryObject = request.query;
                let callbackName = 'callback';

                for (const key in queryObject) {
                    if (String(key).toLocaleLowerCase().indexOf(callbackName) > -1) {
                        callbackName = queryObject[key];
                    }
                }

                response.format({
                    json() {
                        response.send(`${callbackName}(${JSON.stringify({ ctime : '2022-10-28 09:30:17', data : jsonArray[0] })})`);
                    },
                    default() {
                        response.send(request.query);
                    }
                });
            },
            '/about/:params?'(self, path, request, response, next) {
                // console.log('Request Type:', request.originalUrl);
                // console.log('Request Type:', request.baseUrl);
                // console.log('Request Type:', request.params);
                // next();

                /**
                 * 解决 url 为路径时的中间件
                 * 例：http://local.mil.eastday.com/about/
                 * 使用框架时的 url 路径匹配返回页面
                 */

                response.sendFile(path.join(self.rootPath, '/Project/Work/ShangHai.SongHeng/mil-newsite/dist/about/index.html'));
            },
            '/theme/'(self, path, request, response, next) {
                // console.log('Request Type:', request.params);
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query);

                next();
            }
        },
        indexPage : {
            enabled   : false,
            indexUrl  : ['/', '/index.html'],
            indexPath : '/Web/node_server/web_root/html/index.html'
        },
        page404 : {
            enabled : false
        },
        proxy : [
            {
                enabled : false,
                options : {
                    pathFilter   : ['**/robot/api.php'],
                    target       : 'http://api.qingyunke.com/api.php',
                    changeOrigin : true,
                    pathRewrite  : {}
                }
            },
            {
                enabled : false,
                options : {
                    pathFilter   : ['/test'],
                    target       : 'http://117.50.108.17',
                    changeOrigin : true,
                    pathRewrite  : {
                        '/test' : '/is/api/v1/streamV2'
                    }
                }
            },
            {
                enabled : true,
                options : {
                    pathFilter         : ['/special_121.html'],
                    target             : 'https://mini.eastday.com',
                    changeOrigin       : true,
                    selfHandleResponse : true,
                    async onProxyResHandle(responseBuffer, proxyRes, req, res) {
                        const response = responseBuffer.toString('utf8'); // convert buffer to string
                        return response.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                    }
                }
            },
            {
                enabled : true,
                options : {
                    pathFilter         : ['/nsa/*.html'],
                    target             : 'https://mini.eastday.com',
                    changeOrigin       : true,
                    selfHandleResponse : true,
                    async onProxyResHandle(responseBuffer, proxyRes, req, res) {
                        const response = responseBuffer.toString('utf8'); // convert buffer to string
                        return response.replace(/\/\/ttpcstatic\.dftoutiao\.com\/ns\//gi, '/ns/'); // manipulate response and return the result
                    }
                }
            }
        ]
    },
    siteConfigArray : [
        {
            url     : 'local.com',
            rootPath,
            default : true, // 默认的服务
            static  : {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Personal/local_code/FE'                                 : ['/FE'],
                '/Project/Personal'                                               : ['/P'],
                '/Project/Personal/local_code/FE/npm-install-public/node_modules' : ['/FE/install-public'],
                '/Project/Work/ShangHai.SongHeng/public-tssp/lib'                 : ['/assets/public-tssp/lib'],
                '/Project/Work/ShangHai.SongHeng/public-dsp/dist'                 : ['/assets/plugins/newdsp']
            },
            customMiddleware : {
                '/'(self, path, request, response, next) {
                    if (request.path === '/' || request.path.indexOf('/index') === 0) {
                        let indexFile = fs.readFileSync(path.join(rootPath, '/Web/node_server/web_root/html', 'index.html'), {
                            encoding : 'utf-8'
                        });

                        response.status(200).send(indexFile.replace('__IP__', String(request.ip || '').replace('::ffff:', '')).replace('__X-FORWARDED-FOR__', request.headers['x-forwarded-for'] || ''));
                    } else {
                        next();
                    }
                },
                '/jsonp-proxy/:param?'(self, path, request, response, next) {
                    // http://local.com/jsonp-proxy/abc=1?callback=abcfn
                    // console.log('Request Type:', request.params);
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query);

                    let paramsArray = request.params.param ? String(request.params.param).split('&') : [];
                    let queryObject = request.query;
                    let callbackName = 'callback';
                    let sendObject = {};

                    paramsArray.forEach((element) => {
                        let elementArray = element.split('=');

                        if (!isNaN(Number(elementArray[1])) || elementArray[1] === 'true' || elementArray[1] === 'false') {
                            elementArray[1] = JSON.parse(elementArray[1]);
                        }

                        sendObject[elementArray[0]] = elementArray[1] || '';
                    });

                    for (const key in queryObject) {
                        if (String(key).toLocaleLowerCase().indexOf(callbackName) > -1) {
                            callbackName = key;
                        }
                    }

                    self.app.set('jsonp callback name', callbackName);
                    response.jsonp(sendObject);

                    // response.format({
                    //   json() {
                    //     response.send(`${queryObject[callbackName]}(${JSON.stringify(sendObject)})`);
                    //   },
                    //   default() {
                    //     response.send(request.query);
                    //   }
                    // });
                },
                '/create-outer-dsp-test-page/:param?'(self, path, request, response, next) {
                    // console.log('Request Type:', request.params);
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query);

                    let templateFile = fs.readFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp-template.html', { encoding : 'utf-8' });

                    fs.writeFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp.html', templateFile.replace('--TEMPLATE-STRING--', request.body.content));

                    response.json({ code : 200, message : 'ok' });
                },
                async '/ecms/:param?'(self, path, request, response, next) {
                    let indexFile = fs.readFileSync('C:/Users/Administrator/Downloads/ecms.json', { encoding : 'utf-8' });

                    await sleep(5000);

                    response.json(JSON.parse(indexFile));
                }
            },
            indexPage : {
                enabled   : false,
                indexUrl  : ['/', '/index.html'],
                indexPath : '/Web/node_server/web_root/html/index.html'
            },
            page404 : {
                enabled : false
            },
            proxy : [
                {
                    enabled : false,
                    options : {
                        pathFilter   : ['**/robot/api.php'],
                        target       : 'http://api.qingyunke.com/api.php',
                        changeOrigin : true,
                        pathRewrite  : {}
                    }
                },
                {
                    enabled : false,
                    options : {
                        pathFilter   : ['/test'],
                        target       : 'http://117.50.108.17',
                        changeOrigin : true,
                        pathRewrite  : {
                            '/test' : '/is/api/v1/streamV2'
                        }
                    }
                },
                {
                    enabled : true,
                    options : {
                        pathFilter         : ['/special_121.html'],
                        target             : 'https://mini.eastday.com',
                        changeOrigin       : true,
                        selfHandleResponse : true,
                        async onProxyResHandle(responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                }
            ]
        },
        {
            url    : 'local.library.com',
            rootPath,
            static : {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work/ShangHai.SongHeng/public-tssp/lib'       : ['/assets/public-tssp/lib'],
                '/Project/Work/ShangHai.SongHeng/public-dsp/dist'       : ['/assets/plugins/newdsp'],
                '/Project/Work/ShangHai.SongHeng/public-dsp/dist_outer' : ['/assets/plugins/newdsp_outer']
            },
            indexPage : {
                enabled   : false,
                indexUrl  : ['/', '/index.html'],
                indexPath : '/index.html'
            },
            page404 : {
                enabled     : false,
                page404Url  : '/404.html',
                page404Type : /\.html/
            },
            proxy : [
                {
                    enabled : false,
                    options : {
                        pathFilter   : ['**/*'],
                        target       : 'https://testtoutiao.eastday.com',
                        changeOrigin : true,
                        pathRewrite  : {}
                    }
                }
            ]
        },
        {
            url    : 'local.11.33.1.253.com',
            rootPath,
            static : {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Temp/browser/javascript/indexeddb.js'     : ['/javascript/indexeddb.js'],
                '/Temp/browser/javascript/children.js'      : ['/javascript/children.js'],
                '/Temp/browser/css/local.11.33.1.253.css'   : ['/css/local.11.33.1.253.css'],
                '/Temp/browser/html/local.11.33.1.253.html' : ['/*', '!**.js', '!**.css']
            },
            indexPage : {
                enabled   : false,
                indexUrl  : ['/', '/index.html'],
                indexPath : '/index.html'
            },
            page404 : {
                enabled     : false,
                page404Url  : '/404.html',
                page404Type : /\.html/
            },
            proxy : [
                {
                    enabled : false,
                    options : {
                        pathFilter   : ['**/*'],
                        target       : 'https://testtoutiao.eastday.com',
                        changeOrigin : true,
                        pathRewrite  : {}
                    }
                }
            ]
        },
        {
            url     : 'local.charles.com',
            rootPath,
            default : false, // 默认的服务
            static  : {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            },
            customMiddleware : {
                '/'(self, path, request, response, next) {
                    // console.log('request', request);
                    // console.log('response', response);
                    next();
                }
            },
            indexPage : {
                enabled   : true,
                indexUrl  : ['/', '/index.html'],
                indexPath : '/Web/node_server/web_root/html/index.html'
            },
            page404 : {
                enabled : false
            },
            proxy : [
                {
                    enabled : true,
                    options : {
                        pathFilter         : ['/static/superman/css/ubase_sync-d600f57804.css'],
                        target             : 'https://wwww.baidu.com',
                        changeOrigin       : true,
                        selfHandleResponse : true,
                        async onProxyResHandle(responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            console.log('proxy response', response);
                            return response; // manipulate response and return the result
                        }
                    }
                }
            ]
        }
    ]
};
