const messages = document.getElementById("messages");

const input = document.getElementById("messageInput");

function sendMessage() {

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    const message = document.createElement("div");

    message.className = "message sent";

    message.textContent = text;

    messages.appendChild(message);

    input.value = "";

    messages.scrollTop = messages.scrollHeight;

}

input.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});


function openChat(name) {

    document.getElementById("chatName").textContent = name;

    document.getElementById("chatAvatar").textContent =
        name.charAt(0).toUpperCase();

    messages.innerHTML = "";

}
