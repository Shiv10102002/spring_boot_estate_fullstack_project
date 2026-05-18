import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-4">
      <h1 className="text-8xl font-bold text-slate-300">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700">Page Not Found</h2>
      <p className="text-slate-500 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
