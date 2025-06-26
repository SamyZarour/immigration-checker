import { RecoilRoot } from "recoil";
import { DateInputs } from "./components/DateInputs";
import { DataManager } from "./components/DataManager";
import { AbsenceForm } from "./components/AbsenceForm";
import { CitizenshipCard } from "./components/CitizenshipCard";
import { PRStatusCard } from "./components/PRStatusCard";
import { ResidencyCard } from "./components/ResidencyCard";
import { AbsencesList } from "./components/AbsencesList";
import { CalculationEngine } from "./components/CalculationEngine";
import "./App.css";

function AppContent() {
  return (
    <div className="container">
      <div className="header">
        <h1>🇨🇦 Canadian PR Planner</h1>
        <p>
          Track your Permanent Residency status, Citizenship eligibility, and
          Residency requirements
        </p>
      </div>

      <div className="main-content">
        <div className="results-section">
          <CitizenshipCard />
          <PRStatusCard />
          <ResidencyCard />
        </div>
        <div className="input-section">
          <DateInputs />
          <DataManager />
          <AbsenceForm />
        </div>

        <div className="results-section">
          <AbsencesList />
        </div>
      </div>

      <CalculationEngine />
    </div>
  );
}

function App() {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
}

export default App;
