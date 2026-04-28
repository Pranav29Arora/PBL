import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

function predictionsCollection(userId) {
  return collection(db, 'users', userId, 'predictions')
}

function normalizeTimestamp(value, fallback) {
  if (value?.toDate) return value.toDate().toISOString()
  return fallback || new Date().toISOString()
}

export function subscribePredictions(userId, onRows, onError) {
  const q = query(predictionsCollection(userId), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      onRows(
        snapshot.docs.map((item) => {
          const data = item.data()
          return {
            id: item.id,
            ...data,
            timestamp: normalizeTimestamp(data.createdAt, data.clientTimestamp),
          }
        }),
      )
    },
    onError,
  )
}

export async function savePrediction(userId, entry) {
  await addDoc(predictionsCollection(userId), {
    ...entry,
    clientTimestamp: entry.timestamp || new Date().toISOString(),
    createdAt: serverTimestamp(),
  })
}

export async function deletePrediction(userId, predictionId) {
  await deleteDoc(doc(db, 'users', userId, 'predictions', predictionId))
}
