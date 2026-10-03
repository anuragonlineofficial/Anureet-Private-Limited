import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

export async function createContactMessage(data) {
  return addDoc(collection(db, 'contactMessages'), {
    ...data,
    read: false,
    createdAt: serverTimestamp()
  })
}

export async function getAllContactMessages() {
  const snap = await getDocs(collection(db, 'contactMessages'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function markMessageRead(id, read = true) {
  return updateDoc(doc(db, 'contactMessages', id), { read })
}

export async function deleteContactMessage(id) {
  return deleteDoc(doc(db, 'contactMessages', id))
}