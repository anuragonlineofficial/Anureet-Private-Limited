import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, getDoc 
} from 'firebase/firestore'
import { db } from './firebase'

export async function createNews(data) {
  return addDoc(collection(db, 'news'), {
    ...data,
    published: data.published || false,
    createdAt: serverTimestamp()
  })
}

export async function getAllNews(onlyPublished = false) {
  try {
    const q = onlyPublished
      ? query(collection(db, 'news'), where('published', '==', true))
      : query(collection(db, 'news'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  } catch {
    const snap = await getDocs(collection(db, 'news'))
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (onlyPublished) data = data.filter(n => n.published === true)
    return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }
}

export async function updateNews(id, data) {
  return updateDoc(doc(db, 'news', id), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteNews(id) {
  return deleteDoc(doc(db, 'news', id))
}