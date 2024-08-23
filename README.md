# 🎮 GameHub

Welcome to **GameHub**, a platform where you can stream like on Twitch! GameHub is a live streaming platform focused on video games and related content, where users can watch and broadcast in real time, interact with other viewers and creators, and follow their favorite streamers.

## 🚀 Features

- **Live Streaming**: Broadcast your gameplay or watch others in real time.<br>
- **User Authentication**: Secure and seamless sign-in/sign-up using Clerk.<br>
- **Real-time Interaction**: Chat and interact with streamers and other viewers.<br>
- **Follow Streamers**: Keep up with your favorite streamers by following them.<br>
- **Responsive Design**: Tailwind CSS ensures a great user experience on any device.<br>

## 🛠️ Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation.<br>
- **Clerk**: Authentication and user management.<br>
- **Vercel**: Hosting and deployment.<br>
- **React**: JavaScript library for building user interfaces.<br>
- **TypeScript**: Superset of JavaScript for static type checking.<br>
- **Tailwind CSS**: Utility-first CSS framework for styling.<br>
- **Firebase**: Backend services for real-time data and storage.<br>

## 📦 Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) and npm installed<br>
- [Firebase](https://firebase.google.com/) project setup<br>
- [Clerk](https://clerk.dev/) project setup<br>
- [Livekit](https://livekit.io/) project setup<br>

### Installation

1. **Clone the repository**:<br>
   ```sh
   git clone https://github.com/BrayanZv243/twitch-clone-gamehub.git
   cd gamehub
2. **Install dependencies**:<br>
   ```sh
   npm install
3. **Configure environment variables**:<br>
Create a .env file in the root directory and add your Clerk, Firebase, Livekit and Uploadthing configuration:
   ```sh
   # Clerk Settings
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_clerk_publishable_key
    
   # Clerk redirects
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    
   # Firebase keys
   NEXT_PUBLIC_FIREBASE_API_KEY=your_public_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_public_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_public_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_public_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_public_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_public_firebase_app_id
    
   # Livekit keys
   LIVEKIT_API_URL=your_livekit_api_url
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   NEXT_PUBLIC_LIVEKIT_WS_URL=your_livekit_public_ws_url
    
   # Upload things
   UPLOADTHING_SECRET=your_uploadthing_secret_key
   UPLOADTHING_APP_ID=your_uploadthing_app_id


### Running the Application

1. **Start the development server**:<br>
   ```sh
   npm run dev
2. **Open your browser and navigate to**:<br>
   ```sh
   http://localhost:3000

## 🌐 Deployment
- **Connect your GitHub repository** to Vercel. <br>
- **Set up your environment variables** on Vercel.<br>
- **Deploy** your application.<br>

For more detailed instructions, refer to the [Vercel documentation](https://vercel.com/docs).

## 📧 Contact
For any questions or suggestions, please feel free to open an issue or contact me at zavala_243@hotmail.com.
