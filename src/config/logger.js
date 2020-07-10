'use strict';

const winston = require('winston')

const options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
    }
};

module.exports = winston.createLogger({
    handleExceptions: true,
    exitOnError: false,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File(options.file)
    ]
});