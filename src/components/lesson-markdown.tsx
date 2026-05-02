"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonMarkdownProps {
  content: string;
}

/**
 * Rendu markdown d'une leçon avec la charte Eleo.
 * Styling manuel via les components de react-markdown (sans @tailwindcss/typography).
 */
export function LessonMarkdown({ content }: LessonMarkdownProps) {
  return (
    <div className="lesson-markdown text-eleo-gray-700 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-eleo-gray-800 mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-eleo-gray-800 mt-6 mb-3 border-b border-eleo-gray-200 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-eleo-gray-800 mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-eleo-gray-800">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-eleo-50 text-eleo-600 px-1.5 py-0.5 rounded text-sm font-mono border border-eleo-100">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-eleo-gray-900 text-white p-4 rounded-lg my-3 overflow-x-auto text-sm">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-eleo-500 hover:text-eleo-600 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-eleo-500 pl-4 py-1 my-3 italic text-eleo-gray-600 bg-eleo-50/50">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-eleo-gray-200">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-eleo-50 text-eleo-gray-800 font-semibold px-3 py-2 text-left border-b border-eleo-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-eleo-gray-100">{children}</td>
          ),
          hr: () => <hr className="my-6 border-eleo-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
