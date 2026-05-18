import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white shadow-md overflow-hidden rounded-lg w-full sm:w-[330px] animate-pulse">
      <div className="h-[220px] bg-gray-200" />
      <div className="p-3 flex flex-col gap-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-1" />
        <div className="flex gap-4 mt-1">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
