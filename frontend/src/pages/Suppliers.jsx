import ContactDirectory from "../components/ContactDirectory.jsx";

export default function Suppliers() {
  return (
    <ContactDirectory
      endpoint="/suppliers"
      title="Supplier Directory"
      subtitle="Manage supplier records"
      manageRoles={["Purchase"]}
      addLabel="Add Supplier"
    />
  );
}
