import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


const registerForm = document.getElementById("registerForm");

const loginForm = document.getElementById("loginForm");


// REGISTER USER

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();

        const username = document.getElementById("username").value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("message");

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            message.textContent = "Username must be 3-20 characters. Use letters, numbers or underscores.";
            return;
        }

        if (password.length < 8) {
            message.textContent = "Password must have at least 8 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        let credential = null;
        let reserved = false;

        const usernameRef = doc(db, "usernames", username);

        const internalEmail = username + "@kampla-chat.firebaseapp.com";

        try {

            message.textContent = "Creating your account...";

            credential = await createUserWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

            const uid = credential.user.uid;

            await runTransaction(db, async (transaction) => {

                const existing = await transaction.get(usernameRef);

                if (existing.exists()) {
                    throw new Error("USERNAME_TAKEN");
                }

                transaction.set(usernameRef, {
                    uid: uid,
                    username: username
                });

            });

            reserved = true;

            await setDoc(doc(db, "users", uid), {
                uid: uid,
                fullName: fullName,
                username: username,
                createdAt: new Date().toISOString(),
                online: true
            });

            message.textContent = "Account created successfully!";

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1200);

        } catch (error) {

            if (credential) {

                if (reserved) {
                    try {
                        await deleteDoc(usernameRef);
                    } catch (cleanupError) {
                        console.error(cleanupError);
                    }
                }

                try {
                    await deleteUser(credential.user);
                } catch (cleanupError) {
                    console.error(cleanupError);
                }

            }

            console.error(error);

            message.textContent =
                error.message === "USERNAME_TAKEN"
                ? "Username already exists. Choose another."
                : "Registration failed. Please try again.";

        }

    });

}


// LOGIN USER

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username = document.getElementById("username").value.trim().toLowerCase();

        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            message.textContent = "Enter a valid username.";
            return;
        }

        try {

            message.textContent = "Logging in...";

            const usernameRef = doc(db, "usernames", username);

            const usernameDoc = await getDoc(usernameRef);

            if (!usernameDoc.exists()) {
                throw new Error("INVALID_LOGIN");
            }

            const internalEmail = username + "@kampla-chat.firebaseapp.com";

            await signInWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

            message.textContent = "Login successful!";

            window.location.href = "../index.html";

        } catch (error) {

            console.error(error);

            message.textContent = "Incorrect username or password.";

        }

    });

              }
