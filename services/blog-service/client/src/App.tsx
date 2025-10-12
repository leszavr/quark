import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BlogFeed from "@/components/BlogFeed";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <header className="border-b p-4">
            <h1 className="text-2xl font-bold">Blog Service API</h1>
            <p className="text-muted-foreground">Internal blog service for Quark platform</p>
          </header>
          <main className="container mx-auto p-4">
            <BlogFeed />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
