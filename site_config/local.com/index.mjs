import { fs, path, GlobalMJS } from '../../lib/deps.mjs';

const __dirname = import.meta.dirname;
const lastSegment = path.basename(__dirname);
console.log('__dirname', __dirname, ' --- ', 'lastSegment:', lastSegment);

const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;

export default {
    url: lastSegment,
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
};
