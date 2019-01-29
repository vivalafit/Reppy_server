
module.exports = function(sequelize, DataTypes) {

    var Faq = sequelize.define('Faq', {
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
    return Faq;
};
