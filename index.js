const {processArgs, JSON_TO_CSV, CSV_TO_JSON} = require("./app/parseParams");

const args = process.argv.slice(2);
const params = processArgs(args);

// console.log('params: ', params);

let converterClass;

switch (params.direction) {
    case JSON_TO_CSV:
        converterClass = require('./app/converter/jsonToCsv');
        break;

    case CSV_TO_JSON:
        converterClass = require('./app/converter/csvToJson');
        break;
}

const converter = new converterClass(params);

converter.run();
