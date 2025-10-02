import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';

interface BlogPostProps {
  id: string;
  author: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  image?: string;
  tags?: string[];
}

export default function BlogPost({ 
  id, 
  author, 
  username, 
  avatar, 
  content, 
  timestamp, 
  likes: initialLikes, 
  comments, 
  reposts, 
  image,
  tags = []
}: BlogPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    console.log(`Like toggled for post ${id}`);
  };

  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardContent className="p-6">
        {/* Author info */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback>{author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-card-foreground">{author}</h3>
              <span className="text-sm text-muted-foreground">@{username}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <time className="text-sm text-muted-foreground">{timestamp}</time>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-card-foreground leading-relaxed mb-3">{content}</p>
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md hover-elevate cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Image */}
          {image && (
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={image} 
                alt="Post image" 
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            data-testid={`button-like-${id}`}
            className={`gap-2 ${isLiked ? 'text-red-500' : ''} hover-elevate`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log(`Comment clicked for post ${id}`)}
            data-testid={`button-comment-${id}`}
            className="gap-2 hover-elevate"
          >
            <MessageCircle className="h-4 w-4" />
            {comments}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log(`Repost clicked for post ${id}`)}
            data-testid={`button-repost-${id}`}
            className="gap-2 hover-elevate"
          >
            <Repeat2 className="h-4 w-4" />
            {reposts}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log(`Share clicked for post ${id}`)}
            data-testid={`button-share-${id}`}
            className="gap-2 hover-elevate ml-auto"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}