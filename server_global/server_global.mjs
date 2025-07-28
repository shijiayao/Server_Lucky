// 原生模块
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// 工作区目录名
const _WORKSPACE_DIRNAME_ = 'Development';
// Server 目录名
const _SERVER_DIRNAME_ = 'Server_Lucky';
// 工作根目录
const _WORKSPACE_PATH_ = path.join(__dirname.slice(0, __dirname.indexOf(_WORKSPACE_DIRNAME_)), _WORKSPACE_DIRNAME_);
// Server 根目录
const _SERVER_PATH_ = path.join(_WORKSPACE_PATH_, _SERVER_DIRNAME_);

export default {
    _WORKSPACE_DIRNAME_,
    _SERVER_DIRNAME_,
    _WORKSPACE_PATH_,
    _SERVER_PATH_
};
