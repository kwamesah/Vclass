import React, { useState } from 'react';
import { Play, Pause, Maximize2, ExternalLink, Video, CheckCircle2 } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeVideoId } from '../../utils/youtube';

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  showInlineControls?: boolean;
  onEnded?: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  title = 'Lesson Video Lecture',
  className = '',
  autoPlay = false,
  showInlineControls = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const embedUrl = getYouTubeEmbedUrl(url, true);
  const thumbnailUrl = getYouTubeThumbnailUrl(url);
  const videoId = getYouTubeVideoId(url);

  if (!videoId || !embedUrl) {
    return (
      <div className={`p-4 bg-slate-100 rounded-xl border border-slate-300 text-xs text-slate-500 text-center ${className}`}>
        <Video className="w-6 h-6 mx-auto text-slate-400 mb-1" />
        <p>Invalid or unsupported video URL: {url}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg ${className}`}>
      {isPlaying ? (
        <div className="relative aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center group overflow-hidden">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300 group-hover:scale-105 transform"
            />
          )}

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

          {/* Center Play Button */}
          <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center space-y-3">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/20"
              title="Play Video Inside VClass"
              aria-label="Play Video Inside VClass"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1" />
            </button>

            <div className="space-y-1 max-w-lg">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-900/80 border border-rose-500/40 text-rose-200 text-[10px] font-bold uppercase tracking-wider">
                <Video className="w-3 h-3 text-rose-400" /> Embedded In-App Player
              </span>
              <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2 drop-shadow-md">
                {title}
              </h4>
              <p className="text-slate-300 text-xs drop-shadow-xs">
                Click play to watch this lesson video directly within Salem VClass.
              </p>
            </div>
          </div>

          {/* Bottom Bar Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-slate-300 text-[11px] z-10">
            <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs font-medium">
              🎥 Video ID: {videoId}
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In-Page Playback
            </span>
          </div>
        </div>
      )}

      {/* Optional bottom bar info when playing */}
      {isPlaying && showInlineControls && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-md bg-rose-600/80 text-white font-bold text-[10px]">
              PLAYING
            </span>
            <span className="truncate font-medium text-slate-200">{title}</span>
          </div>
          <button
            onClick={() => setIsPlaying(false)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Switch to Poster
          </button>
        </div>
      )}
    </div>
  );
};
