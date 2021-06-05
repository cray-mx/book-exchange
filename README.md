# A Textbook Exchange Web Application
## Overview
The purpose of our website is to create an open platform that allows students to resell and purchase used textbooks and other school accessories. Reselling is definitely beneficial because it saves money for both the seller and the buyer, but sometimes it’s difficult to match the supply and demand of a specific used item. Our website helps students to easily find thosed used school supplies and contact with sellers/buyers.

## Main Features
- Sign up, Login/Logout, User Profile
- Password Recovery: a user can reset his/her password at the recovery page by entering a valid authentication code sent to his/her email

- Create Post: users can create a post for the items they want to sell
- Search for Post: users can search for items they want to buy

- Shopping Cart: users can add the items they interested in to their shopping carts
- Purchase: users will be directed to a payment page when they purchase an item
- View Transaction: users can view their past transactions and the status of each transaction which is marked as (1) complete, (2) pending (if the transaction is still under review by System Admin), or (3) rejected (if the transaction is denied by Admin).

- Chatbox: users can search for other users and chat with each other through chatbox

# Deployment Instructions
This program use Node.js environment and requires a MongoDB connection, and a token to use email sending services from SendGrid. The link to database should be stored into an enviromental variable $DATABASE_TOKEN. And the SendGrid API Key should be stored in an environmental variable $EMAIL_TOKEN. 

You should also specify the port in the environment variable $PORT. If not specified, the server will be listening on port 3000 for debugging purpose.

Then running app.js with Node.js will start the server.


# Copyright:
This README.md is written by @RuiqiW

And the project is written by @Willqie @ericpko @tinally @RuiqiW
