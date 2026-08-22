import ContactDirectory from "../components/ContactDirectory.jsx";

export default function Customers() {
  return (
    <ContactDirectory
      endpoint="/customers"
      title="Customer Directory"
      subtitle="Manage customer records"
      manageRoles={["Sales"]}
      addLabel="Add Customer"
    />
  );
}
