// import e from "express";
import {io} from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"; //"socket.io-client";
import { options } from "../app";

const chatBox = document.getElementById("chat-box");
const formChat = document.getElementById("form-chat");
const inputChat = document.getElementById("input-chat");

//connect client to the server
const socket = io("https://celine-restaurant-chatbot.onrender.com");

//listen to the connect socket event
socket.on("connect", () => {
    console.log(socket.id);
});

formChat.addEventListener("submit", function(e){
e.preventDefault();
console.log("clicked")

const inputChatMessage = inputChat.value;
displayMessage(inputChatMessage, false); 
inputChat.value = "";

})

function displayMessage(message, isBotMessage){
    const chatBubble = document.createElement("div");
    chatBubble.className = `chat-bubble chat-bubble-${isBotMessage?"bot" : "user"}`
    chatBubble.innerHTML = message;
    chatBox.appendChild(chatBubble);
}


//listening to the option event after emitting
socket.on("options", (options) => {
const optionsHtml = options.map(options => `<ul><li>${options}</li></ul>`).join("");
displayMessage(optionsHtml, true)
});



// function processMessage(message) {
//     // retrieve the user's session
//     const session = getSession(message.from);
  
//     // check which option the user selected
//     const selectedOption = parseInt(message.text);
//     let response;
  
//     switch (selectedOption) {
//       case 0:
//         // cancel order
//         response = "Order cancelled";
//         delete session.order;
//         break;
//       case 1:
//         // get list of items
//         const menu = JSON.parse(fs.readFileSync('menu.json'));
//         response = "Please select an item from the menu:\n";
//         menu.forEach(item => {
//           response += `${item.number}. ${item.name}\n`;
//         });
//         break;
//       case 97:
//         // view current order
//         if (session.order) {
//           response = "Current order:\n";
//           session.order.forEach(item => {
//             response += `${item.name} - ${item.price}\n`;
//           });
//         } else {
//           response = "No order to display";
//         }
//         break;
//       case 98:
//         // view order history
//         if (session.orderHistory) {
//           response = "Order history:\n";
//           session.orderHistory.forEach(order => {
//             response += `${order.timestamp}\n`;
//             order.items.forEach(item => {
//               response += `${item.name} - ${item.price}\n`;
//             });
//           });
//         } else {
//           response = "No order history to display";
//         }
//         break;
//       case 99:
//         // place order
//         if (session.order) {
//           if (!session.orderHistory) {
//             session.orderHistory = [];
//           }
//           session.orderHistory.push({
//             timestamp: new Date(),
//             items: session.order
//           });
//           response = "Order placed";
//           delete session.order;
//         } else {
//           response = "No order to place";
//         }
//         break;
//       default:
//         // invalid option
//         response = "Invalid option selected";
//         break;
//     }
  
//     // update the user's session
//     updateSession(message.from, session);
  
//     return response;
//   }
  