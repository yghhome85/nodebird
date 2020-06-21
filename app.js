// 개발용으로 만들었던 노드버드를 배포용으로 수정.

const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport') 
const helmet = require('helmet')
const hpp = require('hpp') // hpp공격을 방어해줌.
const RedisStore = require('connect-redis')(session) // 익스프레스 세션을 쓰기 떄문에 익스프레스 세션보다 아래있어야함.
require('dotenv').config() 

const indexRouter = require('./routes/page') 
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const { sequelize } = require('./models') 
const passportConfig = require('./passport')
const logger = require('./logger')

const app = express()
sequelize.sync()
passportConfig(passport)

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.set('port', process.env.PORT || 8090)

// 개발용과 배포용 둘 다 사용할 수 있게 만들기.
if (process.env.NODE_ENV === 'production') { // NODE_ENV는 기본적으로 development(개발용)로 되어있고 production으로 바꾸면 배포용이 됨. 기타 combined, short, common, tiny, test 등이 있음.
    app.use(morgan('combined'))
    app.use(helmet()) // 보안패키지. 개발할 때도 넣으면 요청속도가 느려지니 배포할때만 넣기.
    app.use(hpp()) // 보안패키지. 개발할 때도 넣으면 요청속도가 느려지니 배포할때만 넣기.
} else {
    app.use(morgan('dev'))
}
app.use(express.static(path.join(__dirname, 'public'))) 
app.use('/img', express.static(path.join(__dirname, 'uploads'))) 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser('process.env.COOKIE_SECRET'))
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({ // 익스프레스 세션과 redis를 연결.  세션이 레디스랩스에서 호스팅해주는 레디스db에 저장됨.
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        pass: process.env.REDIS_PASSWORD,
        logErrors: true,
    }),
}
if (process.env.NODE_ENV === 'production') {
    sessionOption.proxy = true // proxy(중개서버)를 사용할 경우에는 이 항목을 넣음.
    // sessionOption.cookie.secure = true // https를 쓸 경우에는 secure = true로 바꿈.
}
app.use(session(sessionOption))
app.use(flash())
app.use(passport.initialize()) 
app.use(passport.session()) 

app.use('/', indexRouter) 
app.use('/auth', authRouter)
app.use('/post', postRouter)
app.use('/user', userRouter)


app.use((req, res, next) => {
    const err = new Error('NOT FOUND')
    err.status = 404
    // 로거 사용해보기
    logger.info('hello') // console.info 대체
    logger.error(err.message) // console.error 대체
    next(err)
})
app.use((err, req, res) => {
    res.local.message = err.message
    res.local.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500)
    res.render('error')
})

app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`)
})