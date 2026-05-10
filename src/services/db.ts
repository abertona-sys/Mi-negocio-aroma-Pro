import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export const collections = {
  PRODUCTS: "products",
  MATERIALS: "materials",
  ORDERS: "orders"
};

export async function fetchActiveProducts() {
  try {
    const q = query(collection(db, collections.PRODUCTS), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collections.PRODUCTS);
    return [];
  }
}

export function subscribeToOrders(callback: (orders: any[]) => void) {
  const q = query(collection(db, collections.ORDERS), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collections.ORDERS);
  });
}

export function subscribeToProducts(callback: (products: any[]) => void) {
  const q = query(collection(db, collections.PRODUCTS), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collections.PRODUCTS);
  });
}

export function subscribeToMaterials(callback: (materials: any[]) => void) {
  const q = query(collection(db, collections.MATERIALS), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collections.MATERIALS);
  });
}

export async function createDocument(collectionName: string, id: string, data: any) {
  try {
    await setDoc(doc(db, collectionName, id), { ...data, createdAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${id}`);
  }
}

export async function updateDocument(collectionName: string, id: string, data: any) {
  try {
    await updateDoc(doc(db, collectionName, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
  }
}

export async function deleteDocument(collectionName: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}
