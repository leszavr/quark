"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  readonly children: string;
}

// Markdown component definitions (outside render to prevent re-creation)
const H1 = ({ children }: { readonly children?: React.ReactNode }) => (
  <h1 className="text-4xl font-bold mb-6 mt-8 font-space-grotesk text-cyan-400 dark:text-cyan-300">{children}</h1>
);

const H2 = ({ children }: { readonly children?: React.ReactNode }) => (
  <h2 className="text-3xl font-bold mb-4 mt-8 font-space-grotesk text-gray-100 dark:text-gray-800">{children}</h2>
);

const H3 = ({ children }: { readonly children?: React.ReactNode }) => (
  <h3 className="text-2xl font-bold mb-3 mt-6 font-space-grotesk text-gray-200 dark:text-gray-700">{children}</h3>
);

const H4 = ({ children }: { readonly children?: React.ReactNode }) => (
  <h4 className="text-xl font-bold mb-3 mt-4 font-space-grotesk text-gray-300 dark:text-gray-600">{children}</h4>
);

const Paragraph = ({ children }: { readonly children?: React.ReactNode }) => (
  <p className="mb-4 leading-relaxed text-gray-300 dark:text-gray-700">{children}</p>
);

const Pre = ({ children }: { readonly children?: React.ReactNode }) => (
  <pre className="bg-gray-900 dark:bg-gray-50 p-4 rounded-xl mb-4 overflow-auto border border-gray-700 dark:border-gray-200 font-mono text-sm">{children}</pre>
);

const Code = ({ children, className }: { readonly children?: React.ReactNode; readonly className?: string }) => {
  if (className) {
    return <code className={className}>{children}</code>;
  }
  return (
    <code className="px-2 py-1 bg-gray-700 dark:bg-gray-100 text-gray-100 dark:text-gray-800 rounded font-mono text-sm">{children}</code>
  );
};

const Link = ({ href, children }: { readonly href?: string; readonly children?: React.ReactNode }) => (
  <a href={href} className="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>
);

const UnorderedList = ({ children }: { readonly children?: React.ReactNode }) => (
  <ul className="list-disc mb-4 pl-6">{children}</ul>
);

const OrderedList = ({ children }: { readonly children?: React.ReactNode }) => (
  <ol className="list-decimal mb-4 pl-6">{children}</ol>
);

const ListItem = ({ children }: { readonly children?: React.ReactNode }) => (
  <li className="text-gray-300 dark:text-gray-700 leading-relaxed">{children}</li>
);

const Blockquote = ({ children }: { readonly children?: React.ReactNode }) => (
  <blockquote className="pl-4 py-2 mb-4 border-l-4 border-cyan-400 bg-gray-800 dark:bg-gray-50 rounded-r-lg italic">{children}</blockquote>
);

const Strong = ({ children }: { readonly children?: React.ReactNode }) => (
  <strong className="font-bold text-gray-100 dark:text-gray-900">{children}</strong>
);

const Emphasis = ({ children }: { readonly children?: React.ReactNode }) => (
  <em className="italic text-gray-200 dark:text-gray-700">{children}</em>
);

const HorizontalRule = () => (
  <hr className="border-none h-px bg-gray-600 dark:bg-gray-300 my-8" />
);

const markdownComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: Paragraph,
  pre: Pre,
  code: Code,
  a: Link,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  blockquote: Blockquote,
  strong: Strong,
  em: Emphasis,
  hr: HorizontalRule,
};

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={markdownComponents}
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