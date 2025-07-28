// 原生模块
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import https from 'https';
import url from 'url';

// 插件模块
import _ from 'lodash';
import log4js from 'log4js'; // 日志
import express from 'express'; // node.js Web 应用框架
import mime from 'mime'; // 文件 mime 类型
import compression from 'compression'; // 服务端 GZip 压缩
import multer from 'multer'; // 用于处理 multipart/form-data 类型的表单数据 node.js 中间件，它主要用于上传文件。注意: Multer 不会处理任何非 multipart/form-data 类型的表单数据。
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware'; // 代理服务

// 导入模块文件
import ServerListOptionsMJS from './server_list_options.mjs'; // 站点配置文件
import GlobalMJS from '../server_global/server_global.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;
const { siteConfigArray } = ServerListOptionsMJS;

// 路径分隔符
const _Path_Segment_Separator_ = path.sep;

/**
 * dev.*
 * Windows Sandbox 的 dns 服务使用的是宿主机 hosts 解析，返回 127.0.0.1 导致沙箱无法正常访问域名，通过重设 dev.* 域名指向宿主机 IP 可解决
 * TODO: 奇怪的问题
 */
const exampleConfigArray = [].concat(
    _.cloneDeep(siteConfigArray),
    _.cloneDeep(siteConfigArray).map((element, index) => {
        element.url = element.url.replace('local.', 'dev.');
        return element;
    })
);

/*
try {
    // 本地 IP 地址
    let LocalIPAddress = '';

    let NetworkInfo = os.networkInterfaces();

    console.log(NetworkInfo);

    NetworkInfo.以太网.forEach((element, index, array) => {
        if (element.family === 'IPv4') {
            LocalIPAddress = element.address;
        }
    });
} catch (error) {}
*/

/**
 * ExpressRouter
 * 子路由实例
 * ServerApp 全局中间件分发子路由（对应 hostname）处理程序
 */
class ExpressRouter {
    constructor(params = {}, options = {}) {
        // 实例化子路由
        this.router = express.Router(options);

        this.app = params.app;

        // server 参数
        this.url = params.url || '127.0.0.1';
        this.rootPath = params.rootPath || _WORKSPACE_PATH_; // 根目录路径
        this.serverPath = _SERVER_PATH_; // Server 根目录路径

        // 自定义中间件
        this.customMiddleware = params.customMiddleware || {}; // 自定义中间件对象

        // 静态资源参数
        this.static = params.static || {}; // 静态资源对象

        // 代理服务设置
        this.proxy = params.proxy || [];

        // 指定访问首页的功能
        this.indexPage = params.indexPage || {};

        // 重定向到 404 页面，只对每个请求链接做重定向，不会导致整个页面重定向
        this.page404 = params.page404 || {};

        this.init();
    }

    init() {
        const _this = this;

        _this.useCustomMiddleware();
        _this.staticResource();
        _this.proxyRequest();
        _this.uploadRequest();
        _this.lastAllResponse();
    }

    // 使用自定义中间件
    useCustomMiddleware() {
        const _this = this;

        for (const key in _this.customMiddleware) {
            _this.router.use(key, (request, response, next) => {
                _this.customMiddleware[key](_this, path, request, response, next);
            });
        }
    }

    // 配置静态资源，即使找不到也不会响应404，而是调用 next()
    staticResource() {
        const _this = this;

        for (const key in _this.static) {
            _this.static[key].forEach((element, index) => {
                _this.router.use(element, express.static(path.join(_this.rootPath, key), { extensions : ['html'] }));
            });
        }
    }

    // 代理请求
    proxyRequest() {
        const _this = this;

        /**
         * options.selfHandleResponse
         * options.onProxyRes
         *
         * 拦截和操纵响应
         * 只有 selfHandleResponse 为 true 时才能执行 onProxyRes
         */

        /**
         * options.pathRewrite
         *
         * 代理路径规则
         * 可以使用参数 pathRewrite 改写路径(前端请求 /api/old-path => 实际代理 /api/new-path)
         * '^/api/old-path': '/api/new-path', // rewrite path 修改路径，重写路径
         * '^/api/remove/path': '/path' // remove base path 删除路径
         *
         * proxyPath(匹配路径 / 精确路径) 路径和 options.pathRewrite(精确路径) 路径要对应
         */

        /**
         * options.router
         *
         * 代理地址规则
         * 根据请求的主机地址不同以改写不同的代理主机 target => newTarget
         * when request.headers.host == 'dev.localhost:3000',
         * override target 'http://www.example.org' to 'http://localhost:8000'
         * 'dev.localhost:3000': 'http://localhost:8000'
         */

        _this.proxy.forEach((element, index) => {
            if (element.enabled) {
                let createProxyOptions = element.options;
                let onProxyResHandle = createProxyOptions.onProxyResHandle || function () {};

                if (createProxyOptions.selfHandleResponse) {
                    createProxyOptions.on = {
                        proxyRes : responseInterceptor(onProxyResHandle)
                    };
                }

                delete createProxyOptions.onProxyResHandle;

                _this.router.use('/', createProxyMiddleware(createProxyOptions));
            }
        });
    }

    // 上传处理
    uploadRequest() {
        const _this = this;

        // 上传文件使用 multer 中间件，注意: Multer 不会处理任何非 multipart/form-data 类型的表单数据。
        let storage = multer.diskStorage({
            destination(request, file, callback) {
                callback(null, './uploads/');
            },
            filename(request, file, callback) {
                let timeNum = +new Date();
                let fileType = mime.getExtension(file.mimetype);

                callback(null, `${file.fieldname}-${timeNum}.${fileType}`);
            }
        });

        let upload = multer({
            storage,
            limits : {
                fileSize : 100 // 字节
            },
            fileFilter(req, file, callback) {
                // 设置一个函数来控制什么文件可以上传以及什么文件应该跳过
                console.log(222, file);

                callback(null, /image/.test(file.mimetype)); // 只允许上传图片文件
            }
        });

        // name 为前端上传文件时使用的 name 属性，是 node 定义的用于接受文件数据的接口参数
        let cpUpload = upload.fields([{ name : 'wenjian', maxCount : 10 }]);

        // 上传文件处理
        _this.router.post('/upload', cpUpload, (request, response, next) => {
            response.json({ statusCode : 200, result : true });
        });
    }

    // 最后处理所有没有匹配到的路由
    lastAllResponse() {
        const _this = this;

        _this.router.all('{*splat}', (request, response, next) => {
            const method = String(request.method).toLocaleUpperCase();

            let postData = null;
            let postPath = '';

            switch (method) {
                case 'GET':
                    // 指定访问首页的功能
                    if (_this.indexPage.enabled && _this.indexPage.indexUrl.some((element, index) => request.path === element)) {
                        const indexHtmlFile = _this.indexPage.indexPath ? path.join(_this.rootPath, _this.indexPage.indexPath) : path.join(_this.serverPath, '/response_root_directory/html/index.html');
                        response.sendFile(indexHtmlFile);
                    } else {
                        // 404 页面功能

                        // 获取路由文件
                        const routeFile = path.join(_this.rootPath, request.path);

                        if (fs.existsSync(routeFile)) {
                            // 如果路由文件存在，则直接读取文件
                            response.sendFile(routeFile);
                        } else if (_this.page404.enabled && _this.page404.page404Type.test(request.path)) {
                            // 如果路由文件不存在，判断是否需要重定向
                            response.redirect(302, _this.page404.page404Url);
                        } else {
                            // 如果路由文件不存在且不需要重定向，则读取根目录下的 404 页面
                            const html404File = fs.readFileSync(path.join(_this.serverPath, '/response_root_directory/html', '404.html'), {
                                encoding : 'utf-8'
                            });

                            const error = { path : request.path, error : 'Not Found', status : 404 };

                            // 响应 404 状态码
                            response.status(404).send(html404File.replace('/* __CODE_REPLACE__ */', `let error404 = ${JSON.stringify(error)}; console.log(error404);`));
                            // response.status(404).send(`Not Found</br>${error}</br><script>let error404 = ${JSON.stringify(error)}; console.log(error404);</script>`);
                        }
                    }
                    break;

                case 'POST':
                    postData = request.body;

                    response.json({ statusCode : 200, message : `没有对应的[${method}]处理程序` });
                    break;

                default:
                    response.json({ statusCode : 200, message : `没有对应的[${method}]处理程序` });
                    break;
            }
        });
    }
}

/**
 * 本地服务器构造函数
 * @param {Object} params             参数对象
 * {
 *    url:               [String]  [选填]    本地服务地址，默认为 127.0.0.1
 *    rootPath:          [String]  [选填]    本地服务的根目录，默认为 'D:/'
 *    port:              [Number]  [必填]    端口号
 *    static:            [Object]  [选填]    静态资源目录配置，键值对，键为实际响应目录或文件，值为页面请求的目录或文件数组
 *    customMiddleware   [Object]  [选填]    自定义中间件，处理一些特殊逻辑
 *    indexPage:         [Object]  [选填]    指定访问首页的功能
 *    page404:           [Object]  [选填]    重定向到 404 页面设置
 *    proxy:             [Array]   [选填]    代理服务设置
 * }
 */
class ServerApp {
    constructor(params = {}) {
        this.logger = null;

        this.app = null;

        // server 参数
        this.url = '127.0.0.1';
        this.serverPath = _SERVER_PATH_; // Server 根目录路径

        // 路由对象
        this.routerObject = {};

        this.init();
    }

    init() {
        const _this = this;

        // 初始化日志模块
        _this.log4jsInit();

        // 创建 express 服务
        _this.app = express();

        // 注册路由 依赖 _this.app
        _this.registerRouter();

        // 如果能匹配到路由，则路由相关的中间件优先级要高于 / 和 *

        // 需要考虑执行顺序，中间件、静态资源、代理...
        _this.setHeader();
        _this.useMiddleware();
        _this.openServer();
    }

    // 日志模块配置
    log4jsInit() {
        const _this = this;

        // 配置说明 参考官方文档
        log4js.configure({
            appenders : {
                console : { type : 'console', layout : { type : 'pattern', pattern : '[%p] %m' } },
                file    : { type : 'file', layout : { type : 'pattern', pattern : '[%d{yyyy/MM/dd hh:mm:ss:SSS}] [%p] %m' }, filename : './logs/application.log' }
            },
            categories     : { default : { appenders : ['console', 'file'], level : 'trace' } },
            pm2            : true,
            pm2InstanceVar : 'INSTANCE_ID'
        });

        _this.logger = log4js.getLogger();
    }

    // 日志中间件
    log4jsMiddleware() {
        const _this = this;

        // 配置说明 https://log4js-node.github.io/log4js-node/connect-logger.html
        _this.app.use(
            log4js.connectLogger(_this.logger, {
                level  : 'auto',
                format : `[:method] [:status] [HTTP/:http-version] [:hostname] [:url] [:referrer] [:user-agent] [:content-length] [:response-timems] [:remote-addr]`
            })
        );
    }

    // 注册路由
    registerRouter() {
        const _this = this;

        exampleConfigArray.forEach((element, index) => {
            element.app = _this.app;
            // 实例化子路由
            _this.routerObject[element.url] = new ExpressRouter(element);
        });
    }

    // 设置响应头
    setHeader() {
        const _this = this;

        // headers 参数
        let ResponseHeadersConfig = {
            'Access-Control-Allow-Headers' : '*',
            'Access-Control-Allow-Methods' : '*',
            'Access-Control-Allow-Origin'  : '*'
        };

        // allow custom header and CORS
        _this.app.all('{*splat}', (request, response, next) => {
            for (const key in ResponseHeadersConfig) {
                response.header(key, ResponseHeadersConfig[key]);
            }

            let method = request.method.toLocaleUpperCase();

            if (method === 'OPTIONS') {
                response.sendStatus(200); /* 让 options 请求快速返回 */
            } else {
                next();
            }
        });
    }

    // 中间件
    useMiddleware() {
        const _this = this;

        // 日志中间件
        _this.log4jsMiddleware();

        // 在响应文件前使用服务端 GZip 压缩
        _this.app.use(compression());

        // extended: true 表示使用 qs库来解析查询字符串
        // extended: false 表示使用 querystring 库来解析字符串
        _this.app.use(express.json());
        _this.app.use(express.raw());
        _this.app.use(express.text());
        _this.app.use(express.urlencoded({ extended : true }));

        // 全局中间件
        _this.globalMiddleware();
    }

    /**
     * Application 的全局中间件
     * 第一层全局中间件，每个请求都会先经过此中间件，然后由此中间件来分发对应 hostname 的子路由
     * （实例化后的子路由可以当做中间件直接使用）
     * 每个子路由再处理对应的请求
     */
    globalMiddleware() {
        const _this = this;

        _this.app.use((request, response, next) => {
            // 此中间件按照 request.hostname 分发到对应的子路由，如没有对应的子路由则分发到默认的子路由
            (_this.routerObject[request.hostname] || _this.routerObject[exampleConfigArray[0].url]).router(request, response, next);
        });
    }

    // 开启服务
    openServer() {
        const _this = this;

        const Certificate_Path = path.join(_this.serverPath, '/Certificate_HTTPS');

        // 同步读取密钥和签名证书
        let options = {
            key  : fs.readFileSync(path.join(Certificate_Path, 'certificate_https.key'), 'utf8'),
            cert : fs.readFileSync(path.join(Certificate_Path, 'certificate_https.crt'), 'utf8')
        };

        // HTTPS
        _this.server_https = https.createServer(options, _this.app).listen(443, () => {
            console.log(`[${_this.server_https.address().port}] https://${_this.url}:${_this.server_https.address().port}`);
        });

        // HTTP
        _this.server_http = http.createServer(_this.app).listen(80, () => {
            console.log(`[${_this.server_http.address().port}] http://${_this.url}:${_this.server_http.address().port}`);
        });
    }
}

export default ServerApp;
