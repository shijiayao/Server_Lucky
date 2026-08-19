// 原生模块
import fs from 'fs';
import path from 'path';
import url from 'url';

// 导入模块文件
import GlobalMJS from '../server_global/server_global.mjs';

const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function sleep(time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export default {
    exampleConfig: {
        url: 'local.com',
        rootPath: _WORKSPACE_PATH_,
        default: true, // 默认的服务
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Temp': ['/static'],
            '/Temp/browser/html/server-index.html': ['/server-index.html']
            // '/Server_Lucky/response_root_directory/html/index.html' : ['/{*splat}.html']
        },
        customMiddleware: {
            '/'(self, path, request, response, next) {
                if (request.path === '/' || request.path.indexOf('/index') === 0) {
                    let indexFile = fs.readFileSync(path.join(_SERVER_PATH_, '/response_root_directory/html/', 'index.html'), {
                        encoding: 'utf-8'
                    });

                    response.status(200).send(indexFile.replace('__IP__', String(request.ip || '').replace('::ffff:', '')).replace('__X-FORWARDED-FOR__', request.headers['x-forwarded-for'] || ''));
                } else {
                    next();
                }
            },
            '/jsonp-proxy/{:param}'(self, path, request, response, next) {
                // http://local.com/jsonp-proxy/abcd=1234?callback=abcfn&&a=1&b=2
                // console.log('Request Type:', request.params); // { param: 'abcd=1234' }
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query); // { a : 1, b : 2, callback : 'abcfn' }

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
            '/request-proxy/{:id}/abc'(self, path, request, response, next) {
                // http://local.com/request-proxy/123456/abc?callback=abcfn&a=1&b=2
                // console.log('Request Type:', request.params); // { id: '123456' }
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query); // { a: 1, b: 2, callback: 'abcfn' }

                next();
            },
            '/local-json/{:param}'(self, path, request, response, next) {
                let jsonFile = fs.readFileSync('D:\\Work\\Code\\Test\\Json\\local-zt.json', { encoding: 'utf-8' });
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
                        response.send(`${callbackName}(${JSON.stringify({ ctime: '2022-10-28 09:30:17', data: jsonArray[0] })})`);
                    },
                    default() {
                        response.send(request.query);
                    }
                });
            }
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: false
        },
        page404: {
            enabled: false
        },
        proxy: [
            {
                enabled: true,
                options: {
                    pathFilter: ['/static/library/javascript/jquery.js'],
                    target: 'https://cdn.bootcdn.net',
                    changeOrigin: true,
                    pathRewrite: {
                        '/static/library/javascript/jquery.js': '/ajax/libs/jquery/1.9.1/jquery.js'
                    }
                }
            },
            {
                enabled: true,
                options: {
                    pathFilter: ['/test-proxy.html'],
                    target: 'http://local.charles.com',
                    changeOrigin: true,
                    selfHandleResponse: true,
                    pathRewrite: {
                        '/test-proxy.html': '/server-index.html'
                    },
                    async onProxyResHandle(responseBuffer, proxyRes, request, response) {
                        const ResponseString = responseBuffer.toString('utf8'); // convert buffer to string
                        return ResponseString.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                    }
                }
            },
            {
                enabled: true,
                options: {
                    pathFilter: ['/special_121.html'],
                    target: 'https://mini.eastday.com',
                    changeOrigin: true,
                    selfHandleResponse: true,
                    async onProxyResHandle(responseBuffer, proxyRes, request, response) {
                        const ResponseString = responseBuffer.toString('utf8'); // convert buffer to string
                        return ResponseString; // manipulate response and return the result
                    }
                }
            }
        ]
    },
    siteConfigArray: [
        {
            url: 'local.com',
            rootPath: _WORKSPACE_PATH_,
            default: true, // 默认的服务
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Temp': ['/static'],
                '/Temp/browser/html': ['/html'],
                '/Temp/browser/html/server-index.html': ['/server-index.html'],
                '/Temp/browser/javascript/ljs.js': ['/ljs.js']
                // '/Server_Lucky/response_root_directory/html/index.html' : ['/{*splat}.html']
            },
            customMiddleware: {
                '/'(self, path, request, response, next) {
                    if (request.path === '/' || request.path.indexOf('/index') === 0) {
                        let indexFile = fs.readFileSync(path.join(_SERVER_PATH_, '/response_root_directory/html/', 'index.html'), {
                            encoding: 'utf-8'
                        });

                        response.status(200).send(indexFile.replace('__IP__', String(request.ip || '').replace('::ffff:', '')).replace('__X-FORWARDED-FOR__', request.headers['x-forwarded-for'] || ''));
                    } else {
                        next();
                    }
                },
                '/jsonp-proxy/{:param}'(self, path, request, response, next) {
                    // http://local.com/jsonp-proxy/abcd=1234?callback=abcfn&&a=1&b=2
                    // console.log('Request Type:', request.params); // { param: 'abcd=1234' }
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query); // { a : 1, b : 2, callback : 'abcfn' }

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
                '/request-proxy/{:id}/abc'(self, path, request, response, next) {
                    // http://local.com/request-proxy/123456/abc?callback=abcfn&a=1&b=2
                    // console.log('Request Type:', request.params); // { id: '123456' }
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query); // { a: 1, b: 2, callback: 'abcfn' }

                    next();
                },
                '/local-json/{:param}'(self, path, request, response, next) {
                    let jsonFile = fs.readFileSync('D:\\Work\\Code\\Test\\Json\\local-zt.json', { encoding: 'utf-8' });
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
                            response.send(`${callbackName}(${JSON.stringify({ ctime: '2022-10-28 09:30:17', data: jsonArray[0] })})`);
                        },
                        default() {
                            response.send(request.query);
                        }
                    });
                },
                '/api/dafabet'(self, path, request, response, next) {
                    let jsonFile = fs.readFileSync(path.join(_SERVER_PATH_, '/response_root_directory/database/', 'dafabet.json'), { encoding: 'utf-8' });
                    let jsonObject = JSON.parse(jsonFile);

                    const bodyData = request.body || {};
                    const requestType = bodyData.RequestType || 'query';

                    console.log(bodyData);

                    if (requestType === 'add') {
                        bodyData.groupBall.forEach((element) => {
                            jsonObject[bodyData.dafafetName].push(element);
                        });
                        jsonObject[bodyData.dafafetName].sort((a, b) => b.期号 - a.期号);
                        fs.writeFileSync(path.join(_SERVER_PATH_, '/response_root_directory/database/', 'dafabet.json'), JSON.stringify(jsonObject, null, 4), { encoding: 'utf-8' });
                        return response.json(jsonObject);
                    } else if (requestType === 'delete') {
                        jsonObject[bodyData.dafafetName] = jsonObject[bodyData.dafafetName].filter((element) => {
                            return String(element.期号) !== String(bodyData.期号);
                        });
                        fs.writeFileSync(path.join(_SERVER_PATH_, '/response_root_directory/database/', 'dafabet.json'), JSON.stringify(jsonObject, null, 4), { encoding: 'utf-8' });
                        return response.json(jsonObject);
                    } else if (requestType === 'edit') {
                        jsonObject[bodyData.dafafetName] = jsonObject[bodyData.dafafetName].map((element) => {
                            if (String(element.期号) === String(bodyData.期号)) {
                                element.号码 = bodyData.groupBall;
                            }
                            return element;
                        });
                        fs.writeFileSync(path.join(_SERVER_PATH_, '/response_root_directory/database/', 'dafabet.json'), JSON.stringify(jsonObject, null, 4), { encoding: 'utf-8' });
                        return response.json(jsonObject);
                    } else if (requestType === 'update') {
                        bodyData.groupBall.forEach((element) => {
                            jsonObject[element.dafafetName] = jsonObject[element.dafafetName].map((item) => {
                                if (String(item.期号) === String(element.期号)) {
                                    item.开奖号码 = element.开奖号码;
                                    item.开奖日期 = element.开奖日期;
                                    item.中奖金额 = element.中奖金额;
                                }
                                return item;
                            });
                        });
                        fs.writeFileSync(path.join(_SERVER_PATH_, '/response_root_directory/database/', 'dafabet.json'), JSON.stringify(jsonObject, null, 4), { encoding: 'utf-8' });
                        return response.json(jsonObject);
                    } else if (requestType === 'query') {
                        return response.json(jsonObject);
                    }

                    response.json({ code: 404, message: '请求类型错误' });
                }
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: false
            },
            page404: {
                enabled: false
            },
            proxy: [
                {
                    enabled: true,
                    options: {
                        pathFilter: ['/static/library/javascript/jquery.js'],
                        target: 'https://cdn.bootcdn.net',
                        changeOrigin: true,
                        pathRewrite: {
                            '/static/library/javascript/jquery.js': '/ajax/libs/jquery/1.9.1/jquery.js'
                        }
                    }
                },
                {
                    enabled: true,
                    options: {
                        pathFilter: ['/test-proxy.html'],
                        target: 'http://local.charles.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        pathRewrite: {
                            '/test-proxy.html': '/server-index.html'
                        },
                        async onProxyResHandle(responseBuffer, proxyRes, request, response) {
                            const ResponseString = responseBuffer.toString('utf8'); // convert buffer to string
                            return ResponseString.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    options: {
                        pathFilter: ['/special_121.html'],
                        target: 'https://mini.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle(responseBuffer, proxyRes, request, response) {
                            const ResponseString = responseBuffer.toString('utf8'); // convert buffer to string
                            return ResponseString; // manipulate response and return the result
                        }
                    }
                }
            ]
        },
        {
            url: 'local.library.com',
            rootPath: _WORKSPACE_PATH_,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Temp': ['/static', 'library']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: false
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: []
        },
        {
            url: 'local.charles.com',
            rootPath: _WORKSPACE_PATH_,
            default: false,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Temp': ['/static'],
                '/Temp/browser/html/server-index.html': ['/{*splat}.html']
            },
            customMiddleware: {},
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Temp/browser/html/server-index.html'
            },
            page404: {
                enabled: false
            },
            proxy: [
                {
                    enabled: true,
                    options: {
                        pathFilter: ['/static/library/javascript/jquery.js'],
                        target: 'https://cdn.bootcdn.net',
                        changeOrigin: true,
                        pathRewrite: {
                            '/static/library/javascript/jquery.js': '/ajax/libs/jquery/1.9.1/jquery.js'
                        }
                    }
                }
            ]
        },
        {
            url: 'local.11.33.1.253.com',
            rootPath: _WORKSPACE_PATH_,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Temp/browser/html/a.html': ['/a.html'],
                '/Temp/browser/javascript/': ['/javascript/'],
                '/Temp/browser/css/': ['/css/'],
                '/Temp/browser/html/local.11.33.1.253.html': ['/{*splat}', '/{*splat}.html']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: false
            },
            page404: {
                enabled: false
            },
            proxy: []
        }
    ]
};
