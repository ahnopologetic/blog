"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { emoji: "👍", name: "thumbs_up" },
  { emoji: "❤️", name: "heart" },
  { emoji: "🎉", name: "party" },
  { emoji: "🚀", name: "rocket" },
  { emoji: "👀", name: "eyes" },
];

interface ReactionCount {
  reaction_type: string;
  count: number;
}

interface PostReactionsProps {
  postSlug: string;
}

function getOrCreateUserId() {
  if (typeof window === 'undefined') return null;
  
  let userId = localStorage.getItem('blog_user_id');
  if (!userId) {
    userId = `user_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('blog_user_id', userId);
  }
  return userId;
}

export function PostReactions({ postSlug }: PostReactionsProps) {
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const supabase = createClient();

  const fetchReactions = async () => {
    const userId = getOrCreateUserId();
    if (!userId) return;

    // Get total counts
    const { data: countData, error: countError } = await supabase
      .from('post_reaction_summary')
      .select('reaction_type, count')
      .eq('post_slug', postSlug)

    if (countError) {
      console.error('Error fetching reaction counts:', countError);
      return;
    }

    setReactionCounts((countData || []).map(item => ({
      ...item,
      reaction_type: item.reaction_type || '' // Convert null to empty string
    })));

    // Get user's reactions
    const { data: userReactionsData, error: userError } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .eq('post_slug', postSlug)
      .eq('user_id', userId);

    if (userError) {
      console.error('Error fetching user reactions:', userError);
      return;
    }

    setUserReactions(userReactionsData.map(r => r.reaction_type));
  };

  const addReaction = async (reactionType: string) => {
    const userId = getOrCreateUserId();
    if (!userId) return;

    // Check if user already reacted with this type
    if (userReactions.includes(reactionType)) {
      // Remove the reaction
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('post_slug', postSlug)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType);

      if (error) {
        console.error('Error removing reaction:', error);
        return;
      }
    } else {
      // Add new reaction
      const { error } = await supabase
        .from('post_reactions')
        .insert({
          post_slug: postSlug,
          reaction_type: reactionType,
          user_id: userId
        });

      if (error) {
        console.error('Error adding reaction:', error);
        return;
      }
    }

    fetchReactions();
  };

  useEffect(() => {
    fetchReactions();

    // Set up realtime subscription
    const channel = supabase
      .channel('post_reactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions',
          filter: `post_slug=eq.${postSlug}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug]);

  return (
    <div className="flex gap-2 items-center justify-center">
      {REACTIONS.map(({ emoji, name }) => {
        const count = reactionCounts.find(r => r.reaction_type === name)?.count || 0;
        const isReacted = userReactions.includes(name);
        return (
          <Button
            key={name}
            variant={isReacted ? "default" : "outline"}
            size="lg"
            className="flex items-center gap-4 text-md relative overflow-hidden"
            onClick={() => addReaction(name)}
          >
            <span>{emoji}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </Button>
        );
      })}
    </div>
  );
} 