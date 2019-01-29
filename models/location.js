// const models   = require('../models/index');
'use strict';
module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var Location = sequelize.define('Location', {
        country: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "Украина"
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Киев"
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
    Location.associate = models => {
        Location.hasMany(models.User, {foreignKey: 'locationId', as: 'location', onDelete: 'Cascade' });
        Location.hasMany(models.Post, {foreignKey: 'locationId', as: 'locationPost', onDelete: 'Cascade' });

    };
    return Location;
};
