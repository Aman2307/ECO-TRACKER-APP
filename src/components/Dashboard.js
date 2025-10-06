import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { 
  calculateTimeframeTotals, 
  getCategoryBreakdown, 
  calculateFootprintScore,
  getEcoTips 
} from '../utils/calculations';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Calendar, 
  Target, 
  Lightbulb,
  Activity,
  Zap,
  Car,
  Apple,
  ShoppingBag,
  LogOut
} from 'lucide-react';

const Dashboard = ({ user, setUser, activities, setActivities, loadActivities }) => {
  const [timeframe, setTimeframe] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [ecoTips, setEcoTips] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (activities && activities.length > 0) {
      const tips = getEcoTips(activities, calculateTimeframeTotals(activities, 'daily'));
      setEcoTips(tips);
    }
  }, [activities]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActivities([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const totalEmissions = calculateTimeframeTotals(activities, timeframe);
  const categoryBreakdown = getCategoryBreakdown(activities);
  const footprintScore = calculateFootprintScore(totalEmissions, timeframe);

  // Chart data for category breakdown - separate large and small categories
  const allCategories = Object.entries(categoryBreakdown)
    .filter(([category, emissions]) => emissions > 0);
  
  const totalEmissionsForChart = allCategories.reduce((sum, [, emissions]) => sum + emissions, 0);
  
  // Separate categories into main (>= 5%) and other (< 5%)
  const mainCategories = [];
  let otherEmissions = 0;
  
  allCategories.forEach(([category, emissions]) => {
    const percentage = (emissions / totalEmissionsForChart) * 100;
    if (percentage >= 5) {
      mainCategories.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        emissions: parseFloat(emissions.toFixed(2))
      });
    } else {
      otherEmissions += emissions;
    }
  });
  
  // Add "Other" category if there are small categories
  const categoryData = [...mainCategories];
  if (otherEmissions > 0) {
    categoryData.push({
      category: 'Other',
      emissions: parseFloat(otherEmissions.toFixed(2))
    });
  }

  // Chart colors
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

  // Weekly trend data (Monday to Sunday)
  const getWeeklyTrendData = () => {
    const data = [];
    const today = new Date();
    
    // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = today.getDay();
    
    // Calculate days since Monday (if today is Sunday, go back 6 days; otherwise go back currentDay - 1 days)
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Start from Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday);
    
    // Generate data for Monday through Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date.seconds ? activity.date.seconds * 1000 : activity.date);
        return activityDate.toDateString() === date.toDateString();
      });
      
      const dayEmissions = dayActivities.reduce((total, activity) => total + activity.emissions, 0);
      
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        emissions: parseFloat(dayEmissions.toFixed(2)),
        date: date.toISOString().split('T')[0],
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  };

  const weeklyTrendData = getWeeklyTrendData();

  const getCategoryIcon = (category) => {
    const icons = {
      transport: <Car className="h-5 w-5" />,
      food: <Apple className="h-5 w-5" />,
      energy: <Zap className="h-5 w-5" />,
      lifestyle: <ShoppingBag className="h-5 w-5" />
    };
    return icons[category] || <Activity className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Track your carbon footprint and environmental impact</p>
          </div>
          <button
            onClick={() => {
              loadActivities();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

        {/* Timeframe Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeframe === period
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmissions.toFixed(2)} kg CO₂</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Footprint Score</p>
                <p className="text-2xl font-bold text-gray-900">{footprintScore.toFixed(0)}/100</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activities Logged</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
                <p className="text-xs text-gray-500">Total activities in database</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend (Mon-Sun)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} kg CO₂`, 'Emissions']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="emissions" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent, value }) => {
                    // Only show labels for slices with more than 5% to avoid overlapping
                    if (percent < 0.05) return '';
                    return `${category} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="emissions"
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value.toFixed(2)} kg CO₂`, name]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value}: {entry.payload.emissions.toFixed(2)} kg CO₂
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(categoryBreakdown).map(([category, emissions], index) => (
              <div key={category} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: `${COLORS[index]}20` }}>
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                    <p className="text-2xl font-bold text-gray-900">{emissions.toFixed(2)} kg</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(emissions / Math.max(...Object.values(categoryBreakdown))) * 100}%`,
                      backgroundColor: COLORS[index]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Personalized Eco Tips</h3>
          </div>
          <div className="space-y-4">
            {ecoTips.slice(0, 3).map((tip, index) => (
              <div key={tip.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                    tip.priority === 'high' ? 'bg-red-500' : 
                    tip.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{tip.description}</p>
                    <p className="text-green-700 text-sm font-medium">{tip.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
