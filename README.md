# Document.io

**Document.io** is a streamlined tool for capturing, annotating, and documenting websites. Whether you’re building tutorials, managing workflows, or documenting app interfaces, document.io makes the process easy and collaborative.

![screely-1736026302681](https://github.com/user-attachments/assets/9391e071-c759-479b-940e-3f2414e3b5c0)

A companion app is required to add and view annotations on websites. [You can find set it up from here.](https://github.com/Sanjay-George/document.io-companion?tab=readme-ov-file#-quick-start)

Live demo: https://document-io.tech/

(The demo is restricted to 'GET' requests. You can't add, update, or delete any documentations)



## 🎯 Motivation

- Simplify the process of documenting web-based workflows, user interfaces, and tutorials.
- Enable teams to share and collaborate on detailed website documentation.
- Provide an easy-to-use platform for knowledge transfer, application onboarding, idea generation and more.

## 🚀 Features

- **Capture Website Components**: Document UI elements on any web page.
- **Quick & Easy Annotations**: Simply right-click on any element and annotate it on the fly!
- **Add Annotations**: Use a Markdown editor to add detailed notes.
- **Collaborative Documentation**: Share your annotations with your team to speed up workflows and clarify designs.
 
## 📦 Getting Started

### Prerequisites
- **Node.js** (v20 or higher preferred): [Download Node.js](https://nodejs.org/)
- **Docker** : [Download Docker](https://www.docker.com/products/docker-desktop/)

### Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Sanjay-George/document.io.git
   cd document.io
   ```

2. **Install dependencies for both backend and frontend:**

   ```bash
   # Install dependencies for the backend
   npm install
   
   # Install dependencies for the frontend
   cd ui
   npm install
   ```

3. **Environment Variables:**

   Copy `.env.example` and create `.env` file,  in root and `ui` folders. Update the values appropriately.


4. **Setup Database with Docker Compose**

   The project includes a `docker-compose.yml` file to set up MongoDB and Mongo Express for database management. You can run this with Docker Compose:

   ```bash
   docker compose up -d mongo mongo-express
   ```

   By default, MongoDB is set up with the username `root` and password `example`. If you want to change the MongoDB password, modify the MONGO_INITDB_ROOT_PASSWORD field in the docker-compose.yml file and update the `.env` file with the new credentials.

5. **Start the development servers:**

   ```bash
   # start node server in root folder
   npm run dev

   # start next server in ./ui
   cd ui
   npm run dev
   ```

   By default, the node server will run on port 5000, and next server on port 3000. If you modify the port of the node server, update `NEXT_PUBLIC_API_URL` variable in `ui/.env` file.

   

7. **Access the application:**
   
   - Visit `http://localhost:3000` to use the application
  


 Enjoy documenting 🎉




<!--

## 📷 Screenshots 

### 1. **Editor in Action**

#### a. Custom Context Menu to Open Editor Panel
*Right-click on the target element on the page to reveal a custom context menu item for annotation.*

![Screenshot 2024-09-16 at 08 31 21](https://github.com/user-attachments/assets/2e5d67f0-70b2-4172-8145-68c0a3495852)

<br />


#### b. Editor Panel
*Once the editor is activated, you can add notes, voice memos, and highlights to any element. The editor is resizable.*

![Screenshot 2024-09-16 at 08 30 52](https://github.com/user-attachments/assets/94498daf-50cf-4d8a-b1eb-517a12ffd5d2)

<br />


### 2. **Collaboration Platform**
*Collaborate with your team seamlessly—share annotations, add comments, and manage documentations together.*


#### a. Landing page

<img width="1426" alt="image" src="https://github.com/user-attachments/assets/0676d1df-721d-4928-9fe8-bc0cde099b1b">

<br />

#### b. Documentations page
![image](https://github.com/user-attachments/assets/c04c5b4e-852f-41d5-a52d-b03ef64d1397)


-->
