import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Midnight";
import AWS from "./pages/AWS";
import Azure from "./pages/Azure";
import GCP from "./pages/GCP";
import Resources from "./pages/Resources";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/aws" element={<AWS />} />
        <Route path="/azure" element={<Azure />} />
        <Route path="/gcp" element={<GCP />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
