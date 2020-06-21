require('dotenv').config()

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "12.nodebird-service",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "root",
    "password": process.env.SEQUELIZE_PASSWORD,
    "database": "12.nodebird-service",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false,
    "logging": false, // 추가코드.  시퀄라이즈 정보들이 터미널에 안뜨게함. 해커가 털어가도 어떤 sql문을 썼는지 안보여서 알 수 없게함. 개발할 때는 sql문을 봐야하므로 안씀.
  }
}
