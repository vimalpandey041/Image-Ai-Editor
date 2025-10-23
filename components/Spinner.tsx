
import React from 'react';

export const Spinner: React.FC<{ large?: boolean }> = ({ large = false }) => {
  const sizeClass = large ? 'h-12 w-12 border-4' : 'h-5 w-5 border-2';
  return (
    <div
      className={`animate-spin rounded-full ${sizeClass} border-primary border-t-transparent`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
