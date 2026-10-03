import { 
  collection, addDoc, getDocs, query, orderBy, 
  serverTimestamp, limit 
} from 'firebase/firestore'
import { db } from './firebase'

export async function logActivity(action, details, userId, userName) {
  try {
    return await addDoc(collection(db, 'activityLogs'), {
      action,
      details,
      userId: userId || 'system',
      userName: userName || 'System',
      timestamp: serverTimestamp()
    })
  } catch (err) {
    console.error('Activity log failed:', err)
  }
}

export async function getActivityLogs(maxResults = 100) {
  try {
    const q = query(
      collection(db, 'activityLogs'),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    const snap = await getDocs(collection(db, 'activityLogs'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
      .slice(0, maxResults)
  }
}