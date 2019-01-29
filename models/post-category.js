module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var PostCategory = sequelize.define('PostCategory', {
    }/*, {
        defaultScope: {
            attributes: [
                'createdAt', 'updatedAt'
            ],
            include: [
                // {
                //     model: sequelize.models.Property,
                //     as: 'properties'
                // }
            ]
        }
    }*/);

    // Option.associate = models => {
    //     // Option.belongsToMany(models.Property)
    //     Option.belongsTo(models.Ad ,{as: 'ad', onDelete: 'Cascade'});
    // };

    return PostCategory;
};