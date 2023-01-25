import { DocumentData, QuerySnapshot } from 'firebase/firestore'
import { useCallback, useMemo } from 'react'
import useFirestore from './useFirestore'
import useQuery, { makeQuery, UseQuery } from './useQuery'

type UseCollectionFromPath<T = DocumentData | QuerySnapshot<DocumentData>> = UseQuery<T> & {
  addDoc: (data: T) => Promise<void>
}

type UseCollectionOptions = { returnDocumentData?: false }

function useCollection<T = DocumentData>(path: string, options?: UseCollectionOptions): UseCollectionFromPath {
  const firestore = useFirestore()
  const q = useMemo(() => makeQuery<T>(firestore, path), [path])
  const functions = useQuery<T>(q, options)

  const addFunc = useCallback(async () => {

  }, [])

  return {
    ...functions,
    addDoc: addFunc
  }
}

export default useCollection
