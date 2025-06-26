export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
  apiKey: string;
}

export interface SheetRow {
  date: string;
  time: string;
  cardId: string;
  habitName: string;
  action: string;
  duration?: number;
  device?: string;
  notes?: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async fetchData(): Promise<SheetRow[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row if it exists
      const dataRows = rows.slice(1);
      
      return dataRows.map((row: string[]) => ({
        date: row[0] || '',
        time: row[1] || '',
        cardId: row[2] || '',
        habitName: row[3] || '',
        action: row[4] || '',
        duration: row[5] ? parseInt(row[5], 10) : undefined,
        device: row[6] || undefined,
        notes: row[7] || undefined,
      }));
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }

  async syncToDatabase(data: SheetRow[]): Promise<void> {
    try {
      const response = await fetch('/api/sync/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries: data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error syncing to database:', error);
      throw error;
    }
  }
}

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function isValidGoogleSheetsUrl(url: string): boolean {
  return url.includes('docs.google.com/spreadsheets') && extractSpreadsheetId(url) !== null;
}
