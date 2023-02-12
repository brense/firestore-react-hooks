| :warning: **This package is not yet ready for production** |
| ---------------------------------------------------------- |

# Firestore-react-hooks

## Getting started

### Installation

```bash
npm i firestore-react-hooks
```

### useDoc

Returns get, set, delete and subscribe functions for a document.

```tsx
function SomeComponent() {
  const { getDoc, setDoc } = useDoc<{ title: string }>(
    "/some-collection/doc-id"
  );
  const [product, setProduct] = useState<{ title: string }>();

  useEffect(() => {
    getDoc().then((doc) => {
      setProduct(doc.data());
    });
  }, [getDoc]);

  const handleUpdateDoc = useCallback(async () => {
    await setDoc("/some-collection/doc-id", { title: "Some title" });
  }, [setDoc]);

  return (
    <>
      <h1>{product.title}</h1>
      <button onClick={handleUpdateDoc}>Update doc</button>
    </>
  );
}
```

### useCollection

Returns get, add, count and subscribe functions for a collection.

```
Example still to come...
```

### useQuery

Returns get, count and subscribe functions for a query.

```
Example still to come...
```

### useFirestore

```
Example still to come...
```
