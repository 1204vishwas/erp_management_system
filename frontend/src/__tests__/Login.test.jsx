import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { describe, it, expect } from "vitest";
import { store } from "../app/store.js";
import theme from "../theme.js";
import Login from "../pages/Login.jsx";

// Smoke test: the login page renders its heading and Sign In button.
describe("Login page", () => {
  it("renders the sign-in form", () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByText(/ERP Management System/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
