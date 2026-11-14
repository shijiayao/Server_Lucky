import { path, GlobalMJS } from '../../lib/deps.mjs';
import DAFABET_API from './dafabet_api.mjs';

const __dirname = import.meta.dirname;
const lastSegment = path.basename(__dirname);
console.log('__dirname', __dirname, ' --- ', 'lastSegment:', lastSegment);

const { _WORKSPACE_PATH_, _SERVER_PATH_ } = GlobalMJS;

export default {
    url: lastSegment,
    rootPath: _WORKSPACE_PATH_,
    static: {},
    customMiddleware: {
        '/api/dafabet': DAFABET_API.ApiDafabet,
        '/api/crawler/draw': DAFABET_API.ApiCrawlerDraw
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
};
