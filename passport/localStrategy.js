const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const { User } = require('../models')


module.exports = (passport) => {
    passport.use(new LocalStrategy({ // urlencoded 미들웨어가 해석한 req.body의 값들을 usernameField, passwordField에 연결.
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
    }, async (email, password, done) => { // 이메일과 비번이 일치하면 콜백으로 무엇을 할지 써넣는 부분.  done(에러, 성공, 실패)
        try {
            const exUser = await User.findOne({ where: { email } }) // 시퀄라이즈 쿼리(User.find({ where: { email }}))를 통해 사용자가 등록한 email이 있는지 검사함.
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password) // bcript(비밀번호를 암호화해주는 알고리즘)로 비밀번호 검사. password: 사용자가 입력한 패스워드, exUser.passpword: db에 저장된 패스워드를 서로 비교하여 true/false를 도출.  
                if (result) {
                    done(null, exUser) // 패스워드 일치.
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' })
                }
            } else { // 이메일이 없는 경우.
                done(null, faile, { massage: '가입되지 않은 회원입니다.' }) // done(서버에러), done(null, 사용자정보), done.(null, false, 실패정보)
            }
        } catch (error) {
            console.error(error)
                done(error)
        }
    }))
}