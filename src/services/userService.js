import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getVLEUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateUser(id, data) {
  return updateDoc(doc(db, 'users', id), data)
}

export async function deleteUser(id) {
  return deleteDoc(doc(db, 'users', id))
}