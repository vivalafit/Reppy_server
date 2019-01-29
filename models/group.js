// const models   = require('../models/index');
'use strict';
module.exports = function(sequelize, DataTypes) {
    if(!sequelize.models.Property) sequelize['import']('./property');

    var Group = sequelize.define('Group', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM,
            values: ['checkbox', 'radio'],
            defaultValue: 'checkbox'
        }
    }, {
        defaultScope: {
            attributes: [
                'id', 'title', 'type', 'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: sequelize.models.Property,
                    as: 'properties'
                }
            ]
        },
        scopes: {
            forPosts: {
                attributes: [
                    'id', 'title', 'type', 'createdAt', 'updatedAt'
                ]
            }
        }
    });
    Group.associate = models => {
        Group.belongsTo(models.Category, {as: 'category', onDelete: 'Cascade' });
        // Group.belongsToMany(models.Property , {
        //     as: 'property',
        //     through:models.Option,
        //     foreignKey:'groupId',
        //     onDelete: 'Cascade'
        // });
        Group.hasMany(models.Property, {foreignKey: 'groupId', as: 'properties', onDelete: 'Cascade' });
    };

    return Group;
};
