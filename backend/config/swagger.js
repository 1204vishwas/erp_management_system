import swaggerJSDoc from "swagger-jsdoc";

/**
 * Swagger / OpenAPI configuration.
 * Served at /api-docs via swagger-ui-express (see server.js).
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ERP Management System API",
      version: "1.0.0",
      description:
        "REST API for the ERP Management System (MERN Stack). Modules: Users, Products, Customers, Suppliers, Sales Orders, Purchase Orders, GRN, Invoices.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Register, login, profile" },
      { name: "Users", description: "User management (Admin)" },
      { name: "Products", description: "Product CRUD" },
      { name: "Customers", description: "Customer directory" },
      { name: "Suppliers", description: "Supplier directory" },
      { name: "Sales Orders", description: "Sales order flow" },
      { name: "Purchase Orders", description: "Purchase order flow" },
      { name: "GRN", description: "Goods Receipt Notes" },
      { name: "Invoices", description: "Invoice generation" },
      { name: "Dashboard", description: "Metrics & charts data" },
      { name: "Reports", description: "Consolidated report & balance sheet" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
