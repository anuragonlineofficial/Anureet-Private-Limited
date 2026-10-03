import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

// ==================== SERVICES ====================

export async function createService(data) {
  return addDoc(collection(db, 'services'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function getServices(activeOnly = false) {
  const col = collection(db, 'services')
  try {
    const q = activeOnly
      ? query(col, where('status', '==', 'active'), orderBy('displayOrder', 'asc'))
      : query(col, orderBy('displayOrder', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    const snap = await getDocs(col)
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (activeOnly) data = data.filter(s => s.status === 'active')
    return data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }
}

export async function updateService(id, data) {
  return updateDoc(doc(db, 'services', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteService(id) {
  return deleteDoc(doc(db, 'services', id))
}

// ==================== CATEGORIES ====================

export async function getCategories() {
  const snap = await getDocs(collection(db, 'categories'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createCategory(data) {
  return addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp()
  })
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, 'categories', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id))
}