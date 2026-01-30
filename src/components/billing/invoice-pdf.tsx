'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #22c55e',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 5,
  },
  companySlogan: {
    fontSize: 10,
    color: '#666',
  },
  companyLogo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    textAlign: 'right',
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #f3f4f6',
  },
  tableCell: {
    color: '#4b5563',
  },
  colProduct: {
    flex: 3,
  },
  colQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colSubtotal: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '2px solid #e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    color: '#666',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    color: '#333',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  paymentBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
  },
});

interface SaleLine {
  id: string;
  quantityUnits: number;
  unitPriceCents: number;
  subtotalCents: number;
  productVariant: {
    gramWeightG: number;
    sku: string;
    productBase: {
      name: string;
      category: {
        name: string;
      };
    };
  };
}

interface Sale {
  id: string;
  saleNumber: string;
  occurredAt: string;
  paymentMethod: string;
  totalAmountCents: number;
  currency: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
  } | null;
  seller: {
    name: string;
    phone: string;
    email: string;
  } | null;
  createdBy: {
    name: string;
  };
  saleLines: SaleLine[];
}

interface InvoicePDFProps {
  sale: Sale;
  logoUrl?: string;
  businessName?: string;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentMethodLabel(method: string): string {
  const methods: Record<string, string> = {
    CASH: 'Efectivo',
    NEQUI: 'Nequi',
    BANCOLOMBIA: 'Bancolombia',
    CREDIT: 'Crédito',
  };
  return methods[method] || method;
}

export function InvoicePDF({ sale, logoUrl, businessName = 'FrutyLab' }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              {logoUrl ? (
                <Image src={logoUrl} style={styles.companyLogo} alt="Logo" />
              ) : (
                <Text style={styles.companyName}>{businessName}</Text>
              )}
              <Text style={styles.companySlogan}>Pulpa 100% Fruta</Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>FACTURA</Text>
              <Text style={styles.invoiceNumber}>{sale.saleNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Venta</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{formatDate(sale.occurredAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Método de Pago:</Text>
            <Text style={styles.value}>{getPaymentMethodLabel(sale.paymentMethod)}</Text>
          </View>
          {sale.seller && (
            <View style={styles.row}>
              <Text style={styles.label}>Vendedor:</Text>
              <Text style={styles.value}>{sale.seller.name}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Registrado por:</Text>
            <Text style={styles.value}>{sale.createdBy.name}</Text>
          </View>
        </View>

        {sale.customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del Cliente</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{sale.customer.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{sale.customer.phone}</Text>
            </View>
            {sale.customer.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{sale.customer.email}</Text>
              </View>
            )}
            {sale.customer.city && (
              <View style={styles.row}>
                <Text style={styles.label}>Ciudad:</Text>
                <Text style={styles.value}>{sale.customer.city}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Productos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>Producto</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Cant.</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio Unit.</Text>
              <Text style={[styles.tableHeaderCell, styles.colSubtotal]}>Subtotal</Text>
            </View>
            {sale.saleLines.map((line) => (
              <View key={line.id} style={styles.tableRow}>
                <View style={styles.colProduct}>
                  <Text style={styles.tableCell}>
                    {line.productVariant.productBase.name} - {line.productVariant.gramWeightG}g
                  </Text>
                  <Text style={[styles.tableCell, { fontSize: 8, color: '#9ca3af' }]}>
                    SKU: {line.productVariant.sku}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.colQuantity]}>{line.quantityUnits}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>
                  {formatCurrency(line.unitPriceCents)}
                </Text>
                <Text style={[styles.tableCell, styles.colSubtotal]}>
                  {formatCurrency(line.subtotalCents)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(sale.totalAmountCents)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Gracias por su compra - {businessName}</Text>
        </View>
      </Page>
    </Document>
  );
}
