const bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {

    var Addition = sequelize.define('Addition', {
        passIndex: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passImg: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        userImg: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Addition;
};