// Reading this as: Skeleton Loader for Indian Luxury Fashion & Jewellery, matching the warm off-white palette with smooth shimmering pulses. Dials: VARIANCE [8] / MOTION [6] / DENSITY [4].

import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-[#EFECE6] animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden p-3 space-y-3">
      <Skeleton className="w-full aspect-[3/4] rounded-xl" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-1/4 rounded-md" />
          <Skeleton className="h-3 w-1/5 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
