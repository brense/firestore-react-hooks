import { AggregateField, AggregateQuerySnapshot, collection, collectionGroup, CollectionReference, DocumentData, Firestore, getCountFromServer, getDocs, onSnapshot, Query, query, QueryConstraint, QuerySnapshot, Unsubscribe } from 'firebase/firestore'
import { useCallback } from 'react'

export type UseQuery<T = DocumentData | QuerySnapshot<DocumentData>> = {
  getDocs: () => Promise<T>
  countDocs: () => Promise<AggregateQuerySnapshot<{ count: AggregateField<number> }> | number> // TODO:...
  subscribe: (next: (snapshot: T) => void) => Unsubscribe
}

type UseCollectionOptions = { returnDocumentData?: false }

export function makeQuery<T = DocumentData>(firestore: Firestore, collectionPath: string, ...queryConstraints: QueryConstraint[]) {
  return query<T>(collection(firestore, collectionPath) as CollectionReference<T>, ...queryConstraints)
}

export function makeCollectionGroupQuery<T = DocumentData>(firestore: Firestore, collectionPath: string, ...queryConstraints: QueryConstraint[]) {
  return query<T>(collectionGroup(firestore, collectionPath) as CollectionReference<T>, ...queryConstraints)
}

function useQuery<T = DocumentData>(q: Query<T>, options?: UseCollectionOptions): UseQuery {
  const { returnDocumentData = false } = options || {}

  const getFunc = useCallback(async () => {
    const snapshot = await getDocs<T>(q)
    if (returnDocumentData) {
      const docs: Array<T & { id: string }> = []
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }))
      return docs
    } else {
      return snapshot
    }
  }, [q, returnDocumentData])

  const countFunc = useCallback(async () => {
    const snapshot = await getCountFromServer(q)
    return returnDocumentData ? snapshot.data().count : snapshot
  }, [q, returnDocumentData])

  const subscribe = useCallback((next: (snapshot: QuerySnapshot<T> | Array<T & { id: string }>) => void) => {
    return onSnapshot(q, snapshot => {
      if (returnDocumentData) {
        const docs: Array<T & { id: string }> = []
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }))
        next(docs)
      } else {
        next(snapshot)
      }
    })
  }, [q, returnDocumentData])

  return {
    getDocs: getFunc,
    countDocs: countFunc,
    subscribe
  }
}

export default useQuery
