import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';

// Path to your Google service account credentials file
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Load client secrets from a local file.
const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));

// Use read/write scope for appending data
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '1kg47tBzBSdw7QLjqTkCPHI6dNsHikSt0nr9x7KUlW3E';

export async function getSheetData(range = 'Sheet1!A1:Z1000') {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return res.data.values;
}

export async function appendSheetData(headers: string[], values: any[], range: string) {
  // Optionally write headers if this is the first row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: [headers],
    },
  });

  // Append the actual data
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: [values],
    },
  });
}

export const db = { getSheetData, appendSheetData };