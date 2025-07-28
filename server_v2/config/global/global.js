// 原生模块
const path = require('node:path');

// 工作区目录名
const _WORKSPACE_DIRNAME_ = 'Development';
// 工作根目录
const _ROOT_PATH_ = path.join(__dirname.slice(0, __dirname.indexOf(_WORKSPACE_DIRNAME_)), _WORKSPACE_DIRNAME_);

module.exports = {
    _WORKSPACE_DIRNAME_,
    _ROOT_PATH_
};
