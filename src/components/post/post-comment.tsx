"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Heart } from "lucide-react";

interface PostCommentProps {
  author: {
    name: string;
    image?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isAuthor?: boolean;
  onLike?: (commentId: string) => void;
  commentId: string;
  isLiked?: boolean;
}

const PostComment = ({ 
  author, 
  content, 
  createdAt, 
  likes, 
  isAuthor = false,
  onLike,
  commentId,
  isLiked = false 
}: PostCommentProps) => {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes);

  const handleLike = () => {
    setIsLikedState(!isLikedState);
    setLikesCount(prev => isLikedState ? prev - 1 : prev + 1);
    onLike?.(commentId);
  };

  return (
    <Card className="p-4 w-full shadow-none border-none hover:bg-muted-foreground/10 transition-colors duration-300">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={author.image} alt={author.name} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{author.name}</span>
            {isAuthor && (
              <span className="text-xs text-muted-foreground">• by author</span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt)} ago
            </span>
          </div>
          
          <p className="mt-1">{content}</p>
          
          <div className="mt-2 flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-1"
            >
              <Heart 
                className={`w-4 h-4 ${isLikedState ? "fill-red-500 text-red-500" : ""}`}
              />
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </Button>
            <Button variant="ghost" size="sm">
              Reply
            </Button>
            <Button variant="ghost" size="sm">
              Hide
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostComment;
