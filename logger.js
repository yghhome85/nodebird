const { createLogger, format, transports } = require('winston')

const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [ // 에러 로그들이 파일로 생성됨.
        new transports.File({ filename: 'combined.log' }),  
        new transports.File({ filename: 'error.log', level: 'error' }),
    ],
})

if (process.env.NODE_ENV !== 'production') { // 배포환경이 아닐 때 콘솔에도 기록되게 함.
    logger.add(new transports.Console.log({ format: format.simple() }))
}
module.exports = logger