'use client';

import { useDocument as useFirestoreDocument } from 'react-firebase-hooks/firestore';
import type { DocumentReference } from 'firebase/firestore';

export function useDoc(query?: DocumentReference | null) {
  return useFirestoreDocument(query);
}
