// 카카오가 인증을 대신해주기 때문에 bcrypt를 쓸 필요없음.

const kakaoStrategy = require('passport-kakao').Strategy

const { User } = require('../models')

// 카카오 실행순서 : 2, 4
module.exports = (passport) => { // 소셜로그인을 할 경우 /join같은 회원가입하는 부분이 따로 없음. 
    passport.use(new kakaoStrategy ({ // 카카오 실행순서 : 2번째 부분
        clientID: process.env.KAKAO_ID, // email/password 대신 clientID(카카오 앱 아이디), callbackURL(카카오 리다이렉트 주소)를 넣음.  developers.kakao.com에서 앱만들기를 한 후 받아온 restAPI용 앱키를 받아와서 .env파일에 key=value로 넣고 가져옴.
        callbackURL: '/auth/kakao/callback', // callback받을 라우터를 지정함(routes폴더에 auth.js에 router.get('/kakao/callback')와 일치시켜야함).  /auth/kakao - 카카오 로그인 - /auth/kakao/callback으로 프로필 반환.
    }, async (accessToken, refreshToken, profile, done) => { // 콜백도 email, password 대신 accessToken 등으로 받음. // 카카오 실행순서 : 4번째 부분.  로그인은 kakao가 대신 처리하지만 우리 db에도 사용자를 저장함(snsId, provider 사용)
        try {
            const exUser = await User.findOne({ // db에 있는 사용자를 통과시킴.
                where: {
                    snsId: profile.id, // 카카오에서 profile객체에 id를 넣어 보내줌.
                    provider: 'kakao',
                }
            })
            if (exUser) {
                done(null, exUser) // done()하면 req.user에 exUser가 저장됨.
            } else { // db에 없으면 db에 저장시켜줌.
                console.log(profile) // 을 하면 무엇이 담겨오는지 알 수 있음.
                const newUser = await User.create({
                    email: profile._json && profile._json.kakao_account.email, // 카카오에서 보내주는 profile객체형식을 넣음.
                    nick: profile._json.kakao_account.profile.nickname, // profile객체는 sns와 권한에 따라 내용물이 다르니 console.log로 확인 후 사용.
                    snsId: profile.id,
                    provider: 'kakao', // snsId가 어떤 회사것인지 구분하기 위해 넣어줌.
                })
                done(null, newUser)
            }
        } catch (error) {
            console.error(error)
            done(error)
        }
    }))
}