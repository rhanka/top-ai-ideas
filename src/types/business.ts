
export interface BusinessSector {
  id: string;
  name: string;
  description: string;
}

export interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  sectors?: string[]; // Optional: limit process to specific sectors
}

export interface BusinessConfiguration {
  sectors: BusinessSector[];
  processes: BusinessProcess[];
}
