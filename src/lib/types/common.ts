/**
 * Common utility types
 * Shared types used across the application
 */

/**
 * Utility type for async data handling with discriminated unions
 * Provides type-safe state management for loading/error/success scenarios
 */
export type AsyncData<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };
