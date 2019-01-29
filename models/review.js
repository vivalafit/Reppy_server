module.exports = function(sequelize, DataTypes) {
    // if(!sequelize.models.Group) sequelize['import']('./group');
    // if(!sequelize.models.Property) sequelize['import']('./property');

    var Review = sequelize.define('Review', {
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        positive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        // userId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        // postId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // }
    });
    Review.associate = models => {
        Review.belongsTo(models.User, {as: 'user', onDelete: 'Cascade'});
        Review.belongsTo(models.Post, {as: 'post', onDelete: 'Cascade'});
    };
    return Review;
};