# AI-Powered Resume Prep Interview Simulation

## Description

A full-stack web application that helps users prepare for job interviews by allowing them to upload their resumes and engage in AI-powered chat simulations based on their documents. The app uses Retrieval-Augmented Generation (RAG) to provide context-aware responses tailored to the user's uploaded content.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Document Upload**: Support for PDF and other document formats with cloud storage
- **AI Chat Interface**: Interactive chat with Google's Gemini AI model
- **RAG Integration**: Context-aware responses using document embeddings and cosine similarity
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **File Management**: Upload, list, and delete documents securely
- **Rate Limiting**: Protection against abuse with Express rate limiting

## Tech Stack

### Backend
- **Node.js** with **Express.js** for the server framework
- **MongoDB** with **Mongoose** for database management
- **JWT** for authentication and session management
- **Multer** for handling file uploads
- **Cloudinary** for cloud-based file storage
- **Google Generative AI (Gemini)** for AI chat functionality
- **pdf-parse** for extracting text from PDF documents
- **bcryptjs** for password hashing
- **CORS** for cross-origin resource sharing
- **Express Rate Limit** for API protection

### Frontend
- **React 19** with **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for making HTTP requests to the backend
- **Tailwind CSS** for styling and responsive design
- **React Hot Toast** for user notifications
- **React Dropzone** for drag-and-drop file uploads
- **Context API** for state management (authentication)

## Prerequisites

- Node.js (version 18 or higher)
- MongoDB (local installation or MongoDB Atlas cloud database)
- Google Gemini API key (from Google AI Studio)
- Cloudinary account for file storage

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-powered-resume-prep
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend/` directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000` (or configured port).

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (default Vite port).

## Usage

1. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`

2. **Create an Account:**
   - Click on "Sign Up" to create a new account
   - Fill in your details and submit

3. **Log In:**
   - Use your credentials to log in to the application

4. **Upload Documents:**
   - Navigate to the Upload page
   - Drag and drop or select PDF files to upload
   - Your documents will be processed and stored securely

5. **Start AI Chat:**
   - Go to the Chat page
   - Ask questions related to job interviews
   - The AI will provide responses based on your uploaded documents using RAG

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List user's documents
- `DELETE /api/documents/:id` - Delete a specific document

### Chat
- `POST /api/chat` - Send a message to the AI chat

## Project Structure

```
ai-powered-resume-prep/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── documents.js
│   │   └── chat.js
│   ├── utils/
│   │   ├── embeddings.js
│   │   └── rag.js
│   ├── index.js
│   ├── package.json
│   └── .env (create this file)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── Chat.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Deployment

### Backend Deployment
- **Recommended Platforms:** Railway, Heroku, or Vercel
- **Database:** Use MongoDB Atlas for production
- Set environment variables in your deployment platform
- Ensure the `NODE_ENV` is set to `production`

### Frontend Deployment
- **Recommended Platform:** Vercel or Netlify
- Build the project: `npm run build`
- Deploy the `dist/` folder
- Configure the API base URL to point to your deployed backend

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Google Generative AI for the Gemini model
- Cloudinary for file storage services
- The open-source community for the various libraries used
