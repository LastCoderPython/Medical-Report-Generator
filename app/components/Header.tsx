import { FileText, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Medical Report Generator</h1>
              <p className="text-sm text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI-Powered Clinical Documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
