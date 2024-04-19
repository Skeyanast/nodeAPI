const winston = require('winston');

function getLogger(module) {
    const path = module.filename.split('/').slice(-2).join('/');

    return winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.label({ label: path }),
                    winston.format.simple()
                ),
                level: 'debug'
            })
        ]
    });
}

module.exports = getLogger;