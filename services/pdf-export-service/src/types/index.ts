export interface OrderExportData {
  id: number;
  customerId: number;
  customerSnapshot: any | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  paymentMethod: string | null;
  notes: string | null;
  delivered: boolean;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditNoteExportData {
  id: number;
  customerId: number;
  orderId: number;
  reason: string;
  description: string | null;
  issueDate: Date | null;
  paymentMethod: string | null;
  totalAmountHT: number;
  totalAmountTTC: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface YearExportRequest {
  year: number;
  orders: OrderExportData[];
  creditNotes: CreditNoteExportData[];
}

export interface ExportResponse {
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
}
