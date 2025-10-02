import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  likes: number
  comments: number
  isLiked: boolean
}

interface BlogFeedProps {
  posts: BlogPost[]
  onLike: (postId: string) => void
  onComment: (postId: string) => void
}

export function BlogFeed({ posts, onLike, onComment }: BlogFeedProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Лента блогов</h2>
        <p className="text-muted-foreground">Последние публикации от авторов</p>
      </div>
      
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{post.author.name}</div>
                  <div className="text-sm text-muted-foreground">{post.publishedAt}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">{post.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onLike(post.id)}
                  className={post.isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onComment(post.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.comments}
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
