// const bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {

    var Post = sequelize.define('Post', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT
        },
        attachments: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM,
            values: ['open', 'in work', 'completed', 'offer'],
            defaultValue: 'open'
        },
        endedByExecutor: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        startingDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        defaultScope: {
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'attachments',
                'status',
                'address',
                'startingDate',
                'createdAt',
                'updatedAt',
                'endedByExecutor',
                'executorId',
                'customerId',
                'offeredExecutorId'
            ]/*,
            include: [
                {
                    model: sequelize.models.PostCategory,
                    as: 'category'
                }
            ]*/
        }
    });
    Post.associate = models => {
        Post.belongsToMany(models.Property , {
            // as: 'property',
            as: 'properties',
            through:models.Option,
            foreignKey:'postId',
            onDelete: 'Cascade'
        });
        Post.belongsToMany(models.Category ,{
            through: models.PostCategory,
            foreignKey: 'postId',
            as: 'category',
            onDelete: 'Cascade'
        });
        Post.belongsTo(models.User ,{as: 'customer', onDelete: 'Cascade'});
        Post.belongsTo(models.Location ,{as: 'location', onDelete: 'Cascade'});
        Post.hasOne(models.Review, {foreignKey: 'postId', as: 'review', onDelete: 'Cascade' });
        Post.hasMany(models.Request, {foreignKey: 'postId', as: 'request', onDelete: 'Cascade' });
        Post.belongsTo(models.User ,{as: 'executor', onDelete: 'Cascade'});
        Post.belongsTo(models.User ,{as: 'offeredExecutor', onDelete: 'Cascade'});
        // Ad.hasMany(models.Property, {foreignKey: 'adId', as: 'properties', onDelete: 'Cascade' });
        // Ad.hasMany(models.Option, {foreignKey: 'adId', as: 'options', onDelete: 'Cascade' });
    };
    return Post;
};
