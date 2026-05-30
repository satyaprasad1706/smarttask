import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, orderBy, Unsubscribe,
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { app } from './firebase';
import { Task } from './types';

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const col = (uid: string) => collection(db, 'users', uid, 'tasks');

export const firestoreDb = {
  subscribe: (uid: string, onChange: (tasks: Task[]) => void): Unsubscribe => {
    const q = query(col(uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
      onChange(snap.docs.map(d => d.data() as Task));
    });
  },
  save: async (uid: string, task: Task) => {
    await setDoc(doc(col(uid), task.id), task);
  },
  delete: async (uid: string, id: string) => {
    await deleteDoc(doc(col(uid), id));
  },
};
