import React, { useState, useEffect } from 'react';
import useSpeechToText from '../../hooks/useSpeechToText';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function SpeechTextArea({
  value,
  onChange,
  placeholder = 'Type or speak your description...',
  className = '',
  rows = 4,
  ...props
}) {
  const [lang, setLang] = useState('en-IN');
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  } = useSpeechToText({ lang });

  useEffect(() => {
    if (transcript) {
      // Create a mock event to mimic standard text changes
      const event = {
        target: {
          value: value ? `${value} ${transcript}`.trim() : transcript,
        },
      };
      onChange(event);
    }
  }, [transcript]);

  const handleMicClick = (e) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-1.5">
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full pr-12 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 border-slate-350 dark:border-slate-750 text-slate-900 dark:text-slate-100 ${className}`}
          {...props}
        />
        <div className="absolute right-3.5 top-3 flex items-center gap-2">
          <button
            onClick={handleMicClick}
            type="button"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 hover:bg-red-650 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak'}
          >
            {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-1 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-slate-600 dark:text-slate-400 font-medium">Speech Language:</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={isListening}
            className="px-2 py-0.5 border rounded bg-slate-50 dark:bg-slate-850 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none text-xs"
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi (हिन्दी)</option>
          </select>
        </div>
        {isListening && (
          <span className="text-red-555 dark:text-red-400 font-bold animate-pulse">
            Listening... Speak now
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1 select-none">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
