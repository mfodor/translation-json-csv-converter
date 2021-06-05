const fs = require('fs');

const JSON_TO_CSV = 'JSON2CSV';
const CSV_TO_JSON = 'CSV2JSON';

const params = {
    direction: JSON_TO_CSV,
    source: '',
    target: 'translations.csv',
    verbose: 0,
    delimiter: ','
}

/**
 * @typedef AppParams
 * @property {string} direction
 * @property {string} source
 * @property {string} target
 * @property {number} verbose
 * @property {string} delimiter
 */

/**
 * @param {string[]} args
 * @return {AppParams}
 */
function processArgs(args) {
    let arg;
    while (arg = args.shift()) {
        switch (arg) {
            case 'direction':
            case 'dir':
                setDirection(args.shift());
                break;

            case 'input':
            case 'folder':
            case 'i':
            case 'f':
                setSource(args.shift());
                break;

            case 'output':
            case 'target':
            case 'o':
            case 't':
                setTarget(args.shift());
                break;

            case 's':
                setDelimiter(args.shift());
                break;

            case 'v':
                params.verbose = 1;
                break;

            case 'vv':
                params.verbose = 2;
                break;

            case 'vvv':
                params.verbose = 3;
                break;
        }
    }
    validate();

    return params;
}

/**
 * @param {string} direction
 */
function setDirection(direction) {
    if (!direction || (direction !== JSON_TO_CSV && direction !== CSV_TO_JSON)) {
        console.log('Unknown direction: %s!', direction);
        process.exit(2);
    }
    params.direction = direction;
    if (direction === CSV_TO_JSON) {
        params.source = params.source || 'translations.csv';
    }
}

/**
 * @param {string} source
 */
function setSource(source) {
    if (!source || !fs.existsSync(source)) {
        console.log('Directory not provided or not exists: %s!', source);
        process.exit(2);
    }
    params.source = source;
}

/**
 * @param {string} target
 */
function setTarget(target) {
    if (!target || !fs.existsSync(target)) {
        console.log('Directory not provided or not exists: %s!', target);
        process.exit(2);
    }
    params.target = target;
}

/**
 * @param {string} delimiter
 */
function setDelimiter(delimiter) {
    if (!delimiter || delimiter.length > 1) {
        console.log('Delimiter is not valid or missing: %s!', delimiter);
        process.exit(2);
    }
    params.delimiter = delimiter;
}

function validate() {
    if (!fs.existsSync(params.source)) {
        console.log('Source does not exist!')
        process.exit(4);
    }
    if (params.direction === JSON_TO_CSV) {
        if (!params.source || !fs.lstatSync(params.source).isDirectory()) {
            console.log('Source must be a directory containing the translation JSON files!');
            process.exit(4);
        }
    } else {
        if (!params.source || !fs.existsSync(params.source) || !fs.lstatSync(params.source).isFile()) {
            console.log('Source must be a CSV file containing the translations!');
            process.exit(4);
        }
        if (params.target && fs.existsSync(params.target) && !fs.lstatSync(params.target).isDirectory()) {
            console.log('Target must be a directory where the translation JSON files will be written!');
            process.exit(4);
        }
    }
}

module.exports = {
    processArgs,
    JSON_TO_CSV,
    CSV_TO_JSON
};
