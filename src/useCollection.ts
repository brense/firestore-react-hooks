import { addDoc, collection, DocumentData, DocumentReference, QuerySnapshot, WithFieldValue } from 'firebase/firestore'
import { useCallback, useMemo } from 'react'
import useFirestore from './useFirestore'
import useQuery, { makeQuery, UseQuery } from './useQuery'

type UseCollectionFromPath<T = DocumentData, R = QuerySnapshot<T> | T[]> = UseQuery<T, R> & {
  addDoc: (data: WithFieldValue<T>) => Promise<DocumentReference<T>>
}

export type UseCollectionOptions = { returnDocumentData?: false }
export type UseCollectionOptionsReturnDocData = Omit<UseCollectionOptions, 'returnDocumentData'> & { returnDocumentData: true }
type UseCollectionParams = Parameters<(path: string, options?: Omit<UseCollectionOptions, 'returnDocumentData'> & { returnDocumentData?: boolean }) => void>

function useCollection<T = DocumentData>(path: string, options?: UseCollectionOptions): UseCollectionFromPath<T, QuerySnapshot<T>>
function useCollection<T = DocumentData>(path: string, options: UseCollectionOptionsReturnDocData): UseCollectionFromPath<T, Array<T & { id: string }>>
function useCollection<T = DocumentData>(...params: UseCollectionParams) {
  const firestore = useFirestore()
  const [path, options] = params
  const q = useMemo(() => makeQuery<T>(firestore, path), [path])
  const functions: UseQuery<T, QuerySnapshot<T> | T[]> = useQuery<T>(q, options as UseCollectionOptions)

  const addFunc = useCallback(async (data: WithFieldValue<T>) => {
    return await addDoc(collection(firestore, path), data as any)
  }, [path])

  return useMemo(() => ({
    ...functions,
    addDoc: addFunc
  }), [functions, addFunc])
}

export default useCollection
