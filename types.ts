export enum TruckType {
  TENT = 'Тент',
  CONTAINER = 'Контейнер',
  REF = 'Рефрижератор',
  BOARD = 'Борт',
  MEGA = 'Мега',
  PLATFORM = 'Площадка',
  TANKER = 'Бензовоз'
}

export type Currency = 'RUB' | 'USD' | 'UZS' | 'EUR' | 'KZT' | 'KGS';

export type ViewState = 'HOME' | 'SEARCH_TRUCK' | 'SEARCH_CARGO' | 'PROFILE';

export type ListingStatus = 'draft' | 'active' | 'in_progress' | 'closed' | 'cancelled';

export interface BaseListing {
  id: string;
  creatorId?: string; // To identify owner for deletion
  
  // Lifecycle
  status: ListingStatus;
  updatedAt: number;
  expiresAt: number;
  createdAt: number;

  // Contact Info
  contactName: string;
  contactPhone: string;
  telegramHandle?: string;
  
  // Route & Details
  fromCity: string;
  toCity: string;
  date: string;
  urgent: boolean;
  comment?: string;
}

export interface TruckListing extends BaseListing {
  kind: 'truck';
  truckType: TruckType;
  capacity: number; // in tons
  isEmpty: boolean;
}

export interface CargoListing extends BaseListing {
  kind: 'cargo';
  weight: number; // in tons
  volume?: number; // in m3
  cargoType: string;
  
  // Transport requirements
  neededTruckTypes?: string[]; // Array of selected truck types
  tags?: string[]; // "Paravoz", "Tyagach", "Dogruz"
  
  // Conditions
  price?: number;
  currency: Currency; 
  hasPrepayment?: boolean; // Avans
}

export type Listing = TruckListing | CargoListing;