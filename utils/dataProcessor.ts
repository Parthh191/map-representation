import * as XLSX from 'xlsx';

export interface RawPersonData {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  [key: string]: string | undefined;
}

export interface ValidatedData {
  valid: RawPersonData[];
  invalid: RawPersonData[];
  validationErrors: Record<number, string[]>;
}

export function validateAddress(data: RawPersonData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.city?.trim()) {
    errors.push('City is required');
  }

  if (!data.country?.trim()) {
    errors.push('Country is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function processRawData(rawData: unknown[]): ValidatedData {
  const valid: RawPersonData[] = [];
  const invalid: RawPersonData[] = [];
  const validationErrors: Record<number, string[]> = {};

  rawData.forEach((row, index) => {
    // Skip empty rows
    if (!row || Object.keys(row as object).length === 0) return;

    const processedRow: RawPersonData = {
      name: String((row as any)['Name'] || (row as any)['name'] || '').trim(),
      street: String((row as any)['Street'] || (row as any)['street'] || (row as any)['address'] || '').trim(),
      city: String((row as any)['City'] || (row as any)['city'] || '').trim(),
      state: String((row as any)['State'] || (row as any)['state'] || '').trim(),
      country: String((row as any)['Country'] || (row as any)['country'] || '').trim()
    };

    const { isValid, errors } = validateAddress(processedRow);

    if (isValid) {
      valid.push(processedRow);
    } else {
      invalid.push(processedRow);
      validationErrors[index] = errors;
    }
  });

  return { valid, invalid, validationErrors };
}

export function generateExcelFile(data: RawPersonData[], fileName: string): Blob {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
