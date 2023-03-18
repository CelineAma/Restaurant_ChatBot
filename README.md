# Restaurant_ChatBot

This Restaurant ChatBot ia categorized as a web-based conversational interface that enables consumers to engage with the restaurant's menu and make orders via a sequence of prompts and responses.

---

## Built with the combination of Front-end and Backend technologies:

- HTML & CSS
- Javascript
- NodeJs
- Express Js
- MongoDB
- Express-Session

---

## Requirements

- ChatBot interface would be like a chat interface
- No need for authentication but we should be able to store user session based on devices
- When a customer lands on the chatbot page, the bot should send these options to the customer:
  - Select 1 to Place an order
  - Select 99 to checkout order
  - Select 98 to see order history
  - Select 97 to see current order
  - Select 0 to cancel order
- When a customer selects “1”, the bot should return a list of items from the restaurant. It is up to you to create the items in your restaurant for the customer. The order items can have multiple options but the customer should be able to select the preferred items from the list using this same number select system and place an order.
- When a customer selects “99” out an order, the bot should respond with “order placed” and if none the bot should respond with “No order to place”. Customer should also see an option to place a new order
- When a customer selects “98”, the bot should be able to return all placed order
- When a customer selects “97”, the bot should be able to return current order
- When a customer selects “0”, the bot should cancel the order if there is.


<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Setup

- Clone the repo
  ```sh
  git clone https://github.com/CelineAma/Restaurant_ChatBot
  ```
- Install NPM packages
  ```sh
  npm install
  ```
- create your `.env` . use the .example.env as a guide
  ```js
  PORT = 
  MONGODB_CONNECTION_URL = ""
  SESSION_SECRET = ""
  COOKIE_EXPIRES_IN = ""
  ```
- Start your server with node

  ```
  npm run start
  ```

  or with nodemon on development

  ```
  npm run start:dev
  ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Base URL

- [My Restaurant ChatBot base URL](https://celine-restaurant-chatbot.onrender.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Acknowledgement

- [AltschoolAfrica](https://www.altschoolafrica.com/)

---

## Contributor

- Amarachi Celine Arinze

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---
