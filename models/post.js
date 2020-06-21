module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', { // post table.
        content: { // 게시글 row.
            type: DataTypes.STRING(140),
            allowNull: false,
        },
        img: { // 이미지 row.
            type: DataTypes.STRING(200), // 이미지 주소를 올릴 것이기 때문에 이미지이지만 스트링으로 설정.
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8', // mysql에서 한글이 안깨지도록 하는 방법
        collate: 'utf8_general_ci', // mysql에서 한글이 안깨지도록 하는 방법
    })
)