import { Provider } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import { store } from "./store/store";
import { DateInputs } from "./components/DateInputs";
import { DataManager } from "./components/DataManager";
import { AbsenceForm } from "./components/AbsenceForm";
import { CitizenshipCard } from "./components/CitizenshipCard";
import { PRStatusCard } from "./components/PRStatusCard";
import { ResidencyCard } from "./components/ResidencyCard";
import { AbsencesList } from "./components/AbsencesList";
import { ThemeToggle } from "./components/ThemeToggle";
import { ErrorFallback } from "./components/ErrorFallback";
import { Separator } from "@/components/ui/separator";

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-start justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Canadian PR Planner
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your Permanent Residency status, Citizenship eligibility,
              and Residency requirements
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <CitizenshipCard />
          <PRStatusCard />
          <ResidencyCard />
        </div>

        <Separator className="my-8" />

        <div className="flex flex-wrap gap-6">
          <DateInputs />
          <DataManager />
          <AbsenceForm />
        </div>

        <Separator className="my-8" />

        <AbsencesList />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <AppContent />
        <Toaster richColors closeButton position="bottom-right" />
      </Provider>
    </ErrorBoundary>
  );
}

export { App };
