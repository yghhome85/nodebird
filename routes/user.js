// 팔로잉 기능 구현

const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('./middlewares')
const { User } = require('../models')

router.post('/:id/follow', isLoggedIn, async (req, res, next) => { // 팔로잉은 로그인한사람만 할 수 있으니 isLoggedIn을 넣음.
    try {
        const user = await User.findOne({ where: { id: req.user.id }}) // 현재 로그인한 user를 찾아서
        await user.addFollowing(parseInt(req.params.id, 10)) // 팔로잉 대상을 추가함.
        // A.getB: 관계있는 로우 조회, A.addB: 관계 생성, A.setB: 관계 수정, A.removeB: 관계 제거
        res.send('success')
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => { // 팔로잉은 로그인한사람만 할 수 있으니 isLoggedIn을 넣음.
    try {
        const user = await User.findOne({ where: { id: req.user.id }}) // 현재 로그인한 user를 찾아서
        await user.removeFollowing(parseInt(req.params.id, 10)) // 팔로잉 대상을 추가함.
        // A.getB: 관계있는 로우 조회, A.addB: 관계 생성, A.setB: 관계 수정, A.removeB: 관계 제거
        res.send('success')
    } catch (error) {
        console.error(error)
        next(error)
    }
})

// 프로필 변경하기.
router.post('/profile', async (req, res, next) => {
    try {
        await User.update({ nick: req.body.nick }, {
            where: { id: req.user.id },
        })
        res.redirect('/profile')
    } catch (error) {
        console.error(error)
        next(error)
    }
})


module.exports = router