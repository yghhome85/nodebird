// 보통 index라고 이름붙이지만 여기서는 그냥 page라고 이름지음.
// 화면 랜더링을 다루는 파일.
// front에서 오는 정보들은 다시한번 검사를 해봐야함. 하지만 그러면 back에서 할 일이 너무 많아져서 front에서도 검사장치를 해줘야함.

const express = require('express')
const { isLoggedIn, isNotLoggedIn} = require('./middlewares')
const { Post, User } = require('../models')

const router = express.Router()


// 프로필 페이지.
router.get('/profile', isLoggedIn, (req, res) => { // middlewares.js의 isLoggedIn으로 로그인을 하지 않은 사람으 접근을 막음.
    res.render('profile', {title: '내 정보 - NodeBird', user: req.user }) // profile.pug 랜더링.
})

// 회원가입 페이지.
router.get('/join', isNotLoggedIn, (req, res) => { // middlewares.js의 isNotLoggedIn으로 이미 회원가입/로그인한 user들이 이 페이지 접근 못하게함.
    res.render('join', { // join.pug 랜더링.
        title: '회원가입 - NodeBird',
        user: req.user,
        joinError: req.flash('joinError') // 에러가 나면 1회성 메시지를 보여주기 위해 connect-flash모듈로 처리함.
    })
})

// 메인 페이지.
router.get('/', (req, res, next) => { 
    Post.findAll({ // post에서 findAll로 모든걸 다 찾으면서 include로 게시글 작성자 등을 연결해줌.
        include: [{
            model: User,
            attributes: ['id', 'nick'],
        }, {
            model: User, 
            attributes: ['id', 'nick'],
            as: 'Liker' // include에서 같은 모델이 여러개면 as로 구분함.
        },]
    })
        .then ((posts) => { // 위에 내용이 posts에 담김.
            console.log(posts)
            res.render('main', { // main.pug 랜더링.
                title: 'NodeBird',
                twits: posts, // posts를 연결해서 게시글들이 화면에 랜더링됨.
                user: req.user, // passport폴더에 index.js의 deserializeUser로부터 user정보를 받아옴,
                loginError: req.flash('loginError')
            })
        })
        .catch((error) => {
            console.error(error)
            next(error)
        })
})


module.exports = router