# Translation JSON-CSV Converter

Flattens JSON translation files in your i18n folder to a CSV file so a translator
can translate them in Excel or similar spreadsheet editor. Then it can convert JSON
files back to your folder structure.

**Limitation:** it reads the folder 2 level deep only: the 'root' folder you provided
and one folder as a namespace of other translations JSON files.

## How to use

This is a CLI tool so you need to run it in a command line having
[NodeJS](https://nodejs.org) installed.

```bash
node index.js [options]
```

### Default options

```json
{
  "direction": "JSON2CSV",
  "source": "i18n",
  "target": "translations.csv",
  "delimiter": ",",
  "verbose": 0
}
```

### Options

#### Direction

The direction of the conversion.

Option: `direction`  
Aliases: `dir`  
Values: 'JSON2CSV' | 'CSV2JSON'  
Default: 'JSON2CSV'

Examples:
```bash
node index.js direction CSV2JSON
node index.js dir CSV2JSON
```

#### Source

In case of JSON2CSV this is the directory of your JSON files and
in case of CSV2JSON this is the translation CSV file

Option: `input`  
Aliases: `i`, `folder`, `f`  
Value: path/to/source  
Default: 'i18n'

Examples:
```bash
# JSON2CSV
node index.js input demo
node index.js f demo

# CSV2JSON
node index.js i demo/translations-filled.csv
```

#### Target / output

In case of JSON2CSV this is the translation CSV file and
in case of CSV2JSON this is the directory of your JSON files

Option: `output`  
Aliases: `o`, `target`, `t`  
Value: path/to/target  
Default: 'translations.csv'

Examples:
```bash
# JSON2CSV
node index.js output demo/translations-filled.csv
node index.js t demo/translations-filled.csv

# CSV2JSON
node index.js o demo
node index.js target demo
```

#### Delimiter

Delimiter character for CSV parsing / writing.

Option: `delimiter`  
Aliases: `s`  
Value: '\t'  
Default: ','

Examples:
```bash
node index.js s ';'
```
#### Verbosity

The script outputs error messages and a final success message by default.
Set higher verbosity if you want more output.

Options: `v`, `vv`, `vvv`

Examples:
```bash
node index.js i demo v # logs every step without information
node index.js i demo vv # more information
node index.js i demo vvv # most information
```

## Demo

You can try it using the demo folder or use your own.

```bash
# English texts are done by the programmers. Now we can
# export all translation keys.
node index.js i demo o demo/translations-for-translator.csv

# The translator is done with the translations in Excel,
# and the export was done with ';' delimiter...
node index.js dir CSV2JSON i demo/translations-done.csv o demo s ';'
```
