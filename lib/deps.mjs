// 原生模块
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import https from 'https';
import url from 'url';

import GlobalMJS from '../server_global/server_global.mjs';

// 重新以命名导出的方式暴露出去
export { fs, os, path, http, https, url, GlobalMJS };
