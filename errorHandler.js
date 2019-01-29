const logger = require('./logger');
module.exports = function(error, descr){
    logger(descr, error);
};