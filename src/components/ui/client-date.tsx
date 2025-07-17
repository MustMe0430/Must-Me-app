"use client";

import React, { useState, useEffect } from 'react';

interface SafeDateProps {
  date: Date | string | number | null | undefined;
  format?: 'relative' | 'absolute' | 'custom';
  locale?: string;
  timezone?: string;
  options?: Intl.DateTimeFormatOptions;
  customFormatter?: (date: Date) => string;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  className?: string;
}

interface RelativeTimeUnit {
  unit: Intl.RelativeTimeFormatUnit;
  ms: number;
}

const RELATIVE_TIME_UNITS: RelativeTimeUnit[] = [
  { unit: 'year', ms: 31536000000 },
  { unit: 'month', ms: 2628000000 },
  { unit: 'week', ms: 604800000 },
  { unit: 'day', ms: 86400000 },
  { unit: 'hour', ms: 3600000 },
  { unit: 'minute', ms: 60000 },
  { unit: 'second', ms: 1000 },
];

export const SafeDate: React.FC<SafeDateProps> = ({
  date,
  format = 'absolute',
  locale,
  timezone,
  options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  },
  customFormatter,
  fallback = <span className="text-muted-foreground">--</span>,
  showTooltip = false,
  className = '',
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [absoluteDate, setAbsoluteDate] = useState<string>('');

  // Convert input to Date object safely
  const parseDate = (input: Date | string | number | null | undefined): Date | null => {
    if (!input) return null;
    
    try {
      const parsedDate = new Date(input);
      
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        return null;
      }
      
      return parsedDate;
    } catch {
      return null;
    }
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    try {
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const absMs = Math.abs(diffMs);

      // If less than 1 minute, show "just now"
      if (absMs < 60000) {
        return 'just now';
      }

      // Find the appropriate unit
      for (const { unit, ms } of RELATIVE_TIME_UNITS) {
        if (absMs >= ms) {
          const value = Math.floor(diffMs / ms);
          const rtf = new Intl.RelativeTimeFormat(locale || 'en', { 
            numeric: 'auto',
            style: 'long'
          });
          return rtf.format(value, unit);
        }
      }

      return 'just now';
    } catch {
      return 'unknown time';
    }
  };

  // Format absolute time
  const formatAbsoluteTime = (date: Date): string => {
    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        ...options,
        timeZone: timezone,
      };

      return new Intl.DateTimeFormat(locale || 'en', formatOptions).format(date);
    } catch {
      return date.toString();
    }
  };

  // Format date based on format type
  const formatDate = (date: Date): string => {
    if (customFormatter) {
      try {
        return customFormatter(date);
      } catch {
        return formatAbsoluteTime(date);
      }
    }

    switch (format) {
      case 'relative':
        return formatRelativeTime(date);
      case 'absolute':
        return formatAbsoluteTime(date);
      case 'custom':
        return formatAbsoluteTime(date);
      default:
        return formatAbsoluteTime(date);
    }
  };

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true);

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      setFormattedDate('');
      setAbsoluteDate('');
      return;
    }

    // Set formatted date
    setFormattedDate(formatDate(parsedDate));

    // Always set absolute date for tooltip (if different from main format)
    if (format === 'relative' || showTooltip) {
      setAbsoluteDate(formatAbsoluteTime(parsedDate));
    }

    // Set up interval for relative time updates
    if (format === 'relative') {
      const interval = setInterval(() => {
        setFormattedDate(formatDate(parsedDate));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [date, format, locale, timezone, options, customFormatter]);

  // Show fallback during SSR and hydration
  if (!isHydrated) {
    return <>{fallback}</>;
  }

  // Show fallback for invalid dates
  if (!formattedDate) {
    return <>{fallback}</>;
  }

  const content = (
    <span className={className}>
      {formattedDate}
    </span>
  );

  // Add tooltip for relative dates or when explicitly requested
  if ((format === 'relative' || showTooltip) && absoluteDate) {
    return (
      <span
        title={absoluteDate}
        className={`cursor-help ${className}`}
      >
        {formattedDate}
      </span>
    );
  }

  return content;
};

// Utility hook for safe date operations
export const useSafeDate = (date: Date | string | number | null | undefined) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [parsedDate, setParsedDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    
    try {
      if (!date) {
        setParsedDate(null);
        return;
      }

      const parsed = new Date(date);
      setParsedDate(isNaN(parsed.getTime()) ? null : parsed);
    } catch {
      setParsedDate(null);
    }
  }, [date]);

  return {
    isHydrated,
    date: parsedDate,
    isValid: parsedDate !== null,
  };
};

// Pre-configured components for common use cases
export const RelativeDate: React.FC<Omit<SafeDateProps, 'format'>> = (props) => (
  <SafeDate {...props} format="relative" showTooltip={true} />
);

export const AbsoluteDate: React.FC<Omit<SafeDateProps, 'format'>> = (props) => (
  <SafeDate {...props} format="absolute" />
);

export const ShortDate: React.FC<Omit<SafeDateProps, 'format' | 'options'>> = (props) => (
  <SafeDate 
    {...props} 
    format="absolute" 
    options={{ 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }} 
  />
);

export const FullDateTime: React.FC<Omit<SafeDateProps, 'format' | 'options'>> = (props) => (
  <SafeDate 
    {...props} 
    format="absolute" 
    options={{ 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }} 
  />
);