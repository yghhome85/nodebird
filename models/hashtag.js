module.exports = (sequelize, DataTypes) => (
    sequelize.define('hashtag', { // hashtag table.
        title: { // 타이틀 row.
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true, // 같은 테그가 겹칠 필요 없으니 true
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8', // mysql에서 한글이 안깨지도록 하는 방법
        collate: 'utf8_general_ci', // mysql에서 한글이 안깨지도록 하는 방법
    })
)