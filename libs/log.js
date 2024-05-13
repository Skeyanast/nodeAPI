const winston = require('winston');

const getLogger = (module) => {
    const path = module.filename.split('/').slice(-2).join('/');

    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.label({ label: path }),
                    winston.format.simple()
                ),
                level: 'debug',
            }),
        ],
    });

    return {
        info: logger.info.bind(logger),
        error: logger.error.bind(logger),
        warn: logger.warn.bind(logger),
        debug: logger.debug.bind(logger),
    };
};

module.exports = getLogger;