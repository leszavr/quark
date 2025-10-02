import Footer from '../Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function FooterExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Основной контент страницы</h2>
            <p className="text-muted-foreground">
              Здесь обычно располагается основной контент сайта
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}