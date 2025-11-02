"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Заголовки
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 mt-8 font-space-grotesk text-cyan-400 dark:text-cyan-300">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mb-4 mt-8 font-space-grotesk text-gray-100 dark:text-gray-800">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold mb-3 mt-6 font-space-grotesk text-gray-200 dark:text-gray-700">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-bold mb-3 mt-4 font-space-grotesk text-gray-300 dark:text-gray-600">{children}</h4>
          ),
          
          // Параграфы
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-300 dark:text-gray-700">{children}</p>
          ),
          
          // Блоки кода
          pre: ({ children }) => (
            <pre className="bg-gray-900 dark:bg-gray-50 p-4 rounded-xl mb-4 overflow-auto border border-gray-700 dark:border-gray-200 font-mono text-sm">{children}</pre>
          ),
          
          // Инлайн код
          code: ({ children, className }) => {
            if (className) {
              return <code className={className}>{children}</code>;
            }
            return (
              <code className="px-2 py-1 bg-gray-700 dark:bg-gray-100 text-gray-100 dark:text-gray-800 rounded font-mono text-sm">{children}</code>
            );
          },
          
          // Ссылки
          a: ({ href, children }) => (
            <a href={href} className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          
          // Списки
          ul: ({ children }) => (
            <ul className="list-disc mb-4 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal mb-4 pl-6">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300 dark:text-gray-700 leading-relaxed">{children}</li>
          ),
          
          // Цитаты
          blockquote: ({ children }) => (
            <blockquote className="pl-4 py-2 mb-4 border-l-4 border-cyan-400 bg-gray-800 dark:bg-gray-50 rounded-r-lg italic">{children}</blockquote>
          ),
          
          // Жирный текст
          strong: ({ children }) => (
            <strong className="font-bold text-gray-100 dark:text-gray-900">{children}</strong>
          ),
          
          // Курсив
          em: ({ children }) => (
            <em className="italic text-gray-200 dark:text-gray-700">{children}</em>
          ),
          
          // Горизонтальная линия
          hr: () => (
            <hr className="border-none h-px bg-gray-600 dark:bg-gray-300 my-8" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
      <style>{`
        .markdown-content .hljs {
          background: #1a202c !important;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}