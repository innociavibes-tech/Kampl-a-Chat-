import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const usersList = document.getElementById("usersList");
const searchUsers = document.getElementById("searchUsers");
const peopleCount = document.getElementById("peopleCount");
const logoutBtn = document.getElementById("logoutBtn");

let allUsers = [];

onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
        window.location.replace("login.html");
        return;
    }

    try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
            usersList.textContent = "Your profile could not be found.";
            peopleCount.textContent = "";
            return;
        }

        await loadPeople(currentUser.uid);

    } catch (error) {
        console.error("People page error:", error);
        usersList.textContent = "Unable to load people. Please try again.";
    }
});

async function loadPeople(currentUserId) {
    const snapshot = await getDocs(collection(db, "users"));

    allUsers = snapshot.docs
        .filter(item => item.id !== currentUserId)
        .map(item => ({
            id: item.id,
            ...item.data()
        }));

    displayPeople(allUsers);
}

function displayPeople(users) {
    usersList.innerHTML = "";

    peopleCount.textContent = users.length + " people found";

    if (users.length === 0) {
        usersList.textContent = "No other registered users yet.";
        return;
    }

    users.forEach(user => {
        const card = document.createElement("article");
        card.className = "person-card";

        const avatar = document.createElement("div");
        avatar.className = "person-avatar";

        const fullName = user.fullName || "User";
        avatar.textContent = fullName.charAt(0).toUpperCase();

        const name = document.createElement("h3");
        name.textContent = fullName;

        const username = document.createElement("p");
        username.textContent = "@" + (user.username || "unknown");

        const status = document.createElement("span");
        status.className = "person-status";

        if (user.online === true) {
            status.textContent = "● Online";
            status.classList.add("online");
        } else {
            status.textContent = "● Offline";
        }

        const messageButton = document.createElement("button");
        messageButton.className = "person-message-button";
        messageButton.textContent = "Message";

        messageButton.addEventListener("click", () => {
            alert("Next, we will connect this button to private messaging.");
        });

        card.append(avatar, name, username, status, messageButton);
        usersList.appendChild(card);
    });
}

searchUsers.addEventListener("input", () => {
    const search = searchUsers.value.toLowerCase().trim();

    const filteredUsers = allUsers.filter(user =>
        (user.fullName || "").toLowerCase().includes(search) ||
        (user.username || "").toLowerCase().includes(search)
    );

    displayPeople(filteredUsers);
});

logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("login.html");
});
