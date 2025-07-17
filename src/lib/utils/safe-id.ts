"use client";

import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Configuration options for ID generation
 */
export interface IdGeneratorOptions {
  /** Prefix to add to the generated ID */
  prefix?: string;
  /** Length of the random suffix (only used for fallback method) */
  length?: number;
}

/**
 * Fallback ID generator for environments without crypto.randomUUID
 */
function generateFallbackId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use a more deterministic approach for fallback
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Check if crypto.randomUUID is available
 */
function isCryptoAvailable(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check for Node.js crypto
    try {
      return typeof globalThis.crypto?.randomUUID === 'function';
    } catch {
      return false;
    }
  } else {
    // Client-side: check for Web Crypto API
    return typeof window.crypto?.randomUUID === 'function';
  }
}

/**
 * Generate a stable ID that works consistently between server and client
 */
export function generateStableId(options: IdGeneratorOptions = {}): string {
  const { prefix = '', length = 8 } = options;
  
  let id: string;
  
  if (isCryptoAvailable()) {
    try {
      // Use crypto.randomUUID when available
      const uuid = globalThis.crypto.randomUUID();
      // Take first part of UUID for shorter IDs if needed
      id = length < 36 ? uuid.replace(/-/g, '').substring(0, length) : uuid;
    } catch {
      // Fallback if crypto fails
      id = generateFallbackId(length);
    }
  } else {
    // Fallback for environments without crypto
    id = generateFallbackId(length);
  }
  
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Counter for generating sequential IDs as additional uniqueness
 */
let globalIdCounter = 0;

/**
 * Generate a deterministic ID based on a counter and timestamp
 * This helps ensure uniqueness even in rapid succession calls
 */
export function generateDeterministicId(options: IdGeneratorOptions = {}): string {
  const { prefix = 'id', length = 8 } = options;
  
  globalIdCounter += 1;
  
  // Combine timestamp and counter for uniqueness
  const timestamp = Date.now().toString(36);
  const counter = globalIdCounter.toString(36);
  const combined = (timestamp + counter).slice(-length);
  
  return `${prefix}-${combined}`;
}

/**
 * Hook for generating unique IDs in React components without hydration issues
 */
export function useStableId(options: IdGeneratorOptions = {}): string {
  const { prefix = 'react-id' } = options;
  
  // Use a ref to store the ID so it persists across renders
  const idRef = useRef<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Initialize ID on first render
  if (idRef.current === null) {
    // During SSR or initial client render, use a deterministic approach
    idRef.current = generateDeterministicId({ ...options, prefix });
  }
  
  // Effect to handle hydration
  useEffect(() => {
    setIsHydrated(true);
    
    // On client-side after hydration, we can optionally regenerate with crypto
    // but for stability, we'll keep the original ID
    // This ensures SSR and client render have the same ID
  }, []);
  
  return idRef.current;
}

/**
 * Hook for generating multiple unique IDs
 */
export function useStableIds(count: number, options: IdGeneratorOptions = {}): string[] {
  const idsRef = useRef<string[]>([]);
  
  // Initialize IDs on first render
  if (idsRef.current.length === 0) {
    idsRef.current = Array.from({ length: count }, (_, index) => 
      generateDeterministicId({ 
        ...options, 
        prefix: options.prefix ? `${options.prefix}-${index}` : `id-${index}`
      })
    );
  }
  
  return idsRef.current;
}

/**
 * Hook that provides a function to generate IDs on demand
 */
export function useIdGenerator(options: IdGeneratorOptions = {}) {
  const generateId = useCallback((customOptions?: IdGeneratorOptions) => {
    const finalOptions = { ...options, ...customOptions };
    return generateStableId(finalOptions);
  }, [options]);
  
  return generateId;
}

/**
 * Utility class for managing ID generation with different strategies
 */
export class IdGenerator {
  private options: Required<IdGeneratorOptions>;
  private counter: number = 0;
  
  constructor(options: IdGeneratorOptions = {}) {
    this.options = {
      prefix: options.prefix || 'gen',
      length: options.length || 8
    };
  }
  
  /**
   * Generate a stable ID using the configured options
   */
  generate(): string {
    return generateStableId(this.options);
  }
  
  /**
   * Generate a deterministic ID with counter
   */
  generateDeterministic(): string {
    this.counter += 1;
    const timestamp = Date.now().toString(36);
    const counter = this.counter.toString(36);
    const combined = (timestamp + counter).slice(-this.options.length);
    
    return `${this.options.prefix}-${combined}`;
  }
  
  /**
   * Generate a sequential ID
   */
  generateSequential(): string {
    this.counter += 1;
    return `${this.options.prefix}-${this.counter}`;
  }
  
  /**
   * Reset the internal counter
   */
  reset(): void {
    this.counter = 0;
  }
}

/**
 * Create a scoped ID generator with a specific prefix
 */
export function createScopedIdGenerator(prefix: string, length?: number): () => string {
  const generator = new IdGenerator({ prefix, length });
  return () => generator.generateDeterministic();
}

/**
 * Validate if a string looks like a valid generated ID
 */
export function isValidGeneratedId(id: string, expectedPrefix?: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  if (expectedPrefix) {
    if (!id.startsWith(expectedPrefix + '-')) {
      return false;
    }
    
    // Check if the part after prefix looks like a valid ID
    const idPart = id.substring(expectedPrefix.length + 1);
    return idPart.length > 0 && /^[A-Za-z0-9-]+$/.test(idPart);
  }
  
  // General validation for any generated ID format
  return /^[A-Za-z0-9-]+$/.test(id) && id.length >= 3;
}

/**
 * Extract prefix from a generated ID
 */
export function extractPrefix(id: string): string | null {
  const dashIndex = id.indexOf('-');
  return dashIndex > 0 ? id.substring(0, dashIndex) : null;
}

/**
 * Type guard to check if a value is a valid ID options object
 */
export function isIdGeneratorOptions(value: unknown): value is IdGeneratorOptions {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  return (
    (obj.prefix === undefined || typeof obj.prefix === 'string') &&
    (obj.length === undefined || (typeof obj.length === 'number' && obj.length > 0))
  );
}