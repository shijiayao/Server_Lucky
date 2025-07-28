const apps = [
    {
        name : 'Server_Lucky',

        // pm2 的根目录， pm2 的启动目录，此配置文件的路径将参考此目录，配置文件的参考路径；（不是以此文件所在目录为参考）
        cwd : './',

        script : `./server_main.mjs`,

        combine_logs : true,
        merge_logs   : true,

        log_date_format : 'YYYY/MM/DD HH:mm:ss:SSS',

        error_file : `./logs/pm2.log`,
        out_file   : `./logs/pm2.log`,
        log_file   : './logs/pm2.log',
        pid_file   : `./logs/pm2.pid`,

        max_memory_restart : '2G', // 如果超出内存量，则重新启动应用程序
        // instances: 'max', // 负载均衡，分配给所有的 CPU
        instances          : 1,
        watch              : ['./server_main.mjs', './server_config', './server_global'], // 监视文件变化， boolean or []
        autorestart        : true, // 自动重启

        instance_var : 'INSTANCE_ID', // pm2 进程间通信，log4js 日志模块

        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        env : {
            NODE_ENV : 'development'
        },
        env_production : {
            NODE_ENV : 'production'
        }
    }
];

module.exports = { apps };
