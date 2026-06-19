import React, { useEffect, useRef } from 'react';
import { X, PlayCircle } from 'lucide-react';
import loginVideo from '../assets/loginVideo.mp4';
import registerVideo from '../assets/registerVideo.mp4';

export default function VideoModal({ isOpen, onClose, videoType }) {
  const videoRef = useRef(null);

  // Pause the video when modal is closed
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const videoSrc = videoType === 'login' ? loginVideo : registerVideo;
  const videoTitle = videoType === 'login' ? 'How to Login' : 'How to Register';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800/80 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-saffron via-white to-gov-green"></div>
          <div className="flex items-center gap-3 mt-1">
            <PlayCircle className="h-6 w-6 text-[#ff9933]" />
            <div>
              <h3 className="font-display font-semibold text-lg">{videoTitle}</h3>
              <p className="text-xs text-slate-400">LMS Training &amp; Guide Video</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer border-0"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <video 
            ref={videoRef}
            src={videoSrc} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 px-6 py-3 text-center text-xs text-slate-500 border-t border-slate-800/80">
          JK Samadhan 2.0 Unified Portal Video Guide
        </div>
      </div>
    </div>
  );
}
