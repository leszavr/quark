import BlogFeed from '../BlogFeed';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function BlogFeedExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Лента блогов</h2>
          <BlogFeed />
        </div>
      </div>
    </ThemeProvider>
  );
}