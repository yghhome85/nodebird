// 회원가입 필드.

const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')

const { isLoggedIn, isNotLoggedIn } = require('./middlewares') // routes폴더에 middlewares를 가져옴.
const { User } = require('../models')

const router = express.Router()

// POST /auth/join
router.post('/join', isNotLoggedIn, async (req, res, next) => { // POST /auth/join.  현재 로그인한 사람을 로그인할 필요가 없기 때문에 middlewares.js의 isNotLoggedIn을 넣어줌.  router.get(미들웨어1, 미들웨어2...)처럼 미들웨어를 연달아 쓰면 순서대로 진행이됨. 여기서는 isNotLoggedIn이라는 미들웨어와 async라는 핵심 미들웨어를 넣음. 
    const { email, nick, password } = req.body
    try {
        const exUser = await User.findOne({ where: { email }})
        if (exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다.')
            return res.redirect('/join')
        }
        const hash = await bcrypt.hash(password, 12) // 가입 시 암호화.  12: 숫자가 클수록 암호화가 복잡해지고 느려짐.
        await User.create({
            email,
            nick,
            password: hash,
        })
        return res.redirect('/');
    } catch (error) {
        console.error(error)
        next(error)
    }
})

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => { // req.body.email, req.body.password
    passport.authenticate('local', (authError, user, info) => { // login라우터에 가면 localstrategy.js를 수행해서 localstrategy에 done(에러, 성공, 실패)의 결과가 전달됨.
    if (authError) { // 에러.
        console.error(authError)
        return next(authError)
    }
    if (!user) { // 성공도 아니고 error도 아님 - 실패했을 때.
        req.flash('loginError', info.message)
        return res.redirect('/')
    }
    return req.login(user, (loginError) => { // 에러도 없고 실패도 없으면 로그인시킴. session(req.user)에 로그인이 저장됨.  req.user에서 사용자정보를 찾을 수 있음. 사용자 정보가 필요한 경우 req.user를 하면 됨.  req.loging(user를 통해 세션에 사용자 정보들을 저장하고 - passport폴더에 index.js에 serializeUser가 실행됨.
        if (loginError) { // done에서 성공해도 login에서 에러터져서 실패하는 작은 확률의 경우에 대비.
            console.error(loginError)
            return next(loginError)
        }
        return res.redirect('/')
    })
    })(req, res, next) // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
})

// GET /auth/logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout()
    req.session.destroy() // session(req.user)에 저장된 사용자정보를 지움.  req.logout()이 session을 지우는지 확실히 알 수 없어서 넣음.  사실 다른 세션도 같이 지워져서 logout시에는 안해도됨.
    res.redirect('/')
})

// 카카오 실행순서 : 1
router.get('/kakao', passport.authenticate('kakao')) // kakaoStrategy를 실행하는 코드. 카카오서버가 우리 대신 로그인 인증을 함.
// 카카오 실행순서 : 3
router.get('/kakao/callback', passport.authenticate('kakao', { // passport폴더에 kakaoStrategy.js에 callbckURL: '/auth/kakao/callback'과 일치시켜야함.  카카오서버에서 응답이 오면 반응함.
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/')
})



module.exports = router