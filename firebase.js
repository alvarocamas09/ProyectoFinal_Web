import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQ6uoBFY6gcx9EUnf3Nil2fNidBevUgIE",
    authDomain: "snake-web-b8c54.firebaseapp.com",
    projectId: "snake-web-b8c54",
    storageBucket: "snake-web-b8c54.firebasestorage.app",
    messagingSenderId: "95897994781",
    appId: "1:95897994781:web:af6232fee9ab4efd60a8f4"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveScore(name, score, time) {
    try {
        await addDoc(collection(db, "scores"), {
            name: name.trim().substring(0, 16),
            score: score,
            time: time,
            date: new Date().toISOString()
        });
    } catch (e) {
        alert("Error al guardar puntuación");
    }
}

export function listenRanking(callback) {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(20));
    onSnapshot(q, (snapshot) => {
        const ranking = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            ranking.push({
                name: d.name,
                score: d.score,
                time: d.time
            });
        });
        callback(ranking);
    });
}
