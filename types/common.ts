export interface PersonData {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  coordinates: [number, number];
}

export interface ProcessingResult {
  validData: PersonData[];
  invalidData: PersonData[];
}
