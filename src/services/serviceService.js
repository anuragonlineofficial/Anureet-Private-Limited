import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, getDoc 
} from 'firebase/firestore'
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

export async function getServiceById(id) {
  const snap = await getDoc(doc(db, 'services', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
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

// Duplicate service (for "Copy Service" feature)
export async function duplicateService(id) {
  const service = await getServiceById(id)
  if (!service) throw new Error('Service not found')
  const { id: _, createdAt, updatedAt, ...data } = service
  return createService({
    ...data,
    name: data.name + ' (Copy)',
    status: 'inactive'
  })
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

// ==================== SETTINGS ====================

export async function getWebsiteSettings() {
  const snap = await getDoc(doc(db, 'settings', 'website'))
  return snap.exists() ? snap.data() : {
    siteName: 'Anureet Private Limited',
    phone: '+91-9451228744',
    email: 'ahardoi30@gmail.com',
    address: '1/7 Kanshiram Colony, Lucknow Road, Hardoi, UP – 241001',
    maintenanceMode: false,
    registrationFee: 151
  }
}

export async function updateWebsiteSettings(data) {
  const { setDoc } = await import('firebase/firestore')
  return setDoc(doc(db, 'settings', 'website'), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true })
}