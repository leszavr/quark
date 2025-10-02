import BlogPost from '../BlogPost';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function BlogPostExample() {
  // todo: remove mock functionality - demo post data
  const mockPost = {
    id: '1',
    author: 'Алексей Иванов',
    username: 'alexey_dev',
    avatar: '/assets/avatar1.jpg',
    content: 'В этой статье мы разберем основные принципы создания современных пользовательских интерфейсов. Рассмотрим популярные библиотеки и инструменты...',
    timestamp: '2 часа назад',
    likes: 42,
    comments: 12,
    reposts: 5,
    tags: ['React', 'UI/UX', 'Frontend']
  };

  return (
    <ThemeProvider>
      <div className="p-4 bg-background min-h-screen">
        <BlogPost {...mockPost} />
      </div>
    </ThemeProvider>
  );
}