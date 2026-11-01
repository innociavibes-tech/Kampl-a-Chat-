import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

function showMessage(text, color = "#ffffff") {
    if (message) {
        message.textContent = text;
        message.style.color = color;
    }
}

// REGISTER
if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return showMessage(
                "Username must be 3–20 characters. Use letters, numbers or underscores.",
                "#ff7777"
            );
        }

        if (password.length < 6) {
            return showMessage("Password must have at least 6 characters.", "#ff7777");
        }

        let newUser = null;

        try {
            showMessage("Creating your account...");

            const internalEmail = username + "@kampalachat-firebaseapp.com";

            const result = await createUserWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

            newUser = result.user;

            await runTransaction(db, async (transaction) => {
                const usernameRef = doc(db, "usernames", username);
                const userRef = doc(db, "users", newUser.uid);

                const usernameSnapshot = await transaction.get(usernameRef);

                if (usernameSnapshot.exists()) {
                    throw new Error("USERNAME_TAKEN");
                }

                transaction.set(usernameRef, {
                    uid: newUser.uid,
                    username: username
                });

                transaction.set(userRef, {
                    uid: newUser.uid,
                    fullName: fullName,
                    username: username,
                    createdAt: serverTimestamp(),
                    online: true
                });
            });

            showMessage("Account created successfully! Welcome.", "#36d98a");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            if (newUser) {
                try {
                    await newUser.delete();
                } catch (deleteError) {
                    console.error("Account cleanup failed:", deleteError);
                }
            }

            console.error(error);

            if (error.message === "USERNAME_TAKEN") {
                showMessage("That username is already taken.", "#ff7777");
            } else {
                showMessage(error.message, "#ff7777");
            }
        }
    });
}

// LOGIN
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return showMessage("Enter a valid username.", "#ff7777");
        }

        try {
            showMessage("Signing in...");

            const usernameRef = doc(db, "usernames", username);
            const usernameSnapshot = await getDoc(usernameRef);

            if (!usernameSnapshot.exists()) {
                return showMessage("Username not found.", "#ff7777");
            }

            const internalEmail = username + "@kampla-chat.firebaseapp.com";

            await signInWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

            showMessage("Login successful!", "#36d98a");

            setTimeout(() => {
                window.location.href = "chat.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            showMessage("Login failed. Check your username and password.", "#ff7777");
        }
    });
          }
