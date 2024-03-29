import { IFirebaseUser } from "./IAuthentication";
import { ILocation } from "./IShared";

export interface IReceiptCategory {
    id?: number;
    name?: string;
  }
  
  export interface IReceiptItem {
    id?: number;
    name?: string;
    price?: number;
    paid?: boolean;
    purchasers?: string[];
  }
  
  export interface IReceipt {
    id?: number;
    firebaseId?: string;
    joinCode?: string;
    name?: string;
    vendor?: string;
    image?: string;
    location?: ILocation;
    host?: string;
    hostName?: string;
    memberNames?: string[];
    members?: string[];
    guests?: string[];
    items?: IReceiptItem[];
    total: number;
    subtotal: number;
    received: number;
    tax: number; 
    tip: number;
    timestamp?: number;
    onPress?: (event?: any) => void;
  }