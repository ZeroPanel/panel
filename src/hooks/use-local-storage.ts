"use client";

import { useState, useEffect, useCallback } from 'react';

// A helper function to determine if we are on the server
const isServer = typeof window === 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Function to read value from localStorage
  const readValue = (): T => {
    if (isServer) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (isServer) {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // We dispatch a custom event so every useLocalStorage hook are notified
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);


  useEffect(() => {
    setStoredValue(readValue());
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        if ((e as StorageEvent).key && (e as StorageEvent).key !== key) {
            return;
        }
        setStoredValue(readValue());
    };

    // this only works for other documents, not the current one
    window.addEventListener("storage", handleStorageChange);
    // this is for the current document
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}

    