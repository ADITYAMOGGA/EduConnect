import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
}

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4">
        <dotlottie-wc 
          src="https://lottie.host/a76bcfe8-4ca3-4652-93e7-73215e46a037/Eqdrgfet56.lottie" 
          style={{width: '120px', height: '120px'}}
          speed="1" 
          autoplay 
          loop
        ></dotlottie-wc>
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}