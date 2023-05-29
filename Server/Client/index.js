import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"; //"socket.io-client";

const chatSpace = document.getElementById("chat-box");
const chatInput = document.getElementById("form-chat");
const chatField = document.getElementById("input-chat");

const options = [
  "Select 1 to Place an order",
  "Select 99 to checkout order",
  "Select 98 to see order history",
  "Select 97 to see current order",
  "Select 0 to cancel order",
];

//connect client to the server
const socket = io("https://celine-restaurant-chatbot.onrender.com");
// const socket = io("http://localhost:3000");

function scrollToBottom() {
  chatSpace.scrollTo({
    top: chatSpace.scrollHeight,
    behavior: "smooth",
  });
}

function renderMessage(message, isBotMsg) {
  const chatBubble = document.createElement("div");
  chatBubble.className = `chat-bubble chat-bubble-${isBotMsg ? "bot" : "user"}`;
  chatBubble.innerHTML = message;
  chatSpace.insertAdjacentElement("beforeend", chatBubble);
  // Scrolls to the bottom of the chat container
  scrollToBottom();
  //   Save to DB
}

function renderOptions() {
  const chatMsg = `<ul>${options
    .map((option) => `<li>${option}</li>`)
    .join("")}</ul>`;
  renderMessage(chatMsg, true);
}

function renderMenu(menu) {
  const chatMsg = `<ol start="2">${menu
    .map(
      (item) => `<li>
      <span>${item.name}</span> - ${item.price} NGN - <span>${item.description}</span>
    </li>`
    )
    .join("")}</ul>`;
  renderMessage(chatMsg, true);
}

function renderCurrentOrder(data) {
  const chatMsg = `<div class="order">
    <h3>Current Order</h3>
    <ul>
    ${data.order
      .map(
        (item) => `<li>
    <span class="order__name">${item.name}</span>
    <span class="order__price">₦${item.price}</span>
  </li>`
      )
      .join("")}
    </ul>
    <div class="order__total">
      <span>Total:</span>
      <span>₦${data.total}</span>
    </div>`;
  renderMessage(chatMsg, true);
}

function renderOrderHistory(orders) {
  const chatMsg = orders
    .map(
      (order) => `<div class="order__history">
    ${order.order
      .map(
        (item) => `<div class="item">${item.name}</div>
    <div class="price">₦${item.price}</div>
    <div class="details">
      <span>Description:</span> ${item.description}<br />
    </div>`
      )
      .join("")}
  </div>`
    )
    .join("");
  renderMessage(chatMsg, true);
}

//listen to the connect socket event
socket.on("connect", () => {
  console.log(socket.id);
  renderOptions();
});

socket.on("botResponse", ({ type, data }) => {
  switch (type) {
    case "menu":
      renderMenu(data.menu);
      break;

    case "checkout":
      renderMessage(data.text, true);
      renderOptions(options);
      break;

    case "currentOrder":
      renderCurrentOrder(data);
      renderMessage("Select 99 to checkout your order.", true);
      break;

    case "orderHistory":
      renderOrderHistory(data.orders);
      break;

    case "unknownInput":
      renderMessage(data.text, true);
      renderOptions(options);
      break;

    default:
      renderMessage(data.text, true);
      break;
  }
});

chatInput.addEventListener("submit", function (e) {
  e.preventDefault();
  const msg = chatField.value.trim();
  chatField.value = "";
  socket.emit("sendOption", msg);
  renderMessage(msg, false);
});
