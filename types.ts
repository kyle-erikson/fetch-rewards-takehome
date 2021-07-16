export interface Transaction {
  payer: string;
  points: number;
}

export interface TransactionWithTime extends Transaction {
  timestamp: Date;
}

export interface Spend {
  points: number;
}
