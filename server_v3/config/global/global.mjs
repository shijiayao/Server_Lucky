// 原生模块
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// 工作区目录名
const _WORKSPACE_DIRNAME_ = 'Development';
// 工作根目录
const _ROOT_PATH_ = path.join(__dirname.slice(0, __dirname.indexOf(_WORKSPACE_DIRNAME_)), _WORKSPACE_DIRNAME_);

export default {
    _WORKSPACE_DIRNAME_,
    _ROOT_PATH_
};
