 // strategy(전략): 누구를 로그인 시킬 것인가.  카카오는 자신에게 보내오는 로그인 정보가 유효한지 확인하고 인증키를 보내줄지 결정하는 전략, 로컬(내서버)에서는 입력한 아이디와 패스워드가 맞는지 확인하고 로그인을 수락해줄지 판단하는 전략. 
 // app.js에 연결. const passportConfig = require('./passport') / passportConfig(passport).  +미들웨어 2개.

const local = require('./localStrategy')
const kakao = require('./kakaoStrategy')
const { User } = require('../models')


module.exports = (passport) => {
    passport.serializeUser((user, done) => { // routes파일에 auth.js에 req.loging(user를 통해 세션에 사용자 정보들을 저장하고 - passport폴더에 index.js에 serializeUser가 실행됨.(req.login시에 serializeUser호출 - 유저 정보(예: {id:1, name:ace, age:35}) 중 아이디만 세션에 저장(유저 정보를 모두 저장하기에는 무겁기도 하고 id만 알아도 사용자 정보를 식별할 수 있기 때문임(mysql처럼))) 
    // {id:1, name:ace, age:35} -> 1
    //request.login할 때 한 번만 호출됨.
        done(null, user.id) // 몽고디비면 user._id
    })

    passport.deserializeUser((id, done) => { // 로그인이 된 상태에서 사용자가 요청을 보내면 - app.js파일을 쭉 읽다가 app.use('/', indexRouter)같은데서 걸리고 - 만약 메인페이지에 접속을 했다면 routes폴더에 page에 router.get('/', (req, res, next) => { res.render('main... 으로 요청이 가고 - 다시 app.js에 app.use(passport.initialize())와 app.use(passport.session())을 통해서 deserializeUser가 실행됨. - deserializeUser가 실행되면 serializeUser를 통해 저장되었던 id를 통해 db에서 찾아서 user정보를 복구 시키고 - routes파일에 page.js에 router.get('/', (req, res, next) => { res.render('main'... user: req.user으로 보냄.
    // 1 -> {id:1, name:ace, age:35} -> req.user
    // 모든 요청에 대해 계속 호출됨. 따라서 db조회를 캐싱(file cashing: 자주 사용되는 파일을 캐시 기억 장치 상에 저장해둠으로써 소프트웨어의 처리 속도를 높이는 방법)해서 효율적이게 만들어야함.(cashing처리를 하여 매번 db요청하는 것을 막음.)
        User.findOne({ 
            where: { id }, // 현재 id가 누구인지 찾음.
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers', // models\index.js에 31, 32번째줄을 가져옴.
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => done(null, user)) // done()에 넣는게 req.user가 됨.
            .catch(err => done(err))
    })

    local(passport)
    kakao(passport)
}


/* deserializeUser를 cashing해보기
const user = {} // 객체를 이용하여 캐시 메모리에 저장.

passport.deserializeUser((id, done) => {
    if (user[id]) { 
        done(user[id])
    } else {
        User.findOne({ where: { id } }) 
            .then(user => user[id] = user, done(null, user))
            .catch(err => done(err))
    }
})
*/