// 原生模块
const path = require('node:path');
const fs = require('node:fs');

// 导入模块文件
const { _ROOT_PATH_: rootPath } = require('../global/global.js');

function sleep (time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

module.exports = {
    siteConfigArray: [
        {
            url: 'local.com',
            rootPath,
            default: true, // 默认的服务
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Code/Test': ['/Test', '/test'],
                '/Project/Code/Test/npm-install-public/node_modules': ['/Test/install-public', '/test/install-public'],
                '/Project/Work.sh.songheng/public-tssp/lib': ['/assets/public-tssp/lib'],
                '/Project/Work.sh.songheng/public-dsp/dist': ['/assets/plugins/newdsp']
            },
            customMiddleware: {
                '/' (self, path, request, response, next) {
                    if (request.path === '/' || request.path.indexOf('/index') === 0) {
                        let indexFile = fs.readFileSync(path.join(rootPath, '/Web/node_server/web_root/html', 'index.html'), {
                            encoding: 'utf-8'
                        });

                        response.status(200).send(indexFile.replace('__IP__', String(request.ip || '').replace('::ffff:', '')).replace('__X-FORWARDED-FOR__', request.headers['x-forwarded-for'] || ''));
                    } else {
                        next();
                    }
                },
                '/jsonp-proxy/:param?' (self, path, request, response, next) {
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
                '/create-outer-dsp-test-page/:param?' (self, path, request, response, next) {
                    // console.log('Request Type:', request.params);
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query);

                    let templateFile = fs.readFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp-template.html', { encoding: 'utf-8' });

                    fs.writeFileSync('D:\\Work\\Code\\Test\\HTML\\test-outer-dsp.html', templateFile.replace('--TEMPLATE-STRING--', request.body.content));

                    response.json({ code: 200, message: 'ok' });
                },
                async '/ecms/:param?' (self, path, request, response, next) {
                    let indexFile = fs.readFileSync('C:/Users/Administrator/Downloads/ecms.json', { encoding: 'utf-8' });

                    await sleep(5000);

                    response.json(JSON.parse(indexFile));
                }
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Web/node_server/web_root/html/index.html'
            },
            page404: {
                enabled: false
            },
            proxy: [
                {
                    enabled: false,
                    proxyPath: ['**/robot/api.php'],
                    options: {
                        target: 'http://api.qingyunke.com/api.php',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                },
                {
                    enabled: false,
                    proxyPath: ['/test'],
                    options: {
                        target: 'http://117.50.108.17',
                        changeOrigin: true,
                        pathRewrite: {
                            '/test': '/is/api/v1/streamV2'
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/special_121.html'],
                    options: {
                        target: 'https://mini.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                }
            ]
        },
        {
            url: 'local.library.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/public-tssp/lib': ['/assets/public-tssp/lib'],
                '/Project/Work.sh.songheng/public-dsp/dist': ['/assets/plugins/newdsp'],
                '/Project/Work.sh.songheng/public-dsp/dist_outer': ['/assets/plugins/newdsp_outer']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: '/index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: false,
                    proxyPath: ['**/*'],
                    options: {
                        target: 'https://testtoutiao.eastday.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.mini.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                // eastday-pc 目录
                '/Project/Work.sh.songheng/eastday-pc/www-root/assets': ['/assets'],
                '/Project/Work.sh.songheng/eastday-pc/www-root/special_test.html': ['/special_test.html'],
                '/Project/Work.sh.songheng/eastday-pc/www-root/user.html': ['/user/index.html'],
                // newsite 目录
                '/Project/Work.sh.songheng/newsite/dist/': ['/ns'],
                '/Project/Work.sh.songheng/newsite/src/detail/uk.html': ['/nsa/uk.html'],
                '/Project/Work.sh.songheng/newsite/dist/lenovo/detail.html': ['/lenovo/*.html'],
                '/Project/Work.sh.songheng/newsite/dist/channel/women.html': ['/women.html'],
                '/Project/Work.sh.songheng/mini-detail-qiqi/dist/index.html': ['/b/*.html'],
                '/Project/Work.sh.songheng/mini-detail-qiqi/dist/': ['/staticpc/qdxinwen/']
            },
            customMiddleware: {
                '/local-json/:param?' (self, path, request, response, next) {
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
                        json () {
                            response.send(`${callbackName}(${JSON.stringify({ ctime: '2022-10-28 09:30:17', data: jsonArray[0] })})`);
                        },
                        default () {
                            response.send(request.query);
                        }
                    });
                }
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/newsite/dist/index.html'
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/special_226.html', '/special_228.html', '/special_261.html'],
                    options: {
                        target: 'http://testmini.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/testmini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/special_121.html'],
                    options: {
                        target: 'https://mini.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/special_265.html'],
                    options: {
                        target: 'http://test.sports.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/testmini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/special_417.html'],
                    options: {
                        target: 'https://sports.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/mini\.eastday\.com\/assets\//gi, '/assets/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/nsa/*.html'],
                    options: {
                        target: 'https://mini.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/\/\/ttpcstatic\.dftoutiao\.com\/ns\//gi, '/ns/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/miniggresource/'],
                    options: {
                        target: 'http://testmini.eastday.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/static/**', '/assets/**', '/json/**', '/ns/api/**', '/data/*'],
                    options: {
                        target: 'https://mini.eastday.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.kankan.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/newsite/dist/': ['/ns']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/newsite/dist/kankan/index.html'
            },
            proxy: []
        },
        {
            url: 'local.toutiao.lieqibar.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/newsite_pure/dist': ['/'],
                '/Project/Work.sh.songheng/newsite_pure/dist/lieqibar/detail.html': ['/news/*.html'],
                '/Project/Work.sh.songheng/newsite_pure/dist/topic/index.html': ['/topic/index.html']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/newsite_pure/dist/index.html'
            },
            proxy: []
        },
        {
            url: 'local.xingzuo.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/xingzuo/www-root/html/lieqi.html': ['/lieqi.html'],
                '/Project/Work.sh.songheng/xingzuo/www-root/assets': ['/assets'],
                '/Project/Work.sh.songheng/xingzuo/www-root/src': ['/assets', '/src']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/lieqi_mini/'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/json/**'],
                    options: {
                        target: 'http://testxingzuo.eastday.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                },
                {
                    enabled: false,
                    proxyPath: ['/eastday/img/lunbotu.json'],
                    options: {
                        target: 'https://minipc.eastday.com',
                        changeOrigin: true,
                        pathRewrite: { '/eastday/img/lunbotu.json': '/ccms/eafe761d1f/eafe761d1f_169_466_v11.json' }
                    }
                }
            ]
        },
        {
            url: 'local.1.mini.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/1_mini/dfzx': ['/dfzx']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: false,
                    proxyPath: ['/miniassets/'],
                    options: {
                        target: 'http://local.mini.eastday.com',
                        changeOrigin: true,
                        pathRewrite: { '/miniassets/': '/assets/' }
                    }
                }
            ]
        },
        {
            url: 'local.h5.lieqinews.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/lieqinews_h5_list/src/js': ['/js'],
                '/Project/Work.sh.songheng/lieqinews_h5_list/src/css': ['/css'],
                '/Project/Work.sh.songheng/lieqinews_h5_list/src/img': ['/img'],
                '/Project/Work.sh.songheng/lieqinews_h5_list/src/favicon.ico': ['/favicon.ico'],
                '/Project/Work.sh.songheng/lieqinews_h5_list/src/shcs.html': ['/shcs.html'],
                '/Project/Work.sh.songheng/lieqinews_h5_detail/src/js': ['/mobile/js', '/m/js'],
                '/Project/Work.sh.songheng/lieqinews_h5_detail/src/css': ['/mobile/css', '/m/css'],
                '/Project/Work.sh.songheng/lieqinews_h5_detail/src/img': ['/mobile/img', '/m/img'],
                '/Project/Work.sh.songheng/lieqinews_h5_detail/src/details.html': ['/mobile/*.html'],
                '/Project/Work.sh.songheng/lieqinews_h5_detail/src/details_all.html': ['/m/*.html']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/lieqinews_h5_list/src/index.html'
            },
            page404: {
                enabled: true,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: false,
                    proxyPath: ['/img/loading.jpg'],
                    options: {
                        target: 'https://wap.lieqinews.com',
                        changeOrigin: true,
                        pathRewrite: { '/img/loading.jpg': '/img/loading.jpg' }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/json'],
                    options: {
                        target: 'https://lieqinews.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.lieqi.kzynews.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                // '/Project/Work.sh.songheng/lieqinews_pc/www-root/': ['/'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/assets': ['/assets', '/Project/Work.sh.songheng/lieqinews_pc/assets'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/frames': ['/frames'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/mini_page': ['/mini_page'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_topic.html': ['/topic.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_detail_v15.html': ['/a-detail.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/picture/picture.html': ['/picture/*.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_tips.html': ['/tips.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_404.html': ['/404.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/njump/index.html': ['/n/*.html'],
                '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_channel.html': ['/channel.html']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/lieqinews_pc/www-root/local_index.html'
            },
            page404: {
                enabled: true,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: [
                        '/yl.html',
                        '/sh.html',
                        '/ls.html',
                        '/qg.html',
                        '/xz.html',
                        '/jk.html',
                        '/ylbg.html',
                        '/ysmw.html',
                        '/kj.html',
                        '/cj.html',
                        '/yx.html',
                        '/ty.html',
                        '/ly.html',
                        '/qc.html',
                        '/jy.html',
                        '/ss.html',
                        '/ye.html',
                        '/xh.html',
                        '/dm.html',
                        '/cw.html',
                        '/fc.html',
                        '/jj.html',
                        '/shcs.html'
                    ],
                    options: {
                        target: 'https://lieqi.kzynews.com/',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response; // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/a/*.html'],
                    options: {
                        target: 'https://lieqi.kzynews.com/',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response; // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/miniassets/'],
                    options: {
                        target: 'http://local.mini.eastday.com',
                        changeOrigin: true,
                        pathRewrite: { '/miniassets/': '/assets/' }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/lieqiggresource/**/*', '/assets/js/resources/**/*.js', '**/*.json'],
                    options: {
                        // target: 'https://lieqi.sqdtfc.com',
                        target: 'http://test2.lieqinews.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.yangsheng.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/yangsheng/www-root/aassets': ['/aassets'],
                '/Project/Work.sh.songheng/yangsheng/www-root/assets': ['/assets'],
                '/Project/Work.sh.songheng/yangsheng/www-root/temp/yiqing.html': ['/2019nCoV/index.html'],
                '/Project/Work.sh.songheng/yangsheng/www-root/temp/topic.html': ['/topic.html', '/topic/topic.html'],
                '/Project/Work.sh.songheng/yangsheng/www-root/temp/detail.html': ['/a/*.html'],
                '/Project/Work.sh.songheng/yangsheng/www-root/temp/zhuanti.html': ['/zhuanti/*.html'],
                '/Project/Work.sh.songheng/yangsheng/www-root/temp/tag.html': ['/tag-*/index.html'],
                '/Project/Work.sh.songheng/yseastday_h5/www-root/details_new.html': ['/mobile/*.html'],
                '/Project/Work.sh.songheng/yseastday_h5/www-root/static': ['/static']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/yangsheng/www-root/temp/index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/ysggresource_v1/', '/ysapi/'],
                    options: {
                        target: 'http://testyangsheng.eastday.com',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.www.9973.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/9973com/': ['/']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/9973com/index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: []
        },
        {
            url: 'local.video.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/video_eastday/www-root/assets': ['/assets'],
                '/Project/Work.sh.songheng/video_eastday/www-root/a/detail.html': ['/a/*.html']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/video_eastday/www-root/index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/videoggresource/', '/json/'],
                    options: {
                        target: 'https://video.eastday.com/',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.mil.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/mil-newsite/dist': ['/ns'],
                '/Project/Work.sh.songheng/mil-newsite/dist/topic/index.html': ['/topic/index.html'],
                '/Project/Work.sh.songheng/mil-newsite/src/detail/uk.html': ['/nsa/uk.html'],
                '/Project/Work.sh.songheng/mil-newsite/src/njump/njump.html': ['/a/njump.html']
            },
            customMiddleware: {
                '/about/:params?' (self, path, request, response, next) {
                    // console.log('Request Type:', request.originalUrl);
                    // console.log('Request Type:', request.baseUrl);
                    // console.log('Request Type:', request.params);
                    // next();

                    /**
                     * 解决 url 为路径时的中间件
                     * 例：http://local.mil.eastday.com/about/
                     * 使用框架时的 url 路径匹配返回页面
                     */

                    response.sendFile(path.join(self.rootPath, '/Project/Work.sh.songheng/mil-newsite/dist/about/index.html'));
                }
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/mil-newsite/src/index/index.html'
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/nsa/*.html'],
                    options: {
                        target: 'https://mil.eastday.com/',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/milggresource/', '/static/api/', '/json/video_for_detail.json'],
                    options: {
                        target: 'http://testmil.eastday.com/',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/ns/json/', '/ns/api/'],
                    options: {
                        target: 'http://testmil.eastday.com/',
                        changeOrigin: true,
                        pathRewrite: {}
                    }
                }
            ]
        },
        {
            url: 'local.auto.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/autoeastday/www-root/autoeastday-activity/src/w126.html': ['/w126.html'],
                '/Project/Work.sh.songheng/autoeastday/www-root/assets/activity/static': ['/static']
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: ''
            },
            page404: {
                enabled: false,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: []
        },
        {
            url: 'local.www.songhengnet.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/sm-net/dist': ['/']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/sm-net/src/index.html'
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/site/'],
                    options: {
                        target: 'http://oceanengine.songmei.com.cn',
                        changeOrigin: true
                    }
                }
            ]
        },
        {
            url: 'local.mini.lanshan.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/minis_page/mini': ['/mini']
            },
            customMiddleware: {
                '/mini/bdcoo001/:params?' (self, path, request, response, next) {
                    // console.log('Request Type:', request.originalUrl);
                    // console.log('Request Type:', request.baseUrl);
                    // console.log('Request Type:', request.params);
                    // next();

                    /**
                     * 解决 url 为路径时的中间件
                     * 例：http://local.mil.eastday.com/about/
                     * 使用框架时的 url 路径匹配返回页面
                     */

                    response.sendFile(path.join(self.rootPath, '/Project/Work.sh.songheng/minis_page/mini/bdcoo001/index.html'));
                }
            },
            indexPage: {
                enabled: false,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/minis_page/mini/bdcoo001/index.html'
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/json/'],
                    options: {
                        target: 'http://1.mini.eastday.com',
                        changeOrigin: true
                    }
                }
            ]
        },
        {
            url: 'local.recovery.zsincer.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/recovery_website/build/dist': ['/'],
                '/Project/Work.sh.songheng/recovery_website/build/recover': ['/recover']
                // '/Project/Work.sh.songheng/recovery_website/dist/capture/agreement.html': ['/agreement.html'],
                // '/Project/Work.sh.songheng/recovery_website/dist/capture/feedback.html': ['/feedback.html'],
                // '/Project/Work.sh.songheng/recovery_website/dist/capture/help.html': ['/help.html'],
                // '/Project/Work.sh.songheng/recovery_website/dist/capture/privacy.html': ['/privacy.html']
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/recovery_website/build/dist/index.html'
            },
            proxy: []
        },
        {
            url: 'local.sports.eastday.com',
            rootPath,
            static: {
                // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
                '/Project/Work.sh.songheng/sports_pc/tpl/src/': ['/jscss/v4/', '/tpl/src/'],
                '/Project/Work.sh.songheng/sports_pc/data/detail.html': ['/a/detail.html'],
                // '/Project/Work.sh.songheng/sports_pc/data/topic.html': ['/topic/index.html'],
                '/Project/Work.sh.songheng/sports_pc/data/404.html': ['/404.html']
            },
            customMiddleware: {
                '/theme/' (self, path, request, response, next) {
                    // console.log('Request Type:', request.params);
                    // console.log('Request Type:', request.body);
                    // console.log('Request Type:', request.query);

                    next();
                }
            },
            indexPage: {
                enabled: true,
                indexUrl: ['/', '/index.html'],
                indexPath: '/Project/Work.sh.songheng/sports_pc/data/index.html'
            },
            page404: {
                enabled: true,
                page404Url: '/404.html',
                page404Type: /\.html/
            },
            proxy: [
                {
                    enabled: true,
                    proxyPath: ['/theme/**/*.html', '/video/*.html'],
                    options: {
                        target: 'http://test.sports.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/https:\/\/sports\.eastday\.com\/jscss\/v4\//gi, '/jscss/v4/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/a/*.html', '/topic/*.html', '/tags/*.html', '/tag-*/index.html'],
                    options: {
                        target: 'https://sports.eastday.com',
                        changeOrigin: true,
                        selfHandleResponse: true,
                        async onProxyResHandle (responseBuffer, proxyRes, req, res) {
                            const response = responseBuffer.toString('utf8'); // convert buffer to string
                            return response.replace(/https:\/\/sports\.eastday\.com\/jscss\/v4\//gi, '/jscss/v4/').replace(/http:\/\/test\.sports\.eastday\.com\/jscss\/v4\//gi, '/jscss/v4/'); // manipulate response and return the result
                        }
                    }
                },
                {
                    enabled: true,
                    proxyPath: ['/aaaaapi/', '/data/', '/api/'],
                    options: {
                        target: 'http://test.sports.eastday.com',
                        changeOrigin: true
                    }
                }
            ]
        }
    ]
};
