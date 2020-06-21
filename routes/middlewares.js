// routes폴더에 auth와 연결해줌.

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 여부를 알려줌.  req.login, req.logout은 passport가 추가해줌.
        next()
    } else {
        res.status(403).send('로그인 필요')
    }
}

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // 로그인을 안했으면 다음(auth.js에 router.post('/join', isNotLoggedIn, async (req...)에서 async...)으로 넘어가고
        next()
    } else { // 로그인을 했으면 루트로 감.
        res.redirect('/')
    }
}