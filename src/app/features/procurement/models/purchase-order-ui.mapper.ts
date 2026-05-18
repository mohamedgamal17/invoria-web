import type { CreatePurchaseOrderLineItemRequest } from './create-purchase-order.request';
import type { PurchaseOrderItem } from './purchase-order.entity';
import type { UiPurchaseOrderItem } from './purchase-order-ui.model';

export function purchaseOrderItemToUiItem(line: PurchaseOrderItem): UiPurchaseOrderItem {
  return {
    productId: line.productId,
    productName: line.productName?.trim() ? line.productName.trim() : line.productId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    supplierProductCode: line.supplierProductCode ?? null
  };
}

export function draftItemsToPurchaseOrderLineItems(
  items: UiPurchaseOrderItem[]
): CreatePurchaseOrderLineItemRequest[] {
  return items.map((item) => {
    const code = item.supplierProductCode?.trim();
    return {
      ProductId: item.productId,
      Quantity: item.quantity,
      UnitPrice: item.unitPrice,
      SupplierProductCode: code ? code : null
    };
  });
}
