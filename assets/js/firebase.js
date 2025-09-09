// Firebase Configuration and Initialization
// Replace the config object below with your actual Firebase config

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase configuration object
// TODO: Replace this with your actual Firebase config
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Collections
const STUDIES_COLLECTION = 'studies';

// Firebase service functions
export const firebase = {
    // Firestore operations
    async addStudy(studyData) {
        try {
            const docRef = await addDoc(collection(db, STUDIES_COLLECTION), {
                ...studyData,
                date: studyData.date || new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding study:', error);
            throw error;
        }
    },

    async getStudies() {
        try {
            const q = query(collection(db, STUDIES_COLLECTION), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const studies = [];
            querySnapshot.forEach((doc) => {
                studies.push({ id: doc.id, ...doc.data() });
            });
            return studies;
        } catch (error) {
            console.error('Error getting studies:', error);
            throw error;
        }
    },

    async updateStudy(studyId, updateData) {
        try {
            const studyRef = doc(db, STUDIES_COLLECTION, studyId);
            await updateDoc(studyRef, updateData);
        } catch (error) {
            console.error('Error updating study:', error);
            throw error;
        }
    },

    async deleteStudy(studyId) {
        try {
            await deleteDoc(doc(db, STUDIES_COLLECTION, studyId));
        } catch (error) {
            console.error('Error deleting study:', error);
            throw error;
        }
    },

    // Storage operations
    async uploadFile(file, fileName) {
        try {
            const storageRef = ref(storage, `studies/${fileName}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    async deleteFiles(fileURLs) {
        try {
            const deletePromises = fileURLs.filter(url => url).map(url => {
                const urlObj = new URL(url);
                const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/);
                if (pathMatch) {
                    const filePath = decodeURIComponent(pathMatch[1]);
                    const fileRef = ref(storage, filePath);
                    return deleteObject(fileRef);
                }
                return Promise.resolve();
            });
            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error deleting files:', error);
            throw error;
        }
    },

    // Utility functions
    generateFileName(originalName, studyId) {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        return `${studyId}_${timestamp}.${extension}`;
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Export database and storage instances for direct access if needed
export { db, storage };
