// Importing required packages
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

// Define the function to start the server
async function startServer() {
    const app = express();

    // Initialize the Apollo Server
    const server = new ApolloServer({ 
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String!
                website: String!
            }
            type Todo {
                id: ID!
                title: String!
                completed: Boolean
                user: User
                userId: ID!  
            }
            type Query {
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID!): User
            }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => {
                    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`); // Use userId to fetch user
                    return response.data; // Return the user data
                },
            },
            Query: {
                getTodos: async () => 
                    (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
                getAllUsers: async () => 
                    (await axios.get("https://jsonplaceholder.typicode.com/users")).data,
                getUser: async (parent, { id }) => 
                    (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
            },
        },
    });

    // Middleware setup
    app.use(bodyParser.json());
    app.use(cors());

    // Start the Apollo server
    await server.start();

    // Set up the GraphQL endpoint
    app.use("/graphql", expressMiddleware(server));

    // Start listening on port 8000
    app.listen(8000, () => console.log("Server Started at PORT: 8000"));
}

// Start the function to run the server
startServer();
