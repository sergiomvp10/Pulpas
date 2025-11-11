# Modelo de Dominio - Sistema de Gestión de Pulpas

## Contexto del Negocio

Negocio de producción y venta de pulpas de fruta **sin conservantes**, lo que hace crítico el control de caducidad y la trazabilidad por lotes. Vida útil: **7-8 meses** desde la producción.

## Entidades del Dominio

### User (Usuario)
Usuarios del sistema con diferentes roles.

**Atributos:**
- id: UUID
- name: string
- email: string (único)
- phone: string (opcional)
- role: enum [admin, almacen, calidad, ventas]
- password_hash: string
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp

**Reglas:**
- Email único en el sistema
- Contraseña hasheada con bcrypt
- Admin tiene acceso completo
- Roles específicos tienen permisos limitados

### Customer (Cliente)
Clientes que compran las pulpas.

**Atributos:**
- id: UUID
- name: string
- phone: string
- email: string (opcional)
- notes: text (opcional)
- created_at: timestamp
- updated_at: timestamp

### Category (Categoría)
Categorías de productos con márgenes por defecto.

**Atributos:**
- id: UUID
- name: string (ej: "Tradicional", "Exóticos")
- default_margin: decimal (ej: 0.70 para 70%)
- description: text (opcional)
- active: boolean

**Categorías iniciales:**
- **Tradicional**: Mango, Maracuyá, Mora, Lulo, Piña, Guayaba, Fresa (margen 70%)
- **Exóticos**: Maracumango, Limonadas especiales, Frutos rojos, Tropical (margen configurable)

### ProductBase (Producto Base)
Producto sin especificar gramaje (ej: "Mango", "Mora").

**Atributos:**
- id: UUID
- name: string (ej: "Mango")
- category_id: UUID → Category
- photo_url: string (opcional)
- sku_root: string (ej: "MANGO")
- description: text (opcional)
- active: boolean
- created_at: timestamp
- updated_at: timestamp

### ProductVariant (Variante de Producto)
Producto con gramaje específico (ej: "Mango 250g").

**Atributos:**
- id: UUID
- product_base_id: UUID → ProductBase
- gram_weight_g: integer (125, 250, 500, 1000)
- sku: string (único, ej: "MANGO-250")
- barcode: string (opcional)
- photo_url: string (opcional)
- margin_override: decimal (opcional, sobrescribe margen de categoría)
- manual_price_cents: integer (opcional, precio manual en centavos COP)
- active: boolean
- created_at: timestamp
- updated_at: timestamp

**Constraint:**
- UNIQUE(product_base_id, gram_weight_g)

**Reglas de precio:**
- Si existe `manual_price_cents`, usar ese precio
- Si no, calcular: `suggested_price = cost_per_unit × (1 + margin_effective)`
- `margin_effective` se resuelve: variant.margin_override → category.default_margin → settings.default_margin

### Lot (Lote)
Lote de producción con trazabilidad completa.

**Atributos:**
- id: UUID
- code: string (único, ej: "MORA-2025-02-12-L1")
- product_variant_id: UUID → ProductVariant
- production_date: date
- expiry_date: date (auto: production_date + 7 meses)
- units_initial: integer (cantidad producida)
- units_on_hand: integer (cantidad disponible)
- cost_per_unit_cents: integer (costo unitario en centavos COP)
- status: enum [approved, hold, rejected]
- location_id: UUID → InventoryLocation (opcional)
- notes: text (opcional)
- created_by: UUID → User
- created_at: timestamp
- updated_at: timestamp

**Reglas:**
- Código único generado automáticamente: `{SABOR}-{YYYY-MM-DD}-L{n}`
- Fecha de caducidad = production_date + 7 meses (configurable en Settings)
- `units_on_hand` se actualiza con cada movimiento de inventario
- No se puede vender de lotes con status != 'approved'
- FEFO: al vender, priorizar lotes con expiry_date más cercana

### InventoryLocation (Ubicación de Inventario)
Ubicaciones físicas de almacenamiento.

**Atributos:**
- id: UUID
- name: string (ej: "Bodega Principal", "Refrigerador 1")
- code: string (único)
- description: text (opcional)
- active: boolean

### InventoryMovement (Movimiento de Inventario)
Registro de todos los movimientos de stock.

**Atributos:**
- id: UUID
- lot_id: UUID → Lot
- type: enum [production_in, purchase_in, sale_out, adjustment_in, adjustment_out, expiration_out]
- quantity_units: integer (positivo para entradas, negativo para salidas)
- reference_type: enum [sale, purchase, adjustment, system]
- reference_id: UUID (opcional, id de Sale, Purchase, etc.)
- notes: text (opcional)
- created_by: UUID → User
- created_at: timestamp

**Reglas:**
- Cada venta genera movimientos de tipo `sale_out`
- Cada producción genera movimiento de tipo `production_in`
- Ajustes manuales usan `adjustment_in` o `adjustment_out`
- Productos vencidos se registran con `expiration_out`

### Sale (Venta)
Registro de ventas realizadas.

**Atributos:**
- id: UUID
- sale_number: string (único, auto-generado)
- occurred_at: timestamp
- customer_id: UUID → Customer (opcional)
- channel: enum [manual, whatsapp]
- payment_method: enum [cash, nequi, bancolombia, credit]
- status: enum [completed, void]
- total_amount_cents: integer (total en centavos COP)
- currency: string (default: "COP")
- due_date: date (opcional, para crédito)
- paid_at: timestamp (opcional)
- notes: text (opcional)
- created_by: UUID → User
- created_at: timestamp
- updated_at: timestamp

### SaleLine (Línea de Venta)
Detalle de productos en una venta.

**Atributos:**
- id: UUID
- sale_id: UUID → Sale
- product_variant_id: UUID → ProductVariant
- quantity_units: integer
- unit_price_cents: integer (precio al que se vendió)
- discount_cents: integer (default: 0)
- subtotal_cents: integer (calculado)

**Reglas:**
- `subtotal_cents = (unit_price_cents × quantity_units) - discount_cents`

### SaleLineLot (Asignación de Lote a Venta)
Relación entre línea de venta y lotes (para FEFO y COGS exacto).

**Atributos:**
- id: UUID
- sale_line_id: UUID → SaleLine
- lot_id: UUID → Lot
- quantity_units: integer (cuántas unidades de este lote)
- cost_unit_cents_at_sale: integer (costo del lote al momento de la venta)

**Reglas:**
- Una SaleLine puede tener múltiples SaleLineLot si se asignan varios lotes
- Suma de quantity_units debe igualar SaleLine.quantity_units
- Permite calcular ganancia exacta: `profit = unit_price - cost_unit_cents_at_sale`

### QCCheck (Control de Calidad)
Controles de calidad realizados a los lotes.

**Atributos:**
- id: UUID
- lot_id: UUID → Lot
- brix: decimal (opcional, grados Brix)
- ph: decimal (opcional)
- temperature: decimal (opcional, °C)
- status: enum [approved, observed, rejected]
- notes: text (opcional)
- checked_by: UUID → User
- checked_at: timestamp

**Reglas:**
- Un lote puede tener múltiples checks
- Status del último check determina si el lote es vendible

### Settings (Configuración)
Configuración global del sistema (singleton o key-value).

**Atributos:**
- id: UUID
- key: string (único)
- value: string
- description: text (opcional)

**Configuraciones clave:**
- `default_shelf_life_months`: 7
- `default_margin`: 0.70
- `timezone`: "America/Bogota"
- `currency`: "COP"
- `whatsapp_provider`: "twilio"
- `whatsapp_recipients`: "+573001234567,+573007654321"
- `alert_days_before_expiry`: 30
- `block_sales_if_expired`: true/false

### NotificationLog (Registro de Notificaciones)
Log de alertas enviadas para evitar duplicados.

**Atributos:**
- id: UUID
- type: enum [pre_expiry, expired, low_stock]
- lot_id: UUID → Lot (opcional)
- scheduled_for: date
- sent_at: timestamp (opcional)
- recipient: string (número de teléfono)
- channel: enum [whatsapp, email, sms]
- status: enum [queued, sent, failed]
- error: text (opcional)
- created_at: timestamp

**Reglas:**
- Antes de enviar alerta, verificar que no exista registro con mismo type + lot_id + scheduled_for
- Permite reintento si status = 'failed'

## Flujos de Negocio

### 1. Producción de Lote

1. Usuario crea nuevo lote
2. Selecciona ProductVariant (sabor + gramaje)
3. Ingresa: production_date, units_initial, cost_per_unit_cents
4. Sistema calcula: expiry_date = production_date + 7 meses
5. Sistema genera code único: `{SABOR}-{YYYY-MM-DD}-L{n}`
6. Sistema crea Lot con status = 'approved'
7. Sistema crea InventoryMovement (type: production_in)
8. Opcional: realizar QCCheck

### 2. Registro de Venta (con FEFO)

1. Usuario selecciona ProductVariant y quantity
2. Sistema busca lotes disponibles:
   - status = 'approved'
   - units_on_hand > 0
   - expiry_date >= hoy (o con advertencia)
   - Ordenados por expiry_date ASC (FEFO)
3. Sistema asigna unidades desde lotes (puede usar múltiples lotes)
4. Usuario selecciona customer, payment_method
5. Sistema calcula precio:
   - Si variant.manual_price_cents existe, usar ese
   - Si no, calcular con margen
6. Sistema crea Sale + SaleLine + SaleLineLot
7. Sistema crea InventoryMovement (type: sale_out) por cada lote
8. Sistema actualiza Lot.units_on_hand
9. **Transacción atómica** para evitar inconsistencias

### 3. Alertas de Caducidad (Cron Diario)

1. Cron se ejecuta diariamente (ej: 8:00 AM)
2. Busca lotes con:
   - `expiry_date = hoy + 30 días` (pre-expiry)
   - `expiry_date < hoy` (expired)
3. Para cada lote, verifica NotificationLog:
   - Si ya existe registro con sent_at != null, skip
4. Crea NotificationLog con status = 'queued'
5. Envía mensaje por WhatsApp
6. Actualiza NotificationLog: sent_at, status = 'sent'
7. Si falla, status = 'failed' + error

### 4. Cálculo de Precio

```typescript
function calculatePrice(variant: ProductVariant, lot: Lot): number {
  // Si hay precio manual, usar ese
  if (variant.manual_price_cents) {
    return variant.manual_price_cents;
  }
  
  // Si no, calcular con margen
  const margin = variant.margin_override 
    ?? variant.productBase.category.default_margin 
    ?? settings.default_margin;
  
  const suggestedPriceCents = lot.cost_per_unit_cents * (1 + margin);
  
  // Opcional: redondear a múltiplo de 100 COP
  return Math.round(suggestedPriceCents / 100) * 100;
}
```

### 5. Cálculo de Ganancia

```typescript
function calculateProfit(sale: Sale): number {
  let totalProfit = 0;
  
  for (const line of sale.saleLines) {
    for (const allocation of line.saleLineLots) {
      const revenue = line.unit_price_cents * allocation.quantity_units;
      const cost = allocation.cost_unit_cents_at_sale * allocation.quantity_units;
      totalProfit += (revenue - cost);
    }
  }
  
  return totalProfit;
}
```

## Reglas de Negocio Críticas

1. **FEFO estricto**: Siempre vender desde lotes que vencen primero
2. **Sin conservantes**: Control de caducidad es crítico
3. **Transaccionalidad**: Ventas y movimientos de inventario deben ser atómicos
4. **Trazabilidad**: Cada unidad vendida debe rastrearse a su lote de origen
5. **Alertas oportunas**: 30 días antes del vencimiento + alertas diarias de vencidos
6. **Precio flexible**: Sistema sugiere precio pero permite override manual
7. **Auditoría**: Todos los movimientos registran usuario y timestamp

## Índices Recomendados

- `Lot.expiry_date` (para FEFO y alertas)
- `Lot.product_variant_id` (para búsquedas de stock)
- `Lot.code` (único)
- `InventoryMovement.lot_id` (para historial)
- `Sale.occurred_at` (para reportes)
- `NotificationLog(type, lot_id, scheduled_for)` (para evitar duplicados)

## Consideraciones Técnicas

- **Moneda**: Almacenar en centavos (integer) para evitar errores de redondeo
- **Timezone**: UTC en BD, convertir a America/Bogota en UI
- **Concurrencia**: Usar locks o transacciones optimistas en ventas
- **Fotos**: Almacenar URLs, no archivos en BD
- **WhatsApp**: Interfaz de proveedor para cambiar entre Twilio/Meta fácilmente
