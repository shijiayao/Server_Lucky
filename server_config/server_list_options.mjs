import { path } from '../lib/deps.mjs';

// 导入模块文件
import example_com from '../site_config/example.com/index.mjs';
import local_com from '../site_config/local.com/index.mjs';
import local_library_com from '../site_config/local.library.com/index.mjs';
import local_charles_com from '../site_config/local.charles.com/index.mjs';
import local_dafabet_com from '../site_config/local.dafabet.com/index.mjs';
import local_11_33_1_253_com from '../site_config/local.11.33.1.253.com/index.mjs';

console.log('site_array:', [example_com.url, local_com.url, local_library_com.url, local_charles_com.url, local_dafabet_com.url, local_11_33_1_253_com.url]);

const __dirname = import.meta.dirname;
const lastSegment = path.basename(__dirname);
console.log('__dirname', __dirname, ' --- ', 'lastSegment:', lastSegment);

function sleep(time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export default {
    exampleConfig: example_com,
    siteConfigArray: [local_com, local_library_com, local_charles_com, local_dafabet_com, local_11_33_1_253_com]
};
