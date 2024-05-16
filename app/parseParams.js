const fs = require('fs');

const JSON_TO_CSV = 'JSON2CSV';
const CSV_TO_JSON = 'CSV2JSON';

const params = {
    direction: JSON_TO_CSV,
    source: 'i18n',
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

            case 'delimiter':
            case 's':
                setDelimiter(args.shift());
                break;

            case 'encoding':
            case 'e':
                setEncoding(args.shift());
                break;

            case 'array-handling':
            case 'arr':
                setArrayHandling(args.shift());
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
        console.log('Source not provided or not exists: %s!', source);
        process.exit(2);
    }
    params.source = source;
}

/**
 * @param {string} target
 */
function setTarget(target) {
    if (!target) {
        console.log('Target not provided: %s!', target);
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

/**
 * @param {string} encoding
 */
function setEncoding(encoding) {
    if (!encoding || encoding.length < 1) {
        console.log('Encoding not provided: %s!', encoding);
        process.exit(2);
    }
    params.bom = encoding.endsWith("-bom");
    if (!params.bom)
        params.encoding = encoding;
    else if (encoding.length > 4)
        params.encoding = encoding.substring(0, encoding.length - 4);
}

/**
 * @param {string} encoding
 */
function setArrayHandling(arrayHandling) {
    if (!arrayHandling || arrayHandling.length < 1) {
        console.log('ArrayHandling not provided: %s!', arrayHandling);
        process.exit(2);
    }
    const validTrueValues = ["object"];
    const validFalseValues = ["array"];
    if (validTrueValues.includes(arrayHandling))
        params.arrayHandling = "object";
    else if(validFalseValues.includes(arrayHandling))
        params.arrayHandling = "array";
    else {
        console.log('ArrayHandling is not valid: %s! Valid options are: %s', arrayHandling, validTrueValues.concat(validFalseValues).join(", "));
        process.exit(2);
    }
}

function validate() {
    if (params.direction === JSON_TO_CSV) {
        if (!params.source || !fs.existsSync(params.source) || !fs.lstatSync(params.source).isDirectory()) {
            console.log('Source must be a directory containing the translation JSON files!');
            process.exit(4);
        }
        if (params.arrayHandling) {
            console.log('ArrayHandling is not valid for this direction and will be ignored!');
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
