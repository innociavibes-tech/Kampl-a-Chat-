import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const status = document.getElementById("firebase-status");

async function testFirebase() {
    try {
        const testRef = doc(db, "appSettings", "connectionTest");

        await getDoc(testRef);

        status.textContent = "Firebase connected successfully!";
        status.style.color = "#36d98a";

        console.log("Firebase connection successful", auth, db);

    } catch (error) {
        status.textContent = "Connection error: " + error.message;
        status.style.color = "#ff7777";

        console.error(error);
    }
}

testFirebase();
