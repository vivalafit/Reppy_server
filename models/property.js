module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');

    var Property = sequelize.define('Property', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        defaultScope: {
            attributes: [
                'id', 'title', 'createdAt', 'updatedAt'
            ],
            include: [
                // {
                //     model: sequelize.models.Group,
                //     as: 'groups'
                // }
            ]
        }
    });

    Property.associate = models => {
        Property.belongsToMany(models.Post , {
                // as: 'ad',
                through:models.Option,
                foreignKey:'propertyId',
                onDelete: 'Cascade'
            });
        Property.belongsTo(models.Group ,{as: 'group', onDelete: 'Cascade'});
    };

    return Property;
};