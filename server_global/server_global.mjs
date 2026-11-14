import { path } from '../lib/deps.mjs';

const __dirname = import.meta.dirname;

// 工作区目录名
const _WORKSPACE_DIRNAME_ = 'Development';
// Server 目录名
const _SERVER_DIRNAME_ = 'Server_Lucky';
// 工作根目录
const _WORKSPACE_PATH_ = path.join(__dirname.split(_WORKSPACE_DIRNAME_)[0], _WORKSPACE_DIRNAME_);
// Server 根目录
const _SERVER_PATH_ = path.join(_WORKSPACE_PATH_, _SERVER_DIRNAME_);

export default {
    _WORKSPACE_DIRNAME_,
    _SERVER_DIRNAME_,
    _WORKSPACE_PATH_,
    _SERVER_PATH_
};
