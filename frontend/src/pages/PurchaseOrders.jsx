import OrderManager from "../components/OrderManager.jsx";

export default function PurchaseOrders() {
  return (
    <OrderManager
      endpoint="/purchase-orders"
      partyEndpoint="/suppliers"
      partyField="supplier"
      partyLabel="Supplier"
      statuses={["Pending", "Ordered", "Received", "Cancelled"]}
      manageRole="Purchase"
      title="Purchase Orders"
      subtitle="Create and track supplier purchase orders"
      addLabel="New Purchase Order"
      trackPayment
    />
  );
}
