import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import "./App.css";
import { PageSwitch, HomePage, Navbar, Login, Unauthorized, TermsOfUse, NotFound } from "@transport-for-the-north/vis-core/Components";
import { Dashboard } from "@transport-for-the-north/vis-core/layouts";
import { AppContext, AuthProvider } from "@transport-for-the-north/vis-core/contexts";
import { api } from "@transport-for-the-north/vis-core/services";
import { withWarning, withRoleValidation, composeHOCs, withTermsOfUse } from "@transport-for-the-north/vis-core/hocs";
import { theme } from "./theme";

/**
 * Main application component.
 * @function App
 * @returns {JSX.Element} The rendered application component.
 */
function App() {
  const [appConfig, setAppConfig] = useState(null);

  useEffect(() => {
    /**
     * Dynamically imports the appConfig based on the VITE_APP_NAME environment variable.
     * Uses import.meta.glob to ensure Vite bundles all possible configs in production.
     * @function loadAppConfig
     * @async
     */
    const loadAppConfig = async () => {
      try {
        const appName = import.meta.env.VITE_APP_NAME;
        if (!appName) {
          throw new Error("VITE_APP_NAME environment variable is not set");
        }

        // Use import.meta.glob to pre-define all possible config imports
        // This ensures Vite knows which modules to bundle in production
        const configModules = import.meta.glob('./configs/*/appConfig.js', { eager: false });
        const bandModules = import.meta.glob('./configs/*/bands.js', { eager: false });
        
        const configPath = `./configs/${appName}/appConfig.js`;
        const bandsPath = `./configs/${appName}/bands.js`;
        
        if (!configModules[configPath]) {
          throw new Error(`Config not found for app: ${appName}`);
        }

        const configModule = await configModules[configPath]();
        const initialAppConfig = configModule.appConfig;

        let bands = null; // Ensure bands is properly initialized
        try{
          if (bandModules[bandsPath]) {
            const defaultBands = await bandModules[bandsPath]();
            bands = defaultBands.bands;
          } else {
            throw new Error("Bands module not found");
          }
        } catch (bandError) {
          console.warn(`Warning: ${appName} bands module not found. Attempting to load from appConfig...`);
          // If the bands file is missing, use loadBands from appConfig
          if (initialAppConfig.loadBands) {
            bands = await initialAppConfig.loadBands();
          } else {
            throw new Error("Bands module is missing, and appConfig.loadBands is not defined.");
          }
        }

        const apiSchema = await api.metadataService.getSwaggerFile();
        const authenticationRequired = initialAppConfig.authenticationRequired ?? true

        setAppConfig({
          ...initialAppConfig,
          apiSchema: apiSchema,
          defaultBands: bands,
          authenticationRequired: authenticationRequired
        });
      } catch (error) {
        console.error("Failed to load app configuration:", error);
      }
    };

    loadAppConfig();
  }, []);

  if (!appConfig) {
    return <div>Loading...</div>;
  }

  const isAuthRequired = appConfig.authenticationRequired ?? true;
  const HomePageWithRoleValidation = isAuthRequired ? withRoleValidation(HomePage) : HomePage;
  const NotFoundWithRoleValidation = isAuthRequired ? withRoleValidation(NotFound) : NotFound;

  return (
    <div className="App">
      <AuthProvider>
        <ThemeProvider theme={theme}>
        <AppContext.Provider value={appConfig}>
          <Navbar />
          <Dashboard>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<HomePageWithRoleValidation />} />
              {appConfig.appPages.map((page) => {
                const PageComponent = isAuthRequired
                  ? withRoleValidation(PageSwitch)
                  : PageSwitch;
                const WrappedPageComponent =
                  composeHOCs(withWarning, withTermsOfUse)(PageComponent);
                return (
                  <Route
                    key={page.pageName}
                    path={page.url}
                    element={<WrappedPageComponent pageConfig={page} />}
                  />
                );
              })}
              {/* Catch-all for undefined routes */}
              <Route path="*" element={<NotFoundWithRoleValidation />} />
            </Routes>
          </Dashboard>
        </AppContext.Provider>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
