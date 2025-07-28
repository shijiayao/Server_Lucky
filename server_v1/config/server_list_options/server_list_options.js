const fs = require('fs');
const rootPath = 'D:/';
let portNumber = 19500;

const exampleConfigArray = [
    {
        url: 'local.com',
        port: portNumber++,
        rootPath,
        default: true, // 默认的服务
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Code/Test': ['/Test', '/test'],
            '/Work/Code/Test/npm-install-public/node_modules': ['/Test/install-public', '/test/install-public'],
            '/Work/Project/public-tssp/lib': ['/assets/public-tssp/lib'],
            '/Work/Project/public-dsp/dist': ['/assets/plugins/newdsp']
        },
        customMiddleware: {
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
            '/dsp-v11-create-page/:param?' (self, path, request, response, next) {
                // console.log('Request Type:', request.params);
                // console.log('Request Type:', request.body);
                // console.log('Request Type:', request.query);

                fs.writeFileSync(
                    'D:\\Work\\Code\\Test\\HTML\\dsp-v11-test.html',
                    ''.concat(
                        `<!DOCTYPE html>\n`,
                        `<html lang="zh-cmn-Hans">\n`,
                        `<head>\n`,
                        `    <meta charset="UTF-8">\n`,
                        `    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n`,
                        `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`,
                        `    <title>dsp-v11-测试</title>\n`,
                        `    <link rel="shortcut icon" href="/Test/Assets/Icon/favicon.ico.svg" type="image/x-icon">\n`,
                        `    <style>\n`,
                        `        * { margin: 0; padding: 0; list-style: none; }\n`,
                        `        html, body { width: 100%; height: 100%; }\n`,
                        `        body { position: relative; }\n`,
                        `        .container { width: 100%; padding: 50px 0; background-color: yellowgreen; }\n`,
                        `        .container .wrap { margin: 0 auto; padding: 50px; width: 300px; background-color: #fff; }\n`,
                        `    </style>\n`,
                        `    <script src="/Test/JavaScript/jQuery/jquery_1.12.4.js"></script>\n`,
                        `</head>\n`,
                        `<body>\n`,
                        `    <div class="container">\n`,
                        `        <div class="wrap">\n`,
                        `${request.body.content}\n`,
                        `        </div>\n`,
                        `    </div>\n`,
                        `</body>\n`,
                        `</html>`
                    )
                );

                response.json({ code: 200, message: 'ok' });
            }
        },
        indexPage: {
            enabled: false
        },
        page404: {
            enabled: false
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['**/robot/api.php'],
                options: {
                    target: 'http://api.qingyunke.com/api.php',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: true,
                proxyPath: ['/test'],
                proxyMode: 'precise',
                options: {
                    target: 'http://117.50.108.17',
                    changeOrigin: true,
                    pathRewrite: {
                        '/test': '/is/api/v1/streamV2'
                    }
                }
            }
        ]
    },
    {
        url: 'local.library.com',
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/public-tssp/lib': ['/assets/public-tssp/lib'],
            '/Work/Project/public-dsp/dist': ['/assets/plugins/newdsp'],
            '/Work/Project/public-dsp/dist_outer': ['/assets/plugins/newdsp_outer']
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
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            // eastday-pc 目录
            '/Work/Project/eastday-pc/www-root/assets': ['/assets'],
            '/Work/Project/eastday-pc/www-root/special_test.html': ['/special_*.html'],
            '/Work/Project/eastday-pc/www-root/user.html': ['/user/index.html'],
            // newsite 目录
            '/Work/Project/newsite/dist/': ['/ns'],
            '/Work/Project/newsite/src/detail/uk.html': ['/nsa/*.html'],
            '/Work/Project/newsite/dist/channel/women.html': ['/women.html'],
            '/Work/Project/mini-detail-qiqi/dist/index.html': ['/b/*.html'],
            '/Work/Project/mini-detail-qiqi/dist/': ['/staticpc/qdxinwen/']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/newsite/dist/index.html'
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/miniggresource/'],
                options: {
                    target: 'http://testmini.eastday.com',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/static/**', '/assets/**', '/json/**', '/ns/api/**'],
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/newsite/dist/': ['/ns']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/newsite/dist/kankan/index.html'
        },
        proxy: []
    },
    {
        url: 'local.xingzuo.eastday.com',
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/xingzuo/www-root/html/lieqi.html': ['/lieqi.html'],
            '/Work/Project/xingzuo/www-root/assets': ['/assets'],
            '/Work/Project/xingzuo/www-root/src': ['/assets', '/src']
        },
        indexPage: {
            enabled: false,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/lieqi_mini/'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/json/**'],
                options: {
                    target: 'http://testxingzuo.eastday.com',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: false,
                proxyMode: 'precise',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/1_mini/dfzx': ['/dfzx']
        },
        indexPage: {
            enabled: false,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/lieqinews_pc/www-root/local_index.html'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: false,
                proxyMode: 'precise',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/lieqinews_h5_list/src/js': ['/js'],
            '/Work/Project/lieqinews_h5_list/src/css': ['/css'],
            '/Work/Project/lieqinews_h5_list/src/img': ['/img'],
            '/Work/Project/lieqinews_h5_list/src/favicon.ico': ['/favicon.ico'],
            '/Work/Project/lieqinews_h5_list/src/shcs.html': ['/shcs.html'],
            '/Work/Project/lieqinews_h5_detail/src/js': ['/mobile/js', '/m/js'],
            '/Work/Project/lieqinews_h5_detail/src/css': ['/mobile/css', '/m/css'],
            '/Work/Project/lieqinews_h5_detail/src/img': ['/mobile/img', '/m/img'],
            '/Work/Project/lieqinews_h5_detail/src/details.html': ['/mobile/*.html'],
            '/Work/Project/lieqinews_h5_detail/src/details_all.html': ['/m/*.html']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/lieqinews_h5_list/src/index.html'
        },
        page404: {
            enabled: true,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: false,
                proxyMode: 'precise',
                proxyPath: ['/img/loading.jpg'],
                options: {
                    target: 'https://wap.lieqinews.com',
                    changeOrigin: true,
                    pathRewrite: { '/img/loading.jpg': '/img/loading.jpg' }
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            // '/Work/Project/lieqinews_pc/www-root/': ['/'],
            '/Work/Project/lieqinews_pc/www-root/assets': ['/assets', '/Work/Project/lieqinews_pc/assets'],
            '/Work/Project/lieqinews_pc/www-root/frames': ['/frames'],
            '/Work/Project/lieqinews_pc/www-root/mini_page': ['/mini_page'],
            '/Work/Project/lieqinews_pc/www-root/local_topic.html': ['/topic.html'],
            '/Work/Project/lieqinews_pc/www-root/local_detail_v15.html': ['/a/*.html'],
            '/Work/Project/lieqinews_pc/www-root/picture/picture.html': ['/picture/*.html'],
            '/Work/Project/lieqinews_pc/www-root/local_tips.html': ['/tips.html'],
            '/Work/Project/lieqinews_pc/www-root/local_404.html': ['/404.html'],
            '/Work/Project/lieqinews_pc/www-root/njump/index.html': ['/n/*.html'],
            '/Work/Project/lieqinews_pc/www-root/local_channel.html': [
                '/channel.html',
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
            ]
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/lieqinews_pc/www-root/local_index.html'
        },
        page404: {
            enabled: true,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'precise',
                proxyPath: ['/miniassets/'],
                options: {
                    target: 'http://local.mini.eastday.com',
                    changeOrigin: true,
                    pathRewrite: { '/miniassets/': '/assets/' }
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/lieqiggresource/'],
                options: {
                    target: 'http://test2.lieqinews.com',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['**/*.json'],
                options: {
                    // target: 'https://lieqi.sqdtfc.com',
                    target: 'http://test2.lieqinews.com',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/assets/js/resources/**/*.js'],
                options: {
                    target: 'http://test2.lieqinews.com',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            }
        ]
    },
    {
        url: 'local.yangsheng.eastday.com',
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/yangsheng/www-root/aassets': ['/aassets'],
            '/Work/Project/yangsheng/www-root/assets': ['/assets'],
            '/Work/Project/yangsheng/www-root/temp/yiqing.html': ['/2019nCoV/index.html'],
            '/Work/Project/yangsheng/www-root/temp/topic.html': ['/topic.html', '/topic/topic.html'],
            '/Work/Project/yangsheng/www-root/temp/detail.html': ['/a/*.html'],
            '/Work/Project/yangsheng/www-root/temp/zhuanti.html': ['/zhuanti/*.html'],
            '/Work/Project/yangsheng/www-root/temp/tag.html': ['/tag-*/index.html'],
            '/Work/Project/yseastday_h5/www-root/details_new.html': ['/mobile/*.html'],
            '/Work/Project/yseastday_h5/www-root/static': ['/static']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/yangsheng/www-root/temp/index.html'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/9973com/': ['/']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/9973com/index.html'
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/video_eastday/www-root/assets': ['/assets'],
            '/Work/Project/video_eastday/www-root/a/detail.html': ['/a/*.html']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/video_eastday/www-root/index.html'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/mil-newsite/dist': ['/ns'],
            '/Work/Project/mil-newsite/dist/topic/index.html': ['/topic/index.html'],
            '/Work/Project/mil-newsite/src/detail/uk.html': ['/nsa/*.html'],
            '/Work/Project/mil-newsite/src/njump/njump.html': ['/a/njump.html']
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

                response.sendFile(path.join(self.rootPath, '/Work/Project/mil-newsite/dist/about/index.html'));
            }
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/mil-newsite/src/index/index.html'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
                proxyPath: ['/milggresource/', '/static/api/', '/json/video_for_detail.json'],
                options: {
                    target: 'http://testmil.eastday.com/',
                    changeOrigin: true,
                    pathRewrite: {}
                }
            },
            {
                enabled: true,
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/autoeastday/www-root/autoeastday-activity/src/w126.html': ['/w126.html'],
            '/Work/Project/autoeastday/www-root/assets/activity/static': ['/static']
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/sm-net/dist': ['/']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/sm-net/src/index.html'
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'precise',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/minis_page/mini': ['/mini']
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

                response.sendFile(path.join(self.rootPath, '/Work/Project/minis_page/mini/bdcoo001/index.html'));
            }
        },
        indexPage: {
            enabled: false,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/minis_page/mini/bdcoo001/index.html'
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'matched',
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
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/recovery_website/dist': ['/']
            // '/Work/Project/recovery_website/dist/capture/agreement.html': ['/agreement.html'],
            // '/Work/Project/recovery_website/dist/capture/feedback.html': ['/feedback.html'],
            // '/Work/Project/recovery_website/dist/capture/help.html': ['/help.html'],
            // '/Work/Project/recovery_website/dist/capture/privacy.html': ['/privacy.html']
        },
        indexPage: {
            enabled: true,
            indexUrl: ['/', '/index.html'],
            indexPath: '/Work/Project/recovery_website/dist/index.html'
        },
        proxy: []
    },
    {
        url: 'local.sports.eastday.com',
        port: portNumber++,
        rootPath,
        static: {
            // '实际响应的目录或文件': ['页面请求的目录或文件数组'],
            '/Work/Project/sports_pc/tpl/src/': ['/jscss/v4/', '/tpl/src/'],
            '/Work/Project/sports_pc/data/detail.html': ['/a/*.html'],
            '/Work/Project/sports_pc/data/topic.html': ['/topic/index.html']
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
            indexPath: '/Work/Project/sports_pc/data/index.html'
        },
        page404: {
            enabled: false,
            page404Url: '/404.html',
            page404Type: /\.html/
        },
        proxy: [
            {
                enabled: true,
                proxyMode: 'precise',
                proxyPath: ['/aaaaapi/', '/data/', '/theme/'],
                options: {
                    target: 'https://sports.eastday.com',
                    changeOrigin: true
                }
            }, {
                enabled: true,
                proxyMode: 'precise',
                proxyPath: ['/api/dchotrank/tag/'],
                options: {
                    target: 'http://test.sports.eastday.com',
                    changeOrigin: true
                }
            }
        ]
    }
];

module.exports = { exampleConfigArray };
