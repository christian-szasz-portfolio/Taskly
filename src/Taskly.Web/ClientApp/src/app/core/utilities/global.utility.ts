/**
 * Utility class for generating GUIDs.
 */
export class Guid {
  private static readonly GUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;


  public static readonly empty: string = '00000000-0000-0000-0000-000000000000';

  /**
   * Generates a new GUID.
   * @returns A new GUID string.
   */
  public static newGuid(): string {
    // Simple UUID generator for demonstration purposes
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validates if the given string is a valid GUID.
   * @param value The string to validate.
   * @returns True if the string is a valid GUID, false otherwise.
   */
  public static isGuidReference(value: string): boolean {
    return Guid.GUID_PATTERN.test(value);
  }
}

/**
 * A type representing a mutable list of items.
 */
export type List<T> = T[];

declare global {
  interface String {
    isNullOrEmpty(this: string | null | undefined): boolean;
    isNullOrWhitespace(this: string | null | undefined): boolean;
  }

  interface Array<T> {
    isNullOrEmpty(this: T[] | null | undefined): boolean;
  }
}

/** Checks if the string is null, undefined, or consists only of whitespace characters.
 * @returns True if the string is null, undefined, or whitespace; otherwise, false.
 */
String.prototype.isNullOrWhitespace = function (): boolean {
  return this === null || this === undefined || this.trim().length === 0;
}

/** Checks if the string is null, undefined, or empty.
 * @returns True if the string is null, undefined, or empty; otherwise, false.
 */
String.prototype.isNullOrEmpty = function (): boolean {
  return this === null || this === undefined || this.length === 0;
}

/** Checks if the array is null, undefined, or has no elements.
 * @returns True if the array is null, undefined, or empty; otherwise, false.
 */
Array.prototype.isNullOrEmpty = function (): boolean {
  return this === null || this === undefined || this.length === 0;
}

export class Guard {

  private constructor() {/**/}

  /** Singleton instance of the Guard class. */
  public static readonly against = new Guard();

  /** Throws an error if the provided value is null or undefined.
   * @param value The value to check.
   */
  public nullOrEmpty<T>(value: T | null | undefined): void {
    if (value === null || value === undefined || Object.keys(value).length === 0) {
      throw new Error(`Required parameter '${typeof value}' was null or empty or undefined.`);
    }
  }
}
