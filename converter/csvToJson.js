const fs = require('fs')
const parseCsv = require('csv-parse/lib/sync')
var unflatten = require('flat').unflatten

const { CSV_TO_JSON } = require('../parseParams')
const Logger = require('../logger')

const LOG_PREFIX = `[${CSV_TO_JSON}]`;
let logger;

/**
 * @param {AppParams} params
 * @constructor
 */
function CsvToJsonConverter(params) {
    params = params || {
        direction: CSV_TO_JSON,
        source: 'translations.csv',
        target: './',
        verbose: 0,
        delimiter: ',',
    }
    this.source = params.source;
    this.target = params.target;
    this.delimiter = params.delimiter;
    logger = new Logger(params.verbose, LOG_PREFIX);
}

/**
 * Reads the source CSV for translations, parse and
 * divide it so they can be written in multiple JSON
 * files in nested folders and nested JSON objects.
 * Finally saves to target JSON files in the target
 * directory.
 *
 * There is an other converter for the way around
 * @see {JsonToCsvConverter}
 */
CsvToJsonConverter.prototype.run = function () {
    const rows = readCsv(this.source, this.delimiter);
    const headers = rows.shift();
    logger.log(1, 'CSV has been successfully read.');
    logger.log(3, 'Headers:', headers);
    logger.log(3, 'Rows:', rows);

    const languages = discoverLanguages(headers);
    logger.log(1, 'Languages discovered.');
    logger.log(2, 'Discovered languages:', languages);

    const translations = parseRows(rows, languages);
    logger.log(1, 'Translations parsed.');
    logger.log(3, 'Translations:', translations);

    persistTranslations(translations, this.target);
    logger.log(0, 'Translations written to JSON files into folder %s', this.target);
}

/**
 * @param {string} path
 * @param {string} delimiter
 * @return {string[][]}
 */
function readCsv(path, delimiter) {
    const fileContent = fs.readFileSync(path);
    return parseCsv(fileContent, {
        delimiter
    })
}

/**
 * @param {string[]} headerRow
 * @return {string[]}
 */
function discoverLanguages(headerRow) {
    headerRow.shift() // we don't need 'Translation ID'
    return headerRow.map(h => h.replace(/ translations$/, '').toLowerCase())
}

/**
 * @param {string[][]} rows
 * @param {string[]} languages
 * @return {Object}
 */
function parseRows(rows, languages) {
    const translations = {};

    languages.forEach(lang => translations[lang] = {})

    rows.forEach(row => {
        const fullKey = row.shift();
        const folder = parseFolderFromTrKey(fullKey);
        const trKey = fullKey.split('/').pop();
        languages.forEach(lang => {
            if (!translations[lang][folder]) {
                translations[lang][folder] = {};
            }
            translations[lang][folder][trKey] = row.shift()
        })
    });

    return unflatten(translations);
}

/**
 * @param {string} key
 * @return {string}
 */
function parseFolderFromTrKey(key) {
    const parts = key.split('/');
    parts.pop() // drop trKey in JSON structure
    return parts.join('/') || 'root';
}

/**
 * @param {Object} translations
 * @param {string} path
 * @return {void}
 */
function persistTranslations(translations, path) {
    Object.keys(translations).forEach(lang => {
        persistTranslationFile(translations[lang].root, [path, `${lang}.json`].join('/'))
        delete translations[lang].root;

        Object.keys(translations[lang]).forEach(dir => {
            persistTranslationFile(translations[lang][dir], [path, dir, `${lang}.json`].join('/'))
        })
    })
}

/**
 * @param {Object} translations
 * @param {string} path
 * @return {void}
 */
function persistTranslationFile(translations, path) {
    if (!translations) {
        return;
    }
    const dir = path.split('/');
    dir.pop();
    fs.mkdirSync(dir.join('/'), { recursive: true })
    fs.writeFileSync(path, JSON.stringify(translations, void 0, 2));
}

module.exports = CsvToJsonConverter;