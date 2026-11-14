import { path, GlobalMJS } from '../../lib/deps.mjs';

const __dirname = import.meta.dirname;
const lastSegment = path.basename(__dirname);
console.log('__dirname', __dirname, ' --- ', 'lastSegment:', lastSegment);

const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;

export default {
    url: lastSegment,
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
};
