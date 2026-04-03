import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Collection Reference (Ye "entries" table/collection hai database mein)
const entriesCollection = collection(db, "entries");

/**
 * Add a new entry (Jama / Nikaale / Details)
 * @param {Object} entryData - Contains: date, time, name, credit, debit, remarks
 */
export const addEntry = async (entryData) => {
  try {
    // Current date insert karte waqt add kardiya taake sorting (naye se purana) aasan ho
    const docRef = await addDoc(entriesCollection, {
      ...entryData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding entry: ", error);
    throw error;
  }
};

/**
 * Get all entries ordered by date
 */
export const getEntries = async () => {
  try {
    // Naya data sabse oopar dikhane ke liye orderBy desc use kiya hai
    const q = query(entriesCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    
    return entries;
  } catch (error) {
    console.error("Error fetching entries: ", error);
    throw error;
  }
};

/**
 * Update an existing entry (agar ghalti se galat entry hogai ho)
 * @param {string} id - Document ID
 * @param {Object} updatedData - New values
 */
export const updateEntry = async (id, updatedData) => {
  try {
    const entryDoc = doc(db, "entries", id);
    await updateDoc(entryDoc, updatedData);
  } catch (error) {
    console.error("Error updating entry: ", error);
    throw error;
  }
};

/**
 * Delete an entry (Hamesha ke liye Delete)
 * @param {string} id - Document ID
 */
export const deleteEntry = async (id) => {
  try {
    const entryDoc = doc(db, "entries", id);
    await deleteDoc(entryDoc);
  } catch (error) {
    console.error("Error deleting entry: ", error);
    throw error;
  }
};
