const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  console.log("======================");
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listMajors);
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1gYi65M7vKQyyKFpxekZ1N-H9GTF2d0Uuw_5pDjLSVqY',
    range: 'Hoja 1!A:C',
    majorDimension: 'COLUMNS'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const sheetData = res.data.values;
    const payloadsColumn = sheetData[0];
    const languageColumns = sheetData.slice(1);
    const responseName = 'BLABLA2%EN';
    const trimmed = responseName.split('%');
    const row = payloadsColumn.indexOf(trimmed[0]);
    const cell = filterColumn(languageColumns, trimmed[1], row);
    if (sheetData.length) {
        console.log(cell);
    } else {
      console.log('No data found.');
    }
  });

  function filterColumn(columns, lang, rowNum){
      for (let i = 0; i<columns.length; i++){
          if(columns[i][0] === lang){
            let cell = columns[i][rowNum];
            return cell;
          }
      }
  }
}