const {processArgs, JSON_TO_CSV, CSV_TO_JSON} = require("./parseParams");

const args = process.argv.slice(2);
const params = processArgs(args);

// console.log('params: ', params);

let converterClass;

switch (params.direction) {
    case JSON_TO_CSV:
        converterClass = require('./converter/jsonToCsv');
        break;

    case CSV_TO_JSON:
        converterClass = require('./converter/csvToJson');
        break;
}

const converter = new converterClass(params);

converter.run();
