import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, getDoc 
} from 'firebase/firestore'
import { db } from './firebase'

// Generate unique Application ID: ANR-YYYYMMDD-XXXXXX
function generateApplicationId() {
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `ANR-${yyyymmdd}-${random}`
}

// Check duplicate Ration Card
export async function checkDuplicateRation(rationNumber, excludeEntryId = null) {
  if (!rationNumber) return null
  try {
    const q = query(
      collection(db, 'entries'),
      where('rationCardNumber', '==', rationNumber),
      where('status', 'in', ['pending', 'in-process', 'approved'])
    )
    const snap = await getDocs(q)
    const duplicates = snap.docs
      .filter(d => d.id !== excludeEntryId)
      .map(d => ({ id: d.id, ...d.data() }))
    return duplicates.length > 0 ? duplicates[0] : null
  } catch (err) {
    console.error('Duplicate check error:', err)
    return null
  }
}

// Create new entry/application
export async function createEntry(data) {
  const applicationId = generateApplicationId()
  return addDoc(collection(db, 'entries'), {
    ...data,
    applicationId,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

// Get entries for a VLE
export async function getVLEEntries(vleId) {
  try {
    const q = query(
      collection(db, 'entries'),
      where('vleId', '==', vleId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    const snap = await getDocs(collection(db, 'entries'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(e => e.vleId === vleId)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }
}

// Alias
export const getOperatorEntries = getVLEEntries

// Get all entries (admin)
export async function getAllEntries() {
  const snap = await getDocs(collection(db, 'entries'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

// Get single entry
export async function getEntryById(id) {
  const snap = await getDoc(doc(db, 'entries', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Update entry (VLE edit allowed)
export async function updateEntry(id, data) {
  return updateDoc(doc(db, 'entries', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// Update entry status (admin only)
export async function updateEntryStatus(id, status, adminRemarks = '') {
  return updateDoc(doc(db, 'entries', id), {
    status,
    adminRemarks,
    updatedAt: serverTimestamp()
  })
}

// Update payment status
export async function updatePaymentStatus(id, paymentStatus, paymentData = {}) {
  return updateDoc(doc(db, 'entries', id), {
    paymentStatus,
    ...paymentData,
    updatedAt: serverTimestamp()
  })
}

// Delete entry
export async function deleteEntry(id) {
  return deleteDoc(doc(db, 'entries', id))
}