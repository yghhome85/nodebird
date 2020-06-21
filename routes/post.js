const express = require('express')
const multer = require('multer') // multer는 사진 업로드할 때 쓰는 모듈(npm i multer).  이미지를 업로드하려면 form을 enctype="multiparter/form-data"로 해야하는데 bodyparser(express.json, express.urlencoded)가 해석을 못함. 그래서 이것을 해석하려면 multer가 필요함.
const path = require('path')

const { Post, Hashtag, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const router = express.Router()


const upload = multer({ // multer함수를 쓰면 upload객체를 받을 수 있음.  함수 안에 옵션들을 넣을 수 있음.
    storage: multer.diskStorage({ // 어디(서버 디스크 or 구글클라우드스토리지 등 외부스토리지)에 저장할지. 여기서는 서버디스크에 저장.
        destination(req, file, cb) { // destination: 파일 경로
            cb(null, 'uploads/') //cb(에러, 설정(목적지, 파일명 등))  uploads라는 파일을 프로젝트 안에 생성하면 그 안에 파일이 저장됨.
        },
        filename(req, file, cb) {// filename: 파일 이름.  multer가 처음에는 파일 이름을 무작위로 만들고 확장자도 안붙임. 직접설정필요.
            const ext = path.extname(file.originalname) // file객체 안에 file에대한 정보가 있는데 그 file의 이름이 file.originalname형태로 들어있고 - 그것을 path.extname으로 확장자를 알아냄.  ext는 extention임.
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext) // basename이 확장자를 제외한 파일명이고 - 그것에 new Date().valueOf()로 현재시간을 붙여주고(파일명 중복을 막기위해) - ext로 확장자를 붙여줌. 
        },
    }),
    limit: { fileSize: 5 * 1024 * 1024 }, // 파일 사이즈(바이트단위)
})
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.body, req.file) // multer를 통해 upload.single('img')로 업로드한 이미지파일은 req.file에 저장되어 있음.  보통 form으로 업로드하면 req.body에 저장됨.
    res.json({ url: `/img/${req.file.filename}` }) // 서버 어디에 이미지가 저장되어있는지 위치와 파일이름을 json으로 front에 보내줌.
}) 
// single()에 'img'는 필드명으로써, 지정하고싶은 input tag 안에 id나 name과 일치시켜주면 됨. 그러면 multer가 알아서 <input id="img"...>를 찾아서 처리하여 위에서 설정한 내용대로 파일을 저장함.
// single(필드명): 이미지 하나, array(단일 필드): 이미지 여러개, fields(여러 필드): 이미지 여러개, nonw(): 이미지x

const upload2 = multer()
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { // db를 쓰면 async를 넣어줌.
    try {
        const post = await Post.create({ 
            content: req.body.content, // models파일에 post.js에 있는 항목.
            img: req.body.url, // models파일에 post.js에 있는 항목.
            userId: req.user.id, // models파일에 index.js에 db.User.hasMany(db.Post)와 db.Post.belongsTo(db.User)부분을 보면 한명의 사람이 여러개의 게시글을 쓰게 될 때를 의미하고 그렇게 되면 user.id를 넣어주도록 컬럼이 하나 생김. 
        })
        const hashtags = req.body.content.match(/#[^\s]*/g) // 해시태그들이 배열로 들어감.  해시태그 가져오는 정규표현식 사용.
        if (hashtags) {
            // 안녕하세요 #노드 #익스프레스 -> hashtags = ['#노드', #익스프레스]로 저장됨.
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate ({ // findOrCreate: db에 있으면 찾고 없으면 새로 생성. hashtags.findOrCreate로 hashtags배열에 중복되는 태그가 들어오면 생성하지 않고 새로운 태그들만 들어옴. 
                where: { title: tag.slice(1).toLowerCase() }, // slice(1)로 #을 떼어버리고 toLowerCase()로 소문자로 만듦(그래야 나중에 검색할 때 대소문자 구분 없이 검색 가능)
            })))
            await post.addHashtags(result.map(r => r[0])) // 게시글과 해시태그들을 연결해줌.  addHashtags는 sequelize에서 제공.  
        } 
        res.redirect('/')
    } catch (error) {
        console.error(error)
        next(error)
    }
}) // 예제에서는 사진 업로드 후 게시글 업로드시에는 사진대신 사진주소를 올리므로 none을 씀.

//게시글 삭제
router.delete('/:id', async (req, res, next) => {
    try {
        await Post.destroy({ where: { id: req.params.id, userId: req.user.id }}) // 요청보낸 것을 다 지워버리기 때문에 게시글을 식별하는 id: req.params.id와 함께 작성자를 식별하는 userId: req.user.id도 같이 넣어서 확실히 지정하게 하고 작성자만 지울수 있게 함.
        res.send('OK')
    } catch (error) {
        console.error(error)
        next(error)
    }
})


// hashtag 검색
router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag
    if (!query) { // 아무것도 입력 안하고 제출하면
        return res.redirect('/') // 메인페이지로 보냄.
    }
    try {
        const hashtag = await Hashtag.findOne({ where: {title: query }}) // Hashtag에서 사용자가 검색한 hashtag(query)를 .fine({ 위치: {제목: const query = req.query.hashtag})으로 찾고 
        let posts = []
        if (hashtag) { // 찾는 hashtag가 있고
            posts = await hashtag.getPosts({ include: [{ model: User }]}) // 만약 그 hashtagId가 4번이라면 db에 posthashtag에서 그 4번hashtag들에 대한 post들을 다 가져오고 { include: [{ model: User }]}로 사용자 정보까지 가져와줌.  다대다 관계.
            // A.getB: 관계있는 로우 조회, A.addB: 관계 생성, A.setB: 관계 수정, A.removeB: 관계 제거
        }
        return res.render('main', { // main.pug를 랜더링하고 
            title: `${query} | nodebird`,
            user: req.user,
            twits: posts, // 검색 결과들을 twits에 넣어줌. 
        })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.post('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.id }})
        await post.addLiker(req.user.id)
        res.send('OK')
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.id }})
        await post.removeLiker(req.user.id)
        res.send('OK')
    } catch (error) {
        console.error(error)
        next(error)
    }
})


module.exports = router
