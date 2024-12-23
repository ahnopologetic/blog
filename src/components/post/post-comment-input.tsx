"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Gift, Image as ImageIcon } from "lucide-react";

interface PostCommentInputProps {
  user?: {
    name: string;
    image?: string;
  };
  onSubmit?: (content: string) => void;
}

const EMOJI_LIST = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];

const PostCommentInput = ({ user, onSubmit }: PostCommentInputProps) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit?.(comment);
      setComment("");
    }
  };

  return (
    <Card className="p-4 w-full shadow-none border-none">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar>
          <AvatarImage src={user?.image} alt={user?.name || "User"} />
          <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="relative">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[40px] pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                <Gift className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 flex gap-1">
            {EMOJI_LIST.map((emoji) => (
              <Button
                key={emoji}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setComment((prev) => prev + emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default PostCommentInput;
