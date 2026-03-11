# WhereWeGo 🌍

WhereWeGo is an intelligent, personalized India travel recommender application. It suggests places to visit based on user interests, the type of company (family, couple, friends), and previously visited places. The app integrates heavily with Google Maps to provide an interactive, location-based experience.

## 🚀 Features
- **Personalized Recommendations:** Get travel suggestions based on your specific interests and group type.
- **Interactive Maps:** View recommended locations directly on an integrated map.
- **Reviews & Ratings:** Leave reviews for places you've visited and see feedback from other travelers.
- **Visited Tracking:** Keep track of the places you've already explored to get fresh recommendations for your next trip.

---

## 🛠 Technology Stack

### Frontend (Mobile App)
The frontend is a cross-platform mobile application built using modern React Native tools.
* **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
* **Navigation:** [React Navigation](https://reactnavigation.org/) (Stack Navigation)
* **Maps:** `react-native-maps` for interactive map integration
* **Location Services:** `expo-location` for handling user geolocation
* **API Communication:** `axios`
* **Icons:** `lucide-react-native`

### Backend (API Server)
The backend is a robust RESTful API that handles user data, location management, and the recommendation engine.
* **Environment:** [Node.js](https://nodejs.org/)
* **Framework:** [Express.js](https://expressjs.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) ODM
* **External Services:** `@googlemaps/google-maps-services-js` for Places and Geocoding APIs
* **Authentication:** `jsonwebtoken` (JWT) for secure user sessions
* **Environment Config:** `dotenv`

---

## 📂 Project Structure

- `/frontend` - Contains the React Native Expo application source code.
- `/backend` - Contains the Express.js server, MongoDB models, routes, and API logic.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance running
- Google Maps API Key

### Setup Backend
1. Navigate to `backend/`
2. Run `npm install`
3. Create a `.env` file with your config
4. Run `npm run dev` to start the server

### Setup Frontend
1. Navigate to `frontend/`
2. Run `npm install`
3. Run `npm start` to start the Expo bundler
