'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-slate-200 dark:bg-slate-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// 卡片骨架屏
export function CardSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton width={60} height={20} />
      </div>
      <Skeleton className="mb-2" height={24} />
      <Skeleton className="mb-4" height={16} width="80%" />
      <div className="flex items-center gap-4 text-sm">
        <Skeleton width={80} height={16} />
        <Skeleton width={80} height={16} />
      </div>
    </div>
  );
}

// 活动卡片骨架屏
export function ActivityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <Skeleton height={200} className="rounded-none" />
      <div className="p-6">
        <Skeleton className="mb-2" height={24} />
        <Skeleton className="mb-4" height={16} width="90%" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton width={80} height={24} />
          <Skeleton width={100} height={24} />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={32} />
        </div>
      </div>
    </div>
  );
}

// 列表项骨架屏
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton className="mb-2" height={20} width="60%" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
  );
}
