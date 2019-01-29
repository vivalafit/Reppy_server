module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var Option = sequelize.define('Option', {
        status: {
            type: DataTypes.STRING,
            defaultValue: 1
        }
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

    return Option;
};