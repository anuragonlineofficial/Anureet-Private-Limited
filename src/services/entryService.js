import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function createEntry(data) {
  return addDoc(collection(db, 'entries'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Get entries for a specific operator
export async function getOperatorEntries(operatorId) {
  try {
    const q = query(
      collection(db, 'entries'),
      where('operatorId', '==', operatorId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getOperatorEntries error, falling back:', err)
    // Fallback: get all and filter client-side
    const snap = await getDocs(collection(db, 'entries'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(e => e.operatorId === operatorId || e.vleId === operatorId)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }
}

// Backward compatibility alias
export const getVLEEntries = getOperatorEntries

// Get all entries (admin)
export async function getAllEntries() {
  const snap = await getDocs(collection(db, 'entries'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function updateEntryStatus(id, status, adminRemarks = '') {
  return updateDoc(doc(db, 'entries', id), {
    status,
    adminRemarks,
    updatedAt: serverTimestamp()
  })
}

export async function updateEntry(id, data) {
  return updateDoc(doc(db, 'entries', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteEntry(id) {
  return deleteDoc(doc(db, 'entries', id))
}