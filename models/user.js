const bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {

    var User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2,12],
                is: /^[a-zA-ZА-Яа-я\і\ї\є]+$/
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2,12],
                is: /^[a-zA-ZА-Яа-я\і\ї\є]+$/
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                len: [4,41]
            }
        },
        tel: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                // len: [12,12],
                is: /^380[0-9]{9}$/
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set: function(value){
                let hash = bcrypt.hashSync(value, 10);
                this.setDataValue('password', hash);
            }
        },
        avatar: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM,
            values: ['user', 'admin', 'company'],
            defaultValue: 'user'
        },
        checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        positive: {
            type: DataTypes.INTEGER,
        },
        negative: {
            type: DataTypes.INTEGER,
        },
        sessionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        workingYears: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        workersCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        specialization: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        taxStatus: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        taxSystem: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        vat: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 1
            }
        }
        /*username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },*/
    });
    User.associate = models => {
        User.hasMany(models.Post, {foreignKey: 'customerId', as: 'customer', onDelete: 'Cascade' });
        User.hasMany(models.Post, {foreignKey: 'executorId', as: 'executor', onDelete: 'Cascade' });
        User.hasMany(models.Post, {foreignKey: 'offeredExecutorId', as: 'offeredExecutor', onDelete: 'Cascade' });
        User.hasMany(models.Review, {foreignKey: 'userId', as: 'review', onDelete: 'Cascade' });
        User.hasMany(models.Request, {foreignKey: 'userId', as: 'userRequest', onDelete: 'Cascade' });
        User.belongsTo(models.Location ,{as: 'location', onDelete: 'Cascade'});
        User.belongsToMany(models.Category , {
            as: 'categories',
            through:models.UserCategory,
            foreignKey:'userId',
            onDelete: 'Cascade'
        });
    };
    return User;
};
