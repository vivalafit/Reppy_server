// const models   = require('../models/index');
'use strict';
module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var Category = sequelize.define('Category', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }/*, {
        defaultScope: {
            attributes: [
                'id', 'title', 'description', 'createdAt', 'updatedAt'
            ]/!*,
            include: [
                {
                    model: sequelize.models.Group,
                    // required: false
                }
            ]*!/
        }
    }*/);
    Category.associate = models => {
        Category.hasMany(models.Group, {foreignKey: 'categoryId', as: 'groups', onDelete: 'Cascade' });
        Category.belongsToMany(models.Post, {
            through: models.PostCategory,
            foreignKey: 'categoryId',
            as: 'post',
            onDelete: 'Cascade'
        });
        Category.belongsToMany(models.User , {
            // as: 'users',
            through:models.UserCategory,
            foreignKey:'categoryId',
            onDelete: 'Cascade'
        });
    };
    return Category;
};
