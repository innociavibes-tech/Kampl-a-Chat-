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

let allUsers = [];

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.replace("login.html");
        return;
    }

    try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
            usersList.textContent = "Your profile could not be found.";
            return;
        }

        const profile = profileSnapshot.data();

        document.getElementById("myName").textContent = profile.fullName;
        document.getElementById("myUsername").textContent =
            "@" + profile.username;

        document.getElementById("myAvatar").textContent =
            profile.fullName.charAt(0).toUpperCase();

        await loadUsers(user.uid);

    } catch (error) {
        console.error(error);
        usersList.textContent = "Unable to load users. Please try again.";
    }
});

async function loadUsers(currentUserId) {

    const snapshot = await getDocs(collection(db, "users"));

    allUsers = snapshot.docs
        .filter(item => item.id !== currentUserId)
        .map(item => item.data());

    displayUsers(allUsers);
}

function displayUsers(users) {

    usersList.innerHTML = "";

    if (users.length === 0) {
        usersList.textContent = "No other users yet.";
        return;
    }

    users.forEach(user => {

        const item = document.createElement("div");
        item.className = "user-item";

        const avatar = document.createElement("div");
        avatar.className = "user-avatar";
        avatar.textContent = user.fullName.charAt(0).toUpperCase();

        const details = document.createElement("div");
        details.className = "user-details";

        const name = document.createElement("h4");
        name.textContent = user.fullName;

        const username = document.createElement("p");
        username.textContent = "@" + user.username;

        details.append(name, username);
        item.append(avatar, details);

        item.addEventListener("click", () => {
    openChatWindow(user);
});
        });

        usersList.appendChild(item);
    });
}

searchUsers.addEventListener("input", () => {

    const search = searchUsers.value.toLowerCase();

    const filtered = allUsers.filter(user =>
        user.fullName.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search)
    );

    displayUsers(filtered);
});

document.getElementById("logoutBtn").addEventListener("click", async () => {

    try {
        await signOut(auth);
        window.location.replace("login.html");
    } catch (error) {
        alert("Unable to log out. Please try again.");
    }

});
