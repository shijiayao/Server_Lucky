import { path, GlobalMJS } from '../../lib/deps.mjs';

const __dirname = import.meta.dirname;
const lastSegment = path.basename(__dirname);
console.log('__dirname', __dirname, ' --- ', 'lastSegment:', lastSegment);

const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;

export default {
    url: lastSegment,
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
};
