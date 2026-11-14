import mysql from 'mysql2/promise';

const MYSQL_HOST = process.env.MYSQL_HOST ?? '127.0.0.1';
const MYSQL_PORT = Number(process.env.MYSQL_PORT ?? 3306);
const MYSQL_USER = process.env.MYSQL_USER ?? 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? 'SY0iVLE$PU^th4*4x!LMU*$UPcE1Z@fIfwXd4IYGCm&t#zWJV4';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE ?? 'GoodLuckSQL';
const MYSQL_CHARSET = process.env.MYSQL_CHARSET ?? 'utf8mb4';
const MYSQL_CONNECTION_LIMIT = Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10);
const MYSQL_QUEUE_LIMIT = Number(process.env.MYSQL_QUEUE_LIMIT ?? 0);
const MYSQL_KEEPALIVE = process.env.MYSQL_KEEPALIVE !== 'false';
const MYSQL_KEEPALIVE_INITIAL_DELAY = Number(process.env.MYSQL_KEEPALIVE_INITIAL_DELAY ?? 0);

const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    charset: MYSQL_CHARSET,
    waitForConnections: true,
    connectionLimit: MYSQL_CONNECTION_LIMIT,
    queueLimit: MYSQL_QUEUE_LIMIT,
    enableKeepAlive: MYSQL_KEEPALIVE,
    keepAliveInitialDelay: MYSQL_KEEPALIVE_INITIAL_DELAY
});

const DEAD_CODES = new Set(['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT']);
const MAX_RETRY = Number(process.env.MYSQL_MAX_RETRY ?? 1);

function isRecoverableConnectionError(err) {
    return !!err && DEAD_CODES.has(err.code);
}

function logPoolError(err) {
    if (isRecoverableConnectionError(err)) {
        console.error('[mysql] 连接被断开:', err.message);
        return;
    }

    console.error('[mysql] 连接池错误:', err);
}

pool.on('error', logPoolError);

async function closePool() {
    await pool.end();
    console.log('[mysql] 连接池已关闭');
}

process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
});

async function withConnection(fn) {
    let lastErr;

    for (let attempt = 0; attempt <= MAX_RETRY; attempt += 1) {
        let conn;

        try {
            conn = await pool.getConnection();
            const result = await fn(conn);
            conn.release();
            return result;
        } catch (err) {
            lastErr = err;
            const dead = isRecoverableConnectionError(err);

            if (conn) {
                if (dead) {
                    conn.destroy();
                } else {
                    conn.release();
                }
            }

            if (!dead || attempt >= MAX_RETRY) {
                throw err;
            }
        }
    }

    throw lastErr;
}

const TABLE_NAMES = new Set(['ShuangSeQiu', 'ChaoJiDaLeTou', 'KJXX_ShuangSeQiu', 'KJXX_ChaoJiDaLeTou']);

function getTableName(tableName) {
    if (!TABLE_NAMES.has(tableName)) {
        throw new TypeError(`不支持的数据表: ${tableName}`);
    }

    return tableName;
}

export default {
    addUserBall: async (TableName, newBall) => {
        const tableName = getTableName(TableName);
        console.log(`正在向数据表 ${tableName} 添加新数据:`, newBall);

        return withConnection(async (conn) => {
            const [result] = await conn.execute(`INSERT INTO ${tableName} (phase, draw_date, draw_red_ball, draw_blue_ball, red_ball, blue_ball, multiple, prize_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                newBall.期号,
                null,
                '[]',
                '[]',
                `${JSON.stringify(newBall.投注号码红球)}`,
                `${JSON.stringify(newBall.投注号码蓝球)}`,
                newBall.倍数,
                newBall.中奖金额 || null
            ]);
            return result.insertId;
        });
    },

    deleteUserBall: async (TableName, id) => {
        const tableName = getTableName(TableName);
        console.log(`正在从数据表 ${tableName} 删除数据:`, id);

        if (id === undefined || id === null || id === '') {
            return Promise.reject(new TypeError('缺少要删除的数据的 id'));
        } else {
            return withConnection(async (conn) => {
                const [result] = await conn.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
                return result.affectedRows;
            });
        }
    },

    updateUserBall: async (TableName, id, newBall) => {
        const tableName = getTableName(TableName);
        console.log(`正在更新数据表 ${tableName} 中的数据:`, { id, newBall });

        const validKeys = new Map([
            ['期号', 'phase'],
            ['开奖日期', 'draw_date'],
            ['开奖号码红球', 'draw_red_ball'],
            ['开奖号码蓝球', 'draw_blue_ball'],
            ['投注号码红球', 'red_ball'],
            ['投注号码蓝球', 'blue_ball'],
            ['倍数', 'multiple'],
            ['中奖金额', 'prize_amount']
        ]);
        const stringColumns = ['开奖日期'];
        const jsonColumns = ['开奖号码红球', '开奖号码蓝球', '投注号码红球', '投注号码蓝球'];
        const SetColumns = [];
        const SetValues = [];

        for (const [key, value] of Object.entries(newBall)) {
            if (key === 'dafafetName' || key === 'id' || !validKeys.has(key)) {
                continue; // 跳过无效字段
            }

            SetColumns.push(`${validKeys.get(key)} = ?`);

            if (value === undefined || value === null || value === '') {
                SetValues.push(null);
            } else if (stringColumns.includes(key)) {
                SetValues.push(`${value}`);
            } else if (jsonColumns.includes(key)) {
                SetValues.push(`${JSON.stringify(value)}`);
            } else {
                SetValues.push(value);
            }
        }

        if (SetColumns.length > 0) {
            return withConnection(async (conn) => {
                const [result] = await conn.execute(`UPDATE ${tableName} SET ${SetColumns.join(', ')} WHERE id = ?`, [...SetValues, id]);
                return result.affectedRows;
            });
        } else {
            return Promise.resolve(0); // 没有字段需要更新，返回 0
        }
    },

    getAllUserBall: async (TableName) => {
        const tableName = getTableName(TableName);
        console.log(`正在从数据表 ${tableName} 获取所有数据`);

        return withConnection(async (conn) => {
            const [rows] = await conn.execute(`SELECT * FROM ${tableName}`);
            return rows;
        });
    },

    addCrawlerDrawData: async (TableName, newData) => {
        const tableName = getTableName(TableName);
        console.log(`正在向数据表 ${tableName} 添加新爬取数据:`, newData);

        return withConnection(async (conn) => {
            const [result] = await conn.execute(`INSERT INTO ${tableName} (detailed_content) VALUES (?)`, [`${JSON.stringify(newData)}`]);
            return result.insertId;
        });
    },

    addCrawlerStatus: async (date, status, LastUpdateTime) => {
        console.log(`正在向数据表 KJXX_Crawler_Status 添加新数据:`, { date, status, LastUpdateTime });

        return withConnection(async (conn) => {
            const [result] = await conn.execute(`INSERT INTO KJXX_Crawler_Status (date, status, LastUpdateTime) VALUES (?, ?, ?)`, [`${date}`, status, `${LastUpdateTime}`]);
            return result.insertId;
        });
    },

    updateCrawlerStatus: async (id, status, LastUpdateTime) => {
        console.log(`正在更新数据表 KJXX_Crawler_Status 中的数据:`, { id, status, LastUpdateTime });

        return withConnection(async (conn) => {
            const [result] = await conn.execute(`UPDATE KJXX_Crawler_Status SET status = ?, LastUpdateTime = ? WHERE id = ?`, [status, `${LastUpdateTime}`, id]);
            return result.affectedRows;
        });
    },

    getCrawlerStatus: async (date) => {
        console.log(`正在从数据表 KJXX_Crawler_Status 获取最新的爬取状态`);

        return withConnection(async (conn) => {
            const [rows] = await conn.execute(`SELECT * FROM KJXX_Crawler_Status WHERE date = ?`, [`${date}`]);
            return rows;
        });
    },

    getCrawlerDrawDataByDescLimit: async (TableName) => {
        const tableName = getTableName(TableName);
        console.log(`正在从数据表 ${tableName} 获取最后添加的数据`);

        return withConnection(async (conn) => {
            const [rows] = await conn.execute(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 1`);
            return rows[0] || null;
        });
    },

    getCrawlerDrawData: async (TableName) => {
        const tableName = getTableName(TableName);
        console.log(`正在从数据表 ${tableName} 获取所有爬取数据`);

        return withConnection(async (conn) => {
            const [rows] = await conn.execute(`SELECT * FROM ${tableName}`);
            return rows;
        });
    }
};
