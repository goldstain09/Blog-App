Project Name - "BLOG APP"

Frontend (ReactJS):

Description:
The frontend of the blogging application is built using React, providing an intuitive and user-friendly interface for bloggers. Users can seamlessly create and manage their blogger accounts, personalize profiles by updating profile pictures, names, and biographies. The application supports account security features such as changing passwords and a forget password functionality.

Bloggers can compose engaging posts, each with the flexibility to include images, relevant tags, category assignments, captions, and a captivating title with detailed paragraphs. The platform fosters social interaction by enabling users to like, follow, and comment on blog posts. The search functionality empowers bloggers to discover content based on categories, tags, or specific bloggers.

The frontend ensures a dynamic and responsive experience, allowing users to edit and modify their blog posts with ease. The application seamlessly integrates with Firebase Storage for image storage, providing a visually appealing environment for bloggers to express themselves and connect with a wider audience.

Installation & Usage Steps:
cd Blog_app_Frontend
npm install
npm start

but before this you need to start backend server OR
create build by using "npm run build", and set it in backend's /View;

Folder Structure:
└── /src
├── /components- Contains reusable React components and their corresponding SCSS files.
| ├──/SCSS- Holds SCSS files for styling.
| | ├──Component1.scss
| | ├──Component2.scss
| | └── ...
│ ├── Component1.jsx
│ ├── Component2.jsx
│ └── ...
├── /media- Stores main images and logos used in the application.
│ ├── image1.jpg
│ ├── image2.png
│ └── ...
├── /pages- Holds components specific to each route/page along with their SCSS files.
| ├──/SCSS- Holds SCSS files for styling.
| | ├──Page1.scss
| | ├──Page2.scss
| | └── ...
│ ├── Page1.jsx
│ ├── Page2.jsx
│ └── ...
├── /redux- Manages state using Redux and Redux Saga.
│ ├── /actions- Contains Redux action creators.
│ ├── /constants- Defines action types and constants.
│ ├── /reducers- Implements Redux reducers.
│ ├── /sagas- Manages Redux Sagas for asynchronous actions.
│ ├── /services- Contains service files for API interactions.
│ └── store.js- Configures the Redux store.
├── /utils- Includes utility file, such as the Firebase configuration file.
│ └── firebaseConfig.js
├── index.js- Main entry point for React application.
└── router.js- Manages all routes within application.

Technologies used (Frontend)

- React
- React-Redux
- Redux Saga {Toolkit}
- React Router Dom
- Axios
- SCSS
- Firebase Storage

Dependencies:
"axios": "^1.6.0",
"firebase": "^10.6.0",
"react": "^18.2.0",
"react-dom": "^18.2.0",
"react-redux": "^8.1.3",
"react-router-dom": "^6.17.0",
"react-scripts": "5.0.1",
"react-spinners": "^0.13.8",
"redux": "^4.2.1",
"redux-saga": "^1.2.3",
"sass": "^1.69.5"

Backend (NodeJS & ExpressJS) Database- MongoDB:

Description:
The backend of the blogging application is implemented using the MERN stack, with Express.js and Node.js handling the server-side logic. Authentication is secured through the use of JWT (JSON Web Tokens) for user authorization, while bcrypt encryption safeguards user passwords.

MongoDB Atlas serves as the database for the application, and Mongoose is utilized for seamless interaction with the database. The database stores user account information, blog posts, comments, and other relevant data. Mongoose provides a robust and flexible way to define data models and execute queries.

Firebase Storage is integrated for efficient storage and retrieval of blog post images, seamlessly working alongside MongoDB Atlas. The backend API endpoints manage user account operations, including account creation, modification, and password management. Blog posts and associated metadata are stored and retrieved through Mongoose queries.

The application's architecture allows for seamless integration with the frontend, enabling smooth user interactions and real-time updates. The backend employs robust security measures, ensuring the integrity and confidentiality of user data. The combination of MongoDB Atlas and Mongoose provides a scalable and performant solution for data storage and retrieval in the context of the blogging platform.

Installation & Usage Steps:
cd Blog_app_Backend
npm install
npm run dev

Before starting server make your build in View folder is up to date or not!

Folder Structure:
├── /Controller- Contains API routes functions.
│ ├── user.js
│ ├── post.js
│ └── ... Files for handling specific API routes.
├── /Middleware- Manages authentication.
│ └── auth.js- Handles authentication logic.
├── /Model- Contains schema files for database interactions.
│ ├── user.js
│ ├── post.js
│ └── ... Files defining data models.
├── /Routes- Manages route files.
│ ├── user.js
│ ├── post.js
│ └── ... Files defining API routes.
├── /View- Static folder containing React build files.
│ └── (React Build Files)
├── index.js- Main entry point for the backend server.
└── ...

Technologies used (Backend)

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Tokens)
- Bcrypt

Dependencies:
"bcrypt": "^5.1.1",
"cors": "^2.8.5",
"dotenv": "^16.3.1",
"express": "^4.18.2",
"jsonwebtoken": "^9.0.2",
"mongodb": "^6.2.0",
"mongoose": "^8.0.0",
"nodemailer": "^6.9.7",
"otp-generator": "^4.0.1"
