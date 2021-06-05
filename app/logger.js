/**
 * @param {number} logLevel
 * @param {string} prefix
 * @constructor
 */
function Logger(logLevel, prefix) {
    this.logLevel = parseInt(logLevel, 10) || 0;
    this.prefix = prefix || 'UNKNOWN';
}

Logger.prototype.log = function (logLevel, template, ...args) {
    if (logLevel > this.logLevel) {
        return;
    }
    console.log('%s ' + template, this.prefix, ...args);
}

module.exports = Logger;
