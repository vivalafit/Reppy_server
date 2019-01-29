
module.exports = function(sequelize, DataTypes) {

    var Log = sequelize.define('Log', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.JSONB,
            allowNull: false
        }
        // Author: {
        //     type: DataTypes.STRING,
        //     unique: true,
        //     allowNull: false
        // },
        // email: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     unique: true,
        //     validate: {
        //         isEmail: true
        //     }
        // },
        // password: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     set: function(value){
        //         let hash = bcrypt.hashSync(value, 10);
        //         this.setDataValue('password', hash);
        //     }
        // },
        // role: {
        //     type: DataTypes.ENUM,
        //     values: ['business', 'user', 'admin'],
        //     defaultValue: 'user'
        // },
        // active: {
        //     type: DataTypes.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true
        // }
    }, {
        paranoid: true
    });
    return Log;
};
