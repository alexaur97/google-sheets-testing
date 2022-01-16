const fs = require('fs');
const {google} = require('googleapis');
const {authorize} = require('./auth/auth.js');
const config = require('./config.json');

fs.readFile('credentials/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), retrieveData);
});

/*
1) recorrer constants.json:
  1.1) introducir en array todas las constantes que cumplan el formato
  1.2) ordenar array en función de la hoja
2) Por cada hoja:
  2.1) Obtener celda (x,y)
  2.2) actualizar en constant.json

*/
const constantFile = './constant.json';
const constants = require(constantFile);
const filteredConstants = Object.keys(constants)
  .filter(key => key.includes('!'));

function retrieveData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.batchGet({
    spreadsheetId: config.sheet_id,
    ranges: filteredConstants
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const sheetData = res.data.valueRanges;
    if (sheetData.length) {
      sheetData.forEach((item) => {
        constants[item.range] = item.values[0][0];
        console.log(`[*] Replaced "${constants[item.range]}" with "${item.values[0][0]}"\n`);
      });
      fs.writeFile(constantFile, JSON.stringify(constants,null,2), (err) => {
        if (err) throw err;
        console.log(`[SUCCESS] Saved ${constantFile}`);
      });
    } else {
      console.log('No data found.');
    }
  });

  // function filterColumn(columns, lang, rowNum){
  //   for (let i = 0; i<columns.length; i++){
  //     if(columns[i][0] === lang){
  //       let cell = columns[i][rowNum];
  //       return cell;
  //     }
  //   }
  //}
}