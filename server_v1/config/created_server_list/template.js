const ServerApp = require('../config/server_config/server_config.js');
const { exampleConfigArray } = require('../config/server_list_options/server_list_options.js');

const app = new ServerApp(exampleConfigArray[__SERVER.LIST.INDEX__]);
