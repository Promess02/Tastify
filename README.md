# Recipe App

This project is a Recipe App that allows users to browse, like, and manage recipes. It includes a backend server and a frontend React application.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js
- npm (Node Package Manager)
- sqlite3

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Promess02/Tastify.git
   cd Tastify

2. **Install all packages:**
    ```sh
    cd backend
    npm i .
    cd ../middleware
    npm i .
    cd ../recipe-app
    npm i .

3. **Running the backend server:**
    ```sh
    cd backend
    node server.js

4. **Running the frontend app:**
    ```sh
    cd recipe-app
    npm start

5. **Running the database (optional):**
    ```sh
    sqlite3 recipeApp.db

6. **Check the Swagger API documentation on http://localhost:4000/api-docs (optional).**

7. **Running the app from docker (optional):**
- make sure nothing is running on ports 3000 and 4000
- run docker daemon 
- build docker image from project root folder:
```sh
    docker build -t tastify-app .
```
- run docker container
```sh
    docker run -p 4000:4000 -p 3000:3000 tastify-app
```
- check if container is running 
```sh
    docker ps
```
- Access the frontend at localhost:3000 and server at localhost:4000
8. **Login as an admin to check full project functionality:**
- click Login button
- enter email: admin@gmail.com and password: admin
- enjoy all the app features including user and recipe management