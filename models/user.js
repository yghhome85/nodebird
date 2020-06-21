module.exports = ((sequelize, DataTypes) => ( // DataTypes은 변수명이므로 아무거나 해도 됨.
    sequelize.define('user', { // user table.
        email: { // 이메일 row.
            type: DataTypes.STRING(40),
            allowNull: false, // 이메일은 필수니까 얼로우널 펄스
            unique: true, // 이메일은 겹치면 안되니까 유니크 트루
        },
        nick: { // 별명 row.
            type: DataTypes.STRING(15),
            allowNull: false,
            // unique: false, // 코드를 적지 않으면 자동으로 false로 인식하기 때문에 안씀.  allowNull은 강사가 왜 썼는지 모르겠음.
        },
        password: { // 비밀번호 row.
            type: DataTypes.STRING(100),
            allowNull: true, // kakao로그인은 비밀번호 필수 아니라서 true
        },
        provider: { // provider: 회원가입시 local vs kakao 
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local',
        },
        snsId: { // kakao로 로그인 했을 때만 kakao id를 알려줌.
        type: DataTypes.STRING(30),
        allowNull: true,
    }, 
    }, {
            timestamps: true, // sequelize가 자동으로 row(column)의 생성일과 수정일을 기록해줌.
            paranoid: true, // 삭제일을 자동으로 기록하여 복구하기 용이함.
            charset: 'utf8', // mysql에서 한글이 안깨지도록 하는 방법
            collate: 'utf8_general_ci', // mysql에서 한글이 안깨지도록 하는 방법
        })
))
