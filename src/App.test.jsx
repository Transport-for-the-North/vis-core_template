import { vi } from 'vitest';

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

vi.mock("../src/services", () => ({
  api: {
    metadataService: {
      getSwaggerFile: vi.fn(() => Promise.resolve({ swagger: "mockSchema" })),
    },
  },
}));

vi.mock("maplibre-gl", () => ({
  Map: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    addLayer: vi.fn(),
    setStyle: vi.fn(),
    flyTo: vi.fn(),
  })),
}));

vi.mock("@transport-for-the-north/vis-core/Components", () => ({
  HomePage: () => <div>HomePage</div>,
  Navbar: () => <div>Navbar</div>,
  Login: () => <div>Login</div>,
  Unauthorized: () => <div>Unauthorized</div>,
  TermsOfUse: () => <div>TermsOfUse</div>,
  PageSwitch: () => <div>PageSwitch</div>,
  NotFound: () => <div>NotFound</div>,
}));

vi.mock("@transport-for-the-north/vis-core/hocs", () => ({
  withRoleValidation: vi.fn((Component) => Component),
  withWarning: vi.fn((Component) => Component),
  withTermsOfUse: vi.fn((Component) => Component),
  composeHOCs: vi.fn(
    (...hocs) =>
      (Component) =>
        Component
  ),
}));

vi.mock("@transport-for-the-north/vis-core/contexts", () => ({
  AppContext: {
    Provider: ({ children }) => children,
  },
  AuthProvider: ({ children }) => children,
}));

vi.mock("@transport-for-the-north/vis-core/layouts", () => ({
  Dashboard: ({ children }) => <div>{children}</div>,
}));

// Mock dynamic imports for config files
vi.mock("./configs/bsip/appConfig.js", () => ({
  appConfig: {
    title: "Test App",
    introduction: "Test introduction",
    background: "",
    methodology: "",
    legalText: "Test legal text",
    contactText: "Test contact",
    contactEmail: "test@example.com",
    logoImage: "img/test-logo.png",
    backgroundImage: "img/test-bg.jpg",
    logoutButtonImage: "img/test-burger.png",
    logoutImage: "img/test-logout.png",
    appPages: [],
    authenticationRequired: true,
  },
}));

vi.mock("./configs/bsip/bands.js", () => ({
  bands: [],
}));

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { render, screen, waitFor } from "@testing-library/react";
import App from './App.jsx';
import { MemoryRouter } from "react-router-dom";

import.meta.env.VITE_APP_NAME = "bsip";

describe("App Component", () => {
  it("Renders the login page because we're not connected", async () => {
    Cookies.get.mockReturnValue(null);
    
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
  it("Renders the unauthorized page", async () => {
    render(
      <MemoryRouter initialEntries={["/unauthorized"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Unauthorized")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Renders the homePage where we're connected", async () => {
    // Override the config mock for this test to have authenticationRequired: false
    vi.doMock("./configs/bsip/appConfig.js", () => ({
      appConfig: {
        title: "TAME React Vis Template",
        introduction: "Test introduction",
        background: "",
        methodology: "",
        legalText: "Test legal text",
        contactText: "Test contact",
        contactEmail: "test@example.com",
        logoImage: "img/test-logo.png",
        backgroundImage: "img/test-bg.jpg",
        logoutButtonImage: "img/test-burger.png",
        logoutImage: "img/test-logout.png",
        appPages: [
          {
            id: "page1",
            name: "Test Page 1",
            pageName: "page1",
            url: "/page1",
          }
        ],
        authenticationRequired: false,
      },
    }));

    Cookies.get.mockReturnValue("fake-jwt-token");
    jwtDecode.mockReturnValue({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["dev_user", "all_user"]
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText("HomePage")).toBeInTheDocument();
  });
});
