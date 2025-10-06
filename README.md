# EcoTracker - Carbon Footprint Tracker

A beautiful and intuitive web application that helps users track their carbon footprint by logging daily activities and provides personalized eco-tips to promote sustainable living.

## 🌱 Features

- **Activity Logging**: Track daily activities across different categories (Transport, Food, Energy, Lifestyle)
- **Real-time CO₂ Calculations**: Automatic emission calculations based on scientific data
- **Interactive Dashboard**: Beautiful charts and analytics showing your environmental impact
- **Gamification**: Badge system to encourage sustainable behaviors
- **Personalized Tips**: AI-powered eco-tips based on your activity patterns
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React integration
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd eco-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config to `src/firebase.js`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Firebase Setup

1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Update the Firebase configuration in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth.js          // Login/Signup component
│   ├── Dashboard.js     // Main dashboard with charts and analytics
│   ├── LogActivity.js   // Activity logging form
│   └── Badges.js        // Gamification and achievements
├── utils/
│   └── calculations.js  // CO₂ calculation logic and eco-tips
├── firebase.js          // Firebase configuration
├── App.js               // Main app component with routing
├── index.js             // Entry point
└── index.css            // Tailwind CSS and custom styles
```

## 🎯 Key Components

### Dashboard
- Real-time emission tracking
- Interactive charts (Line, Pie, Bar)
- Category breakdown
- Personalized eco-tips
- Carbon footprint score

### Activity Logging
- Intuitive category selection
- Real-time emission preview
- Smart form validation
- Quick tips and suggestions

### Badge System
- Achievement tracking
- Progress indicators
- Motivational rewards
- Social sharing potential

## 🌍 Environmental Impact Categories

### Transport
- Car, Bus, Train, Plane
- Motorcycle, Bicycle, Walking
- Electric vehicles

### Food
- Meat (Beef, Lamb, Chicken, Fish)
- Dairy (Cheese, Eggs)
- Plant-based (Vegetables, Fruits, Tofu, Nuts)

### Energy
- Electricity consumption
- Gas usage
- Heating oil

### Lifestyle
- Clothing purchases
- Electronics
- Plastic bags
- Paper usage

## 📊 CO₂ Calculation Methodology

The app uses scientifically-backed emission factors:
- Transport: kg CO₂ per kilometer
- Food: kg CO₂ per kilogram
- Energy: kg CO₂ per kWh
- Lifestyle: kg CO₂ per item/unit

## 🎨 Design Features

- **Modern UI/UX**: Clean, intuitive interface
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant
- **Dark Mode Ready**: Prepared for dark theme
- **Smooth Animations**: Enhanced user experience

## 🏆 Badge System

- **First Steps**: Log your first activity
- **Week Warrior**: 7 consecutive days of logging
- **Low Carbon Champion**: Keep emissions under 10kg/day for a week
- **Transport Hero**: Use sustainable transport 10 times
- **Plant Power**: Choose plant-based options 20 times

## 🔮 Future Enhancements

- Social features and leaderboards
- Carbon offset recommendations
- Integration with smart devices
- Advanced analytics and predictions
- Multi-language support
- Carbon footprint sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MLH (Major League Hacking) for inspiration
- Firebase for backend services
- Tailwind CSS for styling framework
- Chart.js for data visualization
- Lucide for beautiful icons

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

**Made with 🌱 for a sustainable future**
