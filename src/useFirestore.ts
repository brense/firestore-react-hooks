import { useMemo } from 'react'
import { getFirestore } from 'firebase/firestore'

export default function useFirestore() {
  return useMemo(() => getFirestore(), [])
}
