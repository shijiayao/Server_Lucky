const fs = require('fs');
const path = require('path');

const { exampleConfigArray } = require('../server_list_options/server_list_options.js');

const createdPath = __dirname;
const serverListPath = '../../server_list';
const nginxConfPath = '../../nginx_conf/vhosts';

const jsKeyword = '__SERVER.LIST.INDEX__';
const nginxConfProxyHttp = '        __JUDGEMENT.STATEMENT.HTTP__';
const nginxConfProxyHttps = '        __JUDGEMENT.STATEMENT.HTTPS__';

// 默认的服务端口
let defaultPort = 0;

// js template
let template_js = fs.readFileSync(path.join(createdPath, './template.js'), { encoding: 'utf8' });
// nginx conf template
let template_conf_proxy = fs.readFileSync(path.join(createdPath, './template_proxy.conf'), { encoding: 'utf8' });
// nginx conf string
let nodeServer_NginxConf_String_Http = '';
let nodeServer_NginxConf_String_Https = '';

fs.rmSync(path.join(createdPath, serverListPath), { recursive: true, force: true });
fs.mkdirSync(path.join(createdPath, serverListPath));

// 配置文件列表
exampleConfigArray.forEach((element, index) => {
    let exampleNameString = `${element.port}_${element.url}`;

    if (element.default) {
        defaultPort = element.port;
    }

    // 根据 js template 替换参数后生成 server_list
    fs.writeFileSync(path.join(createdPath, serverListPath, `${exampleNameString}.js`), template_js.replace(jsKeyword, index), { encoding: 'utf8' });

    nodeServer_NginxConf_String_Http += ''.concat(
        `        if ($host = ${element.url}) {`,
        `\n`,
        `            proxy_pass http://127.0.0.1:${element.port};`,
        `\n`,
        `            set $is_matched_http 1;`,
        `\n`,
        `        }`,
        `\n\n`
    );
    nodeServer_NginxConf_String_Https += ''.concat(
        `        if ($host = ${element.url}) {`,
        `\n`,
        `            proxy_pass https://127.0.0.1:${element.port - 2000};`,
        `\n`,
        `            set $is_matched_https 1;`,
        `\n`,
        `        }`,
        `\n\n`
    );
});

nodeServer_NginxConf_String_Http += ''.concat(
    `        if ($is_matched_http = 0) {`,
    `\n`,
    `            proxy_pass http://127.0.0.1:${defaultPort};`,
    `\n`,
    `        }`,
    `\n\n`
);
nodeServer_NginxConf_String_Https += ''.concat(
    `        if ($is_matched_https = 0) {`,
    `\n`,
    `            proxy_pass https://127.0.0.1:${defaultPort - 2000};`,
    `\n`,
    `        }`,
    `\n\n`
);

nodeServer_NginxConf_String_Http = template_conf_proxy
    .replace(nginxConfProxyHttp, nodeServer_NginxConf_String_Http)
    .replace(nginxConfProxyHttps, nodeServer_NginxConf_String_Https);

// nginx conf string 生成&写入 node_server.conf
fs.writeFileSync(path.join(createdPath, nginxConfPath, 'node_server_proxy.conf'), nodeServer_NginxConf_String_Http, { encoding: 'utf8' });
