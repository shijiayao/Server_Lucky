import DAFABET_DATABASE from './dafabet_mysql_database.mjs';

export default {
    async ApiDafabet(self, path, request, response, next) {
        const bodyData = request.body || {};
        const requestType = bodyData.RequestType || 'query';

        async function QueryDatabaseByUser() {
            const ShuangSeQiuBalls = await DAFABET_DATABASE.getAllUserBall('ShuangSeQiu');
            const ChaoJiDaLeTouBalls = await DAFABET_DATABASE.getAllUserBall('ChaoJiDaLeTou');
            return {
                shuangseqiu: ShuangSeQiuBalls.map((element) => {
                    return {
                        id: element.id,
                        期号: element.phase,
                        开奖日期: element.draw_date,
                        开奖号码红球: element.draw_red_ball,
                        开奖号码蓝球: element.draw_blue_ball,
                        投注号码红球: element.red_ball,
                        投注号码蓝球: element.blue_ball,
                        倍数: element.multiple,
                        中奖金额: element.prize_amount
                    };
                }).reverse(),
                chaojidaletou: ChaoJiDaLeTouBalls.map((element) => {
                    return {
                        id: element.id,
                        期号: element.phase,
                        开奖日期: element.draw_date,
                        开奖号码红球: element.draw_red_ball,
                        开奖号码蓝球: element.draw_blue_ball,
                        投注号码红球: element.red_ball,
                        投注号码蓝球: element.blue_ball,
                        倍数: element.multiple,
                        中奖金额: element.prize_amount
                    };
                }).reverse()
            };
        }

        switch (requestType) {
            case 'add':
                bodyData.groupBall.sort((a, b) => a.期号 - b.期号);

                await Promise.all(
                    bodyData.groupBall.map(async (element) => {
                        if (element.dafafetName === 'shuangseqiu') {
                            await DAFABET_DATABASE.addUserBall('ShuangSeQiu', element);
                        } else {
                            await DAFABET_DATABASE.addUserBall('ChaoJiDaLeTou', element);
                        }
                    })
                );
                response.json(await QueryDatabaseByUser());
                break;

            case 'delete':
                await Promise.all(
                    bodyData.groupBall.map(async (element) => {
                        if (element.dafafetName === 'shuangseqiu') {
                            await DAFABET_DATABASE.deleteUserBall('ShuangSeQiu', element.id);
                        } else {
                            await DAFABET_DATABASE.deleteUserBall('ChaoJiDaLeTou', element.id);
                        }
                    })
                );
                response.json(await QueryDatabaseByUser());
                break;

            case 'update':
                await Promise.all(
                    bodyData.groupBall.map(async (element) => {
                        if (element.dafafetName === 'shuangseqiu') {
                            await DAFABET_DATABASE.updateUserBall('ShuangSeQiu', element.id, element);
                        } else {
                            await DAFABET_DATABASE.updateUserBall('ChaoJiDaLeTou', element.id, element);
                        }
                    })
                );
                response.json(await QueryDatabaseByUser());
                break;

            case 'query':
                response.json(await QueryDatabaseByUser());
                break;

            default:
                response.json({ code: 404, message: '请求类型错误' });
                break;
        }
    },

    async ApiCrawlerDraw(self, path, request, response, next) {
        const CurrentDate = new Date().toLocaleString('zh', { hour12: false });
        const CurrentDateArray = CurrentDate.split(' ');
        const Today = CurrentDateArray[0].replaceAll('/', '-');
        const TimeArray = CurrentDateArray[1].split(':');
        const CurrentHour = TimeArray[0];
        const CurrentMinutes = TimeArray[1];

        /**
         * undefined:[无数据]
         * 0:[未更新]
         * 1:[21点前已更新]
         * 2:[21点后已更新，10分钟内不再发起新的爬虫请求]
         * 3:[已更新]
         */
        let CrawlerStatusArray = await DAFABET_DATABASE.getCrawlerStatus(Today);
        let CrawlerStatus = CrawlerStatusArray[0]?.status;
        let CrawlerStatusID = CrawlerStatusArray[0]?.id;
        let CrawlerStatusTimeArray = CrawlerStatusArray[0]?.LastUpdateTime.split(' ')[1].split(':');

        // 序列化请求参数
        function canshu(object) {
            let resultArray = [];

            for (const key in object) {
                resultArray.push(`${key}=${object[key]}`);
            }

            return resultArray.join('&');
        }

        // 从官方平台更新数据
        async function getCrawler() {
            const ResponseArray = await Promise.all([
                fetch(
                    `https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?${canshu({
                        name: 'ssq',
                        issueCount: '',
                        issueStart: '',
                        issueEnd: '',
                        dayStart: '',
                        dayEnd: '',
                        pageNo: 1,
                        pageSize: 100,
                        week: '',
                        systemType: 'PC'
                    })}`
                ),
                fetch(
                    `https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?${canshu({
                        gameNo: 85,
                        provinceId: 0,
                        pageSize: 100,
                        isVerify: 1,
                        pageNo: 1,
                        termLimits: 100
                    })}`
                )
            ]);

            const [KJXX_ShuangSeQiu, KJXX_ChaoJiDaLeTou] = await Promise.all(ResponseArray.map((element) => element.json()));

            return { KJXX_ShuangSeQiu, KJXX_ChaoJiDaLeTou };
        }

        // 查询数据库中最新的一条数据
        async function QueryCrawlerDrawDataByDescLimit() {
            const KJXX_ShuangSeQiu = await DAFABET_DATABASE.getCrawlerDrawDataByDescLimit('KJXX_ShuangSeQiu');
            const KJXX_ChaoJiDaLeTou = await DAFABET_DATABASE.getCrawlerDrawDataByDescLimit('KJXX_ChaoJiDaLeTou');

            return { KJXX_ShuangSeQiu, KJXX_ChaoJiDaLeTou };
        }

        // 查询数据库中的开奖数据
        async function QueryCrawlerDrawData() {
            const KJXX_ShuangSeQiu = await DAFABET_DATABASE.getCrawlerDrawData('KJXX_ShuangSeQiu');
            const KJXX_ChaoJiDaLeTou = await DAFABET_DATABASE.getCrawlerDrawData('KJXX_ChaoJiDaLeTou');

            return {
                kjxx_shuangseqiu: KJXX_ShuangSeQiu.map((element) => element).reverse(),
                kjxx_chaojidaletou: KJXX_ChaoJiDaLeTou.map((element) => element).reverse()
            };
        }

        // 预处理整合数据
        async function PreCombineData(params) {
            let TodayCrawlerStatus = false;
            const DescLimitArray = await QueryCrawlerDrawDataByDescLimit();
            const FetchCrawlerObject = await getCrawler();
            const AddCrawlerDrawObject = {
                KJXX_ShuangSeQiu: [],
                KJXX_ChaoJiDaLeTou: []
            };

            for (const [key, value] of Object.entries(DescLimitArray)) {
                const PhaseKey = key === 'KJXX_ShuangSeQiu' ? 'code' : 'lotteryDrawNum';
                const ReferencePhase = value?.detailed_content[PhaseKey];
                const FetchCrawlerArray = key === 'KJXX_ShuangSeQiu' ? FetchCrawlerObject[key].result : FetchCrawlerObject[key].value.list;

                if (ReferencePhase > 0) {
                    FetchCrawlerArray.forEach((element) => {
                        // 期号大于数据库中最新一条数据的期号则是需要新添加到数据库中的数据
                        if (element[PhaseKey] > ReferencePhase) {
                            AddCrawlerDrawObject[key].push(element);
                        }
                    });
                }
            }

            for (const [key, newArray] of Object.entries(AddCrawlerDrawObject)) {
                const PhaseKey = key === 'KJXX_ShuangSeQiu' ? 'code' : 'lotteryDrawNum';
                const DateKey = key === 'KJXX_ShuangSeQiu' ? 'date' : 'lotteryDrawTime';
                newArray
                    .sort((a, b) => a[PhaseKey] - b[PhaseKey])
                    .forEach(async (element) => {
                        if (element[DateKey].includes(Today)) {
                            TodayCrawlerStatus = true;
                        }
                        await DAFABET_DATABASE.addCrawlerDrawData(key, element);
                    });
            }

            // 更新 KJXX_Crawler_Status 中的数据
            if (TodayCrawlerStatus) {
                await DAFABET_DATABASE.updateCrawlerStatus(CrawlerStatusID, 3, CurrentDate);
            } else if (CurrentHour >= 21) {
                await DAFABET_DATABASE.updateCrawlerStatus(CrawlerStatusID, 2, CurrentDate);
            } else {
                await DAFABET_DATABASE.updateCrawlerStatus(CrawlerStatusID, 1, CurrentDate);
            }
        }

        // 没有今天的 Columns 则新建
        if (CrawlerStatus === undefined) {
            CrawlerStatusID = await DAFABET_DATABASE.addCrawlerStatus(Today, 0, CurrentDate);
        }

        // 无数据 || 未更新 || (21 点前更新 && 当前事件已过 21 点) || (21 点后更新 && 距离上一次更新已过去 10 分钟)
        if (CrawlerStatus === undefined || CrawlerStatus === 0 || (CrawlerStatus === 1 && CurrentHour >= 21) || (CrawlerStatus === 2 && TimeArray.join('') - CrawlerStatusTimeArray.join('') > 1000)) {
            await PreCombineData();
        }

        response.json(await QueryCrawlerDrawData());
    }
};
