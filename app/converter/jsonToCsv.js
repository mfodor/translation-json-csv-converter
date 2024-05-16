const fs = require('fs');
const flatten = require('flat');
const csv = require('csv');
const { JSON_TO_CSV } = require('../parseParams')
const Logger = require('../logger')

const LOG_PREFIX = `[${JSON_TO_CSV}]`;
let logger;

/**
 * @param {AppParams} params
 * @constructor
 */
function JsonToCsvConverter(params) {
    params = params || {
        direction: JSON_TO_CSV,
        source: './',
        target: 'translations.csv',
        verbose: 0,
        delimiter: ',',
        encoding: null,
        bom: false
    }
    this.source = params.source;
    this.target = params.target;
    this.delimiter = params.delimiter;
    this.encoding = params.encoding;
    this.bom = params.bom;
    logger = new Logger(params.verbose, LOG_PREFIX);
}

/**
 * Discovers the source folder for translation JSON files,
 * reads and merges all of them into one object to save
 * them as one file into the target CSV file. So the
 * translator gets a simple table-like file which they
 * can easily handle and do the translation in it.
 *
 * There is an other converter for the way around
 * @see {CsvToJsonConverter}
 */
JsonToCsvConverter.prototype.run = function () {
    const files = discoverJsonFiles(this.source);
    logger.log(1, 'directory has been discovered.');
    logger.log(2, 'source json files:', files);

    const languages = discoverLanguages(files);
    logger.log(1, '%d languages found.', languages.length);
    logger.log(2, 'languages found:', languages);

    const translations = loadTranslations(files, languages, this.source, this.encoding, this.bom);
    logger.log(1, 'All translations loaded.');
    logger.log(3, 'All, flattened translations:', translations);

    const forCsv = transformForCsv(translations, languages);
    logger.log(1, 'Prepared for CSV export.');
    logger.log(3, 'CSV ready object:', forCsv);

    saveAsCsv(forCsv, languages, this.target, this.delimiter);
    logger.log(0, 'Successfully exported to %s.', this.target);
}


/**
 * @param {string} directory
 * @return {string[]}
 */
function discoverJsonFiles(directory) {
    let files = fs.readdirSync(directory);
    return files.reduce((all, file) => {
        const path = [directory, file].join('/');
        if (fs.lstatSync(path).isDirectory()) {
            return all.concat(discoverJsonFiles(path))
        }

        if (file.endsWith('.json')) {
            all.push(path);
        }

        return all;
    }, []).filter(i => !!i);
}

/**
 * @param {string} file
 * @param {string} rootPath
 * @return {Object}
 */
function readJsonFile(file, rootPath, encoding, bom) {
    const fileContent = encoding ? fs.readFileSync(file, "utf8") : fs.readFileSync(file);
    const translations = JSON.parse(bom ? fileContent.replace(/^\uFEFF/, '') : fileContent);
    const flatObj = flatten(translations);
    return prefixObject(flatObj, file, rootPath);
}

/**
 * @param {Object} obj
 * @param {string} path
 * @param {string} rootPath
 * @return {Object}
 */
function prefixObject(obj, path, rootPath) {
    path = path.replace(`${rootPath}`, '');
    const pathParts = path.split('/');
    pathParts.shift(); // root dir
    pathParts.pop(); // JSON file

    if (!pathParts.length) {
        return obj;
    }

    const prefix = pathParts.join('/') + '/';

    const prefixed = {};
    for (const key in obj) {
        prefixed[prefix + key] = obj[key];
    }

    return prefixed;
}

/**
 * @param {string[]} files
 * @return {string[]}
 */
function discoverLanguages(files) {
    return files.reduce((all, file) => {
        const lang = getLangFromFilePath(file);
        if(!all.includes(lang)) {
            all.push(lang);
        }
        return all;
    }, []);
}

/**
 * @param {string} path
 * @return {string}
 */
function getLangFromFilePath(path) {
    return path.split('/').pop().replace(/\.json$/, '');
}

/**
 * @param {string[]} files
 * @param {string[]} languages
 * @param {string} rootPath
 * @return {Object}
 */
function loadTranslations(files, languages, rootPath, encoding, bom) {
    const translations = {};
    languages.forEach(lang => (translations[lang] = {}));
    files.forEach(file => {
        const lang = getLangFromFilePath(file);
        translations[lang] = {
            ...translations[lang],
            ...readJsonFile(file, rootPath, encoding, bom)
        };
    }, {});
    return translations;
}

/**
 * @param {Object} translations
 * @param {string[]} languages
 * @return {Object}
 */
function transformForCsv(translations, languages) {
    const forCsv = {};
    languages.forEach(lang => {
        Object.keys(translations[lang]).forEach(key => {
            if (!forCsv[key]) {
                forCsv[key] = {};
            }
            forCsv[key][lang] = translations[lang][key] || '';
        });
    });
    return Object.keys(forCsv).map(key => {
        const row = [key];
        languages.forEach(lang => row.push(forCsv[key][lang] || ''));
        return row;
    });
}

/**
 * @param {string[][]} forCsv
 * @param {string[]} languages
 * @param {string} path
 * @param {string} delimiter
 */
function saveAsCsv(forCsv, languages, path, delimiter) {
    const lines = [];
    const exporter = csv.stringify({
        delimiter
    });

    exporter.on('readable', function () {
        let row;
        while (row = exporter.read()) {
            lines.push(row);
        }
    });

    exporter.on('error', function (e) {
        logger.log(0, '[ERROR] Could not create CSV!', e);
    });

    exporter.on('finish', function () {
        fs.writeFileSync(path, lines.join(''))
    });

    const headers = ['Translation ID'];
    languages.forEach(lang => headers.push(`${lang.toUpperCase()} translations`));
    exporter.write(headers);
    forCsv.forEach(row => exporter.write(row))
    exporter.end();
}

module.exports = JsonToCsvConverter;
