import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { CampaignListPage } from "./pages/CampaignListPage";
import { CreateCampaignPage } from "./pages/CreateCampaignPage";
import { CampaignDetailsPage } from "./pages/CampaignDetailsPage";
import { EditCampaignPage } from "./pages/EditCampaignPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<CampaignListPage />} />
            <Route path="/campaigns/new" element={<CreateCampaignPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
            <Route path="/campaigns/:id/edit" element={<EditCampaignPage />} />
            <Route path="*" element={<Navigate to="/campaigns" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;