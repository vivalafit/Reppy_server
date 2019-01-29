module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var Request = sequelize.define('Request', {
        // postId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // userId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        comment: {
            type: DataTypes.STRING
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
    Request.associate = models => {
        Request.belongsTo(models.User, {as: 'user', onDelete: 'Cascade'});
        Request.belongsTo(models.Post, {as: 'post', onDelete: 'Cascade'});
    };
    return Request;
};