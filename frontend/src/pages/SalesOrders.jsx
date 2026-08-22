import OrderManager from "../components/OrderManager.jsx";

export default function SalesOrders() {
  return (
    <OrderManager
      endpoint="/sales-orders"
      partyEndpoint="/customers"
      partyField="customer"
      partyLabel="Customer"
      statuses={["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"]}
      manageRole="Sales"
      title="Sales Orders"
      subtitle="Create and track customer sales orders"
      addLabel="New Sales Order"
    />
  );
}
