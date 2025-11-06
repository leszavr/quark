"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Reply, MoreHorizontal, Send } from "lucide-react";
import Image from "next/image";

export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  date: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface BlogCommentsProps {
  readonly postId: string;
  readonly comments?: Comment[];
  readonly onAddComment?: (content: string, parentId?: string) => void;
  readonly onEditComment?: (commentId: string, content: string) => void;
  readonly onDeleteComment?: (commentId: string) => void;
  readonly onLikeComment?: (commentId: string) => void;
}

const mockComments: Comment[] = [
  {
    id: "1",
    content:
      "Отличная статья! Особенно интересно про AI-ассистенты для кода. Уже пробовал GitHub Copilot и действительно впечатляет.",
    author: { name: "Дмитрий Иванов", avatar: "", username: "@dmitry_dev" },
    date: "2 часа назад",
    likes: 5,
    isLiked: true,
    replies: [
      {
        id: "1-1",
        content:
          "Согласен! А что думаешь про Cursor? Тоже недавно попробовал, кажется еще более умным.",
        author: { name: "Анна Смирнова", avatar: "", username: "@anna_dev" },
        date: "1 час назад",
        likes: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: "2",
    content:
      "Хорошая подборка трендов. Но я бы еще добавил упоминание WebAssembly - тоже очень перспективная технология для веба.",
    author: { name: "Сергей Петров", avatar: "", username: "@sergey_web" },
    date: "4 часа назад",
    likes: 3,
    isLiked: false,
  },
  {
    id: "3",
    content:
      "Спасибо за статью! Можешь поподробнее рассказать про React Server Components? Пока не до конца понятно, как они работают.",
    author: { name: "Мария Козлова", avatar: "", username: "@maria_react" },
    date: "6 часов назад",
    likes: 1,
    isLiked: false,
  },
];

export function BlogComments({
  postId: _postId,
  comments = mockComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
}: BlogCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment?.(newComment, replyTo || undefined);
    setNewComment("");
    setReplyTo(null);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingComment) return;
    onEditComment?.(editingComment, editingContent);
    setEditingComment(null);
    setEditingContent("");
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      onDeleteComment?.(commentToDelete);
      setCommentToDelete(null);
    }
    setIsOpen(false);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={isReply ? "ml-8" : ""}
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          <div className="relative w-8 h-8 flex-shrink-0">
            {comment.author.avatar?.startsWith('http') || comment.author.avatar?.startsWith('/') ? (
              <Image
                src={comment.author.avatar || "/avatar.png"}
                alt={comment.author.name}
                fill
                className="rounded-full object-cover"
                sizes="32px"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg">
                {comment.author.avatar || '👤'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0">
                <span className="text-sm font-medium">{comment.author.name}</span>
                <span className="text-xs text-gray-500">{comment.author.username} • {comment.date}</span>
              </div>
              <div className="relative">
                <button
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setEditingComment(comment.id)}
                  aria-label="Edit"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {editingComment === comment.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs rounded bg-blue-500 text-white" onClick={handleSaveEdit}>
                    Сохранить
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800"
                    onClick={() => {
                      setEditingComment(null);
                      setEditingContent("");
                    }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-sm leading-relaxed">{comment.content}</span>
                <div className="flex gap-4">
                  <div className="flex gap-1 items-center">
                    <button
                      aria-label="Like"
                      className={`p-1 rounded ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                      onClick={() => onLikeComment?.(comment.id)}
                    >
                      <Heart size={14} fill={comment.isLiked ? "#ff6b6b" : "none"} />
                    </button>
                    <span className="text-xs text-gray-500">{comment.likes}</span>
                  </div>
                  <div>
                    <button
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500"
                      onClick={() => setReplyTo(comment.id)}
                    >
                      <Reply size={12} /> Ответить
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {replyTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8"
          >
            <div className="flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать ответ..."
                className="border rounded px-2 py-1 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-500 text-white flex items-center gap-1"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={14} /> Ответить
                </button>
                <button
                  className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment("");
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold font-space-grotesk">Комментарии ({comments.length})</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Поделитесь своим мнением о посте..."
              rows={3}
              className="border rounded px-2 py-1 text-sm"
            />
            <div className="flex justify-end">
              <button
                className="px-3 py-1 text-sm rounded bg-blue-500 text-white flex items-center gap-1"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                <Send size={14} /> Комментировать
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment, false)}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-bold mb-2">Удалить комментарий?</div>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">Это действие нельзя будет отменить. Комментарий будет удален навсегда.</div>
            <div className="flex justify-end gap-2">
              <button ref={cancelRef} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700" onClick={() => setIsOpen(false)}>
                Отмена
              </button>
              <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
