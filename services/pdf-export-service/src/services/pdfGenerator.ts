import { YearExportRequestDTO } from "../api/dto";

export class PDFGenerator {
  async generateOrdersYearExport(data: YearExportRequestDTO): Promise<Buffer> {
    const html = this.generateHTML(data);

    // Pour l'instant, retournons du HTML au lieu d'un PDF
    // Cela évite les problèmes avec Puppeteer
    return Buffer.from(html, "utf-8");
  }

  private generateHTML(data: YearExportRequestDTO): string {
    const { year, orders, creditNotes } = data;

    console.log(
      `📄 Génération HTML: ${orders.length} commandes, ${creditNotes.length} avoirs reçus`
    );

    // Generate detailed orders HTML
    const ordersHTML = orders
      .map((order) => this.generateOrderDetailsHTML(order))
      .join("");

    // Generate detailed credit notes HTML
    const creditNotesHTML = creditNotes
      .map((creditNote) => this.generateCreditNoteDetailsHTML(creditNote))
      .join("");

    const totalOrdersAmount = orders.reduce(
      (sum, order) => sum + parseFloat(String(order.totalAmountTTC || 0)),
      0
    );
    const totalCreditNotesAmount = creditNotes.reduce(
      (sum, creditNote) =>
        sum + parseFloat(String(creditNote.totalAmountTTC || 0)),
      0
    );

    console.log(
      `💰 Totaux calculés: ${totalOrdersAmount.toFixed(
        2
      )} € commandes, ${totalCreditNotesAmount.toFixed(2)} € avoirs`
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Export Commandes ${year} - Nature de Pierre</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #13686a;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #13686a;
            margin: 0;
          }
          .header h2 {
            color: #666;
            margin: 10px 0 0 0;
            font-weight: normal;
          }
          .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary h3 {
            color: #13686a;
            margin-top: 0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 15px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item .number {
            font-size: 24px;
            font-weight: bold;
            color: #13686a;
          }
          .summary-item .label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 40px;
          }
          .section h3 {
            color: #13686a;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .order-details, .credit-note-details {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            background-color: #fafafa;
          }
          .order-details h2, .credit-note-details h2 {
            color: #13686a;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.5em;
          }
          .order-info, .credit-note-info, .order-items, .credit-note-items, .order-addresses {
            margin-bottom: 20px;
          }
          .order-info h3, .credit-note-info h3, .order-items h3, .credit-note-items h3, .order-addresses h3 {
            color: #13686a;
            font-size: 1.2em;
            margin-bottom: 10px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .info-table td {
            padding: 8px;
            border: 1px solid #e0e0e0;
          }
          .info-table td:first-child {
            background-color: #f5f5f5;
            font-weight: bold;
            width: 30%;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .items-table th, .items-table td {
            padding: 8px;
            border: 1px solid #e0e0e0;
            text-align: left;
          }
          .items-table th {
            background-color: #13686a;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          .address-block {
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: white;
          }
          .address-block h4 {
            color: #13686a;
            margin-top: 0;
            margin-bottom: 10px;
          }
          .order-separator, .credit-note-separator {
            border: none;
            border-top: 2px solid #13686a;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          th {
            background-color: #13686a;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Nature de Pierre</h1>
          <h2>Export des Commandes et Avoirs - Année ${year}</h2>
        </div>

        <div class="summary">
          <h3>Résumé de l'année ${year}</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${orders.length}</div>
              <div class="label">Commandes</div>
            </div>
            <div class="summary-item">
              <div class="number">${creditNotes.length}</div>
              <div class="label">Avoirs</div>
            </div>
            <div class="summary-item">
              <div class="number">${totalOrdersAmount.toFixed(2)} €</div>
              <div class="label">Total Commandes</div>
            </div>
            <div class="summary-item">
              <div class="number">${totalCreditNotesAmount.toFixed(2)} €</div>
              <div class="label">Total Avoirs</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Détails des Commandes de ${year}</h2>
          ${ordersHTML}
        </div>

        <div class="section">
          <h2>Détails des Avoirs de ${year}</h2>
          ${creditNotesHTML}
        </div>

        <div class="footer">
          <p>Export généré le ${new Date().toLocaleDateString(
            "fr-FR"
          )} à ${new Date().toLocaleTimeString("fr-FR")}</p>
          <p>Nature de Pierre - Système de gestion</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderDetailsHTML(order: any): string {
    const customerSnapshot = order.customerSnapshot || {};
    const customerFirstName = customerSnapshot.firstName || "N/A";
    const customerLastName = customerSnapshot.lastName || "N/A";
    const customerEmail = customerSnapshot.email || "N/A";

    // Generate order items HTML
    const orderItemsHTML =
      order.items && order.items.length > 0
        ? order.items
            .map(
              (item: any) => `
          <tr>
            <td>${item.productName || "N/A"}</td>
            <td>${item.quantity}</td>
            <td>${parseFloat(item.unitPriceHT || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.unitPriceTTC || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.totalPriceHT || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.totalPriceTTC || 0).toFixed(2)} €</td>
          </tr>
        `
            )
            .join("")
        : '<tr><td colspan="6">Aucun article</td></tr>';

    // Generate addresses HTML
    const addressesHTML =
      order.addresses && order.addresses.length > 0
        ? order.addresses
            .map((address: any) => {
              // Gérer les deux structures possibles
              const addressData = address.addressSnapshot || address;
              const addressType = address.addressType || address.type;

              return `
          <div class="address-block">
            <h4>${
              addressType === "billing"
                ? "Adresse de facturation"
                : "Adresse de livraison"
            }</h4>
            <p>${addressData.firstName} ${addressData.lastName}</p>
            ${addressData.company ? `<p>${addressData.company}</p>` : ""}
            <p>${addressData.address || addressData.addressLine1}</p>
            ${
              addressData.addressLine2
                ? `<p>${addressData.addressLine2}</p>`
                : ""
            }
            <p>${addressData.postalCode} ${addressData.city}</p>
            <p>${addressData.country}</p>
            ${addressData.phone ? `<p>Tél: ${addressData.phone}</p>` : ""}
            ${addressData.email ? `<p>Email: ${addressData.email}</p>` : ""}
          </div>
        `;
            })
            .join("")
        : "<p>Aucune adresse</p>";

    return `
      <div class="order-details">
        <h2>Commande #${order.id}</h2>
        
        <div class="order-info">
          <h3>Informations générales</h3>
          <table class="info-table">
            <tr><td><strong>ID Commande:</strong></td><td>${order.id}</td></tr>
            <tr><td><strong>Client:</strong></td><td>${customerFirstName} ${customerLastName}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${customerEmail}</td></tr>
            <tr><td><strong>Date de création:</strong></td><td>${new Date(
              order.createdAt
            ).toLocaleDateString("fr-FR")}</td></tr>
            <tr><td><strong>Méthode de paiement:</strong></td><td>${
              order.paymentMethod || "N/A"
            }</td></tr>
            <tr><td><strong>Statut:</strong></td><td>${
              order.delivered ? "Livrée" : "En attente"
            }</td></tr>
            <tr><td><strong>Total HT:</strong></td><td>${parseFloat(
              order.totalAmountHT || 0
            ).toFixed(2)} €</td></tr>
            <tr><td><strong>Total TTC:</strong></td><td>${parseFloat(
              order.totalAmountTTC || 0
            ).toFixed(2)} €</td></tr>
            ${
              order.notes
                ? `<tr><td><strong>Notes:</strong></td><td>${order.notes}</td></tr>`
                : ""
            }
          </table>
        </div>

        <div class="order-items">
          <h3>Articles commandés</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire HT</th>
                <th>Prix unitaire TTC</th>
                <th>Total HT</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHTML}
            </tbody>
          </table>
        </div>

        <div class="order-addresses">
          <h3>Adresses</h3>
          ${addressesHTML}
        </div>

        <hr class="order-separator">
      </div>
    `;
  }

  private generateCreditNoteDetailsHTML(creditNote: any): string {
    // Debug: Log credit note data
    console.log(`🔍 Credit Note #${creditNote.id}:`, {
      hasItems: !!creditNote.items,
      itemsType: typeof creditNote.items,
      itemsIsArray: Array.isArray(creditNote.items),
      itemsLength: creditNote.items?.length,
      items: creditNote.items,
      allProperties: Object.keys(creditNote),
    });

    // Generate credit note items HTML
    const creditNoteItemsHTML =
      creditNote.items && creditNote.items.length > 0
        ? creditNote.items
            .map(
              (item: any) => `
          <tr>
            <td>${item.productName || "N/A"}</td>
            <td>${item.quantity}</td>
            <td>${parseFloat(item.unitPriceHT || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.unitPriceTTC || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.totalPriceHT || 0).toFixed(2)} €</td>
            <td>${parseFloat(item.totalPriceTTC || 0).toFixed(2)} €</td>
          </tr>
        `
            )
            .join("")
        : '<tr><td colspan="6">Aucun article</td></tr>';

    return `
      <div class="credit-note-details">
        <h2>Avoir #${creditNote.id}</h2>
        
        <div class="credit-note-info">
          <h3>Informations générales</h3>
          <table class="info-table">
            <tr><td><strong>ID Avoir:</strong></td><td>${
              creditNote.id
            }</td></tr>
            <tr><td><strong>Commande associée:</strong></td><td>${
              creditNote.orderId || "N/A"
            }</td></tr>
            <tr><td><strong>Raison:</strong></td><td>${
              creditNote.reason || "N/A"
            }</td></tr>
            <tr><td><strong>Description:</strong></td><td>${
              creditNote.description || "N/A"
            }</td></tr>
            <tr><td><strong>Méthode de paiement:</strong></td><td>${
              creditNote.paymentMethod || "N/A"
            }</td></tr>
            <tr><td><strong>Date de création:</strong></td><td>${new Date(
              creditNote.createdAt
            ).toLocaleDateString("fr-FR")}</td></tr>
            <tr><td><strong>Total HT:</strong></td><td>${parseFloat(
              creditNote.totalAmountHT || 0
            ).toFixed(2)} €</td></tr>
            <tr><td><strong>Total TTC:</strong></td><td>${parseFloat(
              creditNote.totalAmountTTC || 0
            ).toFixed(2)} €</td></tr>
            ${
              creditNote.notes
                ? `<tr><td><strong>Notes:</strong></td><td>${creditNote.notes}</td></tr>`
                : ""
            }
          </table>
        </div>

        <div class="credit-note-items">
          <h3>Articles concernés</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire HT</th>
                <th>Prix unitaire TTC</th>
                <th>Total HT</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${creditNoteItemsHTML}
            </tbody>
          </table>
        </div>

        <hr class="credit-note-separator">
      </div>
    `;
  }
}
