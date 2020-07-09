'use strict';

const winston = require('winston')

const options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
    },
    console: {
        level: 'debug',
        format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    },
};

module.exports = winston.createLogger({
    handleExceptions: true,
    exitOnError: false,
    transports: [
        new winston.transports.Console(options.console),
        new winston.transports.File(options.file)
    ]
});