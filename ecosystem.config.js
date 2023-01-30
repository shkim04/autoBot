module.exports = {
    apps: [
        {
            name: 'tradingBot',
            script: 'bot.ts',
            interpreter: 'ts-node', // typescript를 위한 셋팅
            instances: 0, // 0은 모든 스레드를 쓴다는 의미
            exec_mode: 'cluster'
        }
    ]
}