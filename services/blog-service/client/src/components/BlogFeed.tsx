import BlogPost from './BlogPost';

interface BlogFeedProps {
  className?: string;
}

export default function BlogFeed({ className = '' }: BlogFeedProps) {
  // todo: remove mock functionality - demo posts data
  const mockPosts = [
    {
      id: '1',
      author: 'Алексей Иванов',
      username: 'alexey_dev',
      avatar: '/assets/avatar1.jpg',
      content: 'В этой статье мы разберем основные принципы создания современных пользовательских интерфейсов. Рассмотрим популярные библиотеки и инструменты для повышения эффективности работы программистов.',
      timestamp: '2 часа назад',
      likes: 42,
      comments: 12,
      reposts: 5,
      tags: ['React', 'UI/UX', 'Frontend']
    },
    {
      id: '2',
      author: 'Мария Петрова',
      username: 'maria_tech',
      avatar: '/assets/avatar2.jpg',
      content: 'Искусственный интеллект в 2025: новые возможности. Обзор последних достижений в области ИИ и их влияние на различные сферы жизни. Рассматриваем практические применения машинного обучения...',
      timestamp: '4 часа назад',
      likes: 87,
      comments: 23,
      reposts: 15,
      tags: ['ИИ', 'ML', 'Технологии']
    },
    {
      id: '3',
      author: 'Дмитрий Козлов',
      username: 'dmitry_pm',
      avatar: '/assets/avatar3.jpg',
      content: 'Секреты продуктивности разработчика. Долгое проверенные методами и инструментами для повышения эффективности работы программиста. От организации рабочего места до автоматизации задач...',
      timestamp: '6 часов назад',
      likes: 156,
      comments: 34,
      reposts: 28,
      tags: ['Продуктивность', 'Карьера', 'Советы']
    },
    {
      id: '4',
      author: 'Елена Смирнова',
      username: 'elena_mobile',
      avatar: '/assets/avatar4.jpg',
      content: 'Мобильная разработка: тренды 2025. Анализируем текущие тенденции в мобильной разработке, новые фреймворки и подходы к созданию кроссплатформенных приложений.',
      timestamp: '8 часов назад',
      likes: 73,
      comments: 18,
      reposts: 9,
      tags: ['Mobile', 'React Native', 'Flutter']
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {mockPosts.map(post => (
        <BlogPost key={post.id} {...post} />
      ))}
    </div>
  );
}