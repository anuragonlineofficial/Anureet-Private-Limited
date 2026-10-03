import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid))
          if (snap.exists()) setUserData({ uid: u.uid, ...snap.data() })
          else setUserData(null)
        } catch (e) { console.error(e) }
      } else setUserData(null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{
      user, userData, loading, logout,
      isAdmin: userData?.role === 'admin',
      isVLE: userData?.role === 'vle'
    }}>
      {children}
    </AuthContext.Provider>
  )
}