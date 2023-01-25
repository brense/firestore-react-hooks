import { deleteDoc, doc, DocumentData, DocumentReference, DocumentSnapshot, getDoc, onSnapshot, setDoc, SetOptions, Unsubscribe } from 'firebase/firestore'
import { useCallback } from 'react'
import useFirestore from './useFirestore'

type UseDocFromPath<T = DocumentData | DocumentSnapshot<DocumentData>> = {
  getDoc: () => Promise<T>
  setDoc: (data: T, options?: SetOptions) => Promise<void>
  deleteDoc: () => Promise<void>
  subscribe: (next: (snapshot: T) => void) => Unsubscribe
}

type UseDoc<T = DocumentData> = {
  getDoc: (path: string) => Promise<DocumentSnapshot<T>>
  setDoc: (path: string, data: T, options?: SetOptions) => Promise<void>
  deleteDoc: (path: string) => Promise<void>
  subscribe: (path: string, next: (snapshot: DocumentSnapshot<T>) => void) => Unsubscribe
}

type UseDocOptions = { returnDocumentData?: false }
type UseDocParams = Parameters<(options?: Omit<UseDocOptions, 'returnDocumentData'> & { returnDocumentData?: boolean }) => void>
type UseDocParamsFromPath = Parameters<(path: string, options?: Omit<UseDocOptions, 'returnDocumentData'> & { returnDocumentData?: boolean }) => void>

function isUseDoc(params: UseDocParams | UseDocParamsFromPath): params is UseDocParams {
  return typeof params[0] !== 'string'
}

function useDoc<T = DocumentData>(options?: UseDocOptions): UseDoc<DocumentSnapshot<T>>
function useDoc<T = DocumentData>(options?: Omit<UseDocOptions, 'returnDocumentData'> & { returnDocumentData: true }): UseDoc<T & { id: string }>
function useDoc<T = DocumentData>(path: string, options?: UseDocOptions): UseDocFromPath<DocumentSnapshot<T>>
function useDoc<T = DocumentData>(path: string, options?: Omit<UseDocOptions, 'returnDocumentData'> & { returnDocumentData: true }): UseDocFromPath<T & { id: string }>
function useDoc<T = DocumentData>(...params: UseDocParams | UseDocParamsFromPath) {
  const firestore = useFirestore()
  const [path, options] = isUseDoc(params) ? [, ...params] : params
  const { returnDocumentData = false } = options || {}

  const getDocumentReference = useCallback((path: string) => {
    return doc(firestore, path) as DocumentReference<T>
  }, [firestore])

  const getFunc = useCallback(async (path: string) => {
    const snapshot = await getDoc<T>(getDocumentReference(path))
    return returnDocumentData ? { id: snapshot.id, ...snapshot.data() } : snapshot
  }, [getDocumentReference, returnDocumentData])

  const getFromPath = useCallback(() => getFunc(path!), [path, getFunc])

  const setFunc = useCallback(async (path: string, data: T, options?: SetOptions) => {
    return options ? await setDoc<T>(getDocumentReference(path), data, options) : await setDoc<T>(getDocumentReference(path), data)
  }, [getDocumentReference])

  const setFromPath = useCallback((data: T, options?: SetOptions) => setFunc(path!, data, options), [path, setFunc])

  const deleteFunc = useCallback(async (path: string) => {
    return await deleteDoc(getDocumentReference(path))
  }, [getDocumentReference])

  const deleteFromPath = useCallback(() => deleteFunc(path!), [path, deleteFunc])

  const subscribeFunc = useCallback((path: string, next: (snapshot: DocumentSnapshot<T> | (T & { id: string })) => void) => {
    return onSnapshot(getDocumentReference(path), snapshot => {
      if (returnDocumentData) {
        next({ id: snapshot.id, ...snapshot.data() as T })
      } else {
        next(snapshot)
      }
    })
  }, [getDocumentReference, returnDocumentData])

  const subscribeFromPath = useCallback((next: (snapshot: DocumentSnapshot<T> | (T & { id: string })) => void) => subscribeFunc(path!, next), [path, subscribeFunc])

  return {
    getDoc: !path ? getFunc : getFromPath,
    setDoc: !path ? setFunc : setFromPath,
    deleteDoc: !path ? deleteFunc : deleteFromPath,
    subscribe: !path ? subscribeFunc : subscribeFromPath
  }
}

export default useDoc
