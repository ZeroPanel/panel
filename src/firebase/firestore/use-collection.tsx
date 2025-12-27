'use client';

import { useCollection as useFirestoreCollection } from 'react-firebase-hooks/firestore';
import type { CollectionReference, Query } from 'firebase/firestore';

export function useCollection(query?: CollectionReference | Query | null) {
  return useFirestoreCollection(query);
}
