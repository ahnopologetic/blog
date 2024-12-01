"use client";

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ShareMenuProps {
  title: string;
}

export function ShareMenu({ title }: ShareMenuProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = (platform: string) => {
    const text = `Check out "${title}"`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'threads':
        shareUrl = `https://threads.net/intent/post?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          setShowCopied(true);
          setTimeout(() => {
            setShowCopied(false);
            setOpen(false);
          }, 2000);
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Share"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="end">
        <button
          onClick={() => handleShare('twitter')}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Share on X (Twitter)
        </button>
        <button
          onClick={() => handleShare('threads')}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Share on Threads
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Copy Link
          {showCopied && (
            <span className="text-green-600">
              Copied!
            </span>
          )}
        </button>
      </PopoverContent>
    </Popover>
  );
} 