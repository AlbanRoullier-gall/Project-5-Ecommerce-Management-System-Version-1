import { YearExportRequestDTO, OrderInvoiceRequestDTO } from "../api/dto";
export declare class PDFGenerator {
    generateOrdersYearExport(data: YearExportRequestDTO): Promise<Buffer>;
    generateOrderInvoice(data: OrderInvoiceRequestDTO): Promise<Buffer>;
    private generateHTML;
    private generateOrderDetailsHTML;
    private generateCreditNoteDetailsHTML;
    private generateInvoiceHTML;
}
//# sourceMappingURL=pdfGenerator.d.ts.map