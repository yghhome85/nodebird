// 기본으로 설치되는 코드는 옜날 코드이기 때문에 바꿔줘야함. memo.txt에 13번 참조.
// app.js에 연결. const { sequelize } = require('./models')(/index는 생략 가능) / sequelize.sync()

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.User = require('./user')(sequelize, Sequelize)
db.Post = require('./post')(sequelize, Sequelize)
db.Hashtag = require('./hashtag')(sequelize, Sequelize)

// 1 대 1.(hasOne & belongsTo, hasOne(다른 테이블을 가지고있는)코드가 belongsTo(속해있는 코드)보다 먼저 와야함.)
db.User.hasOne(db.Post)
db.Post.belongsTo(db.User)

// 1 대 다.(hasMany & belongsTo, hasMany(다른 테이블들을 가지고있는)코드가 belongsTo(속해있는 코드)보다 먼저 와야함.)
db.User.hasMany(db.Post)
db.Post.belongsTo(db.User)

// 다 대 다.(belongsToMany, 코드 순서 상관 없음.)
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' })
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' }) // 다대다 관계에서는 belongsToMany.  through에는 새로 생기는 모델(테이블) 이름을 넣어줌(매칭 테이블)

db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId' }) // 같은 테이블끼리 서로를 팔로잉하는 경우.
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId' }) // as: 매칭 모델(테이블) 이름으로 누가 팔로워이고 누가 팔로잉하는지 표시(식별)함.  foreignKey: 상대 테이블 아이디를 지정(식별)함,  A.belongsToMany(B, { as:'Bname', foreignKey: 'A_id' })

db.User.belongsToMany(db.Post, { through: 'Like' })
db.Post.belongsToMany(db.User, { through: 'Like', as: 'Liker' })


module.exports = db;
