import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LogActivity from './components/LogActivity';
import Badges from './components/Badges';
import { 
  Home, 
  Plus, 
  Trophy, 
  Menu, 
  X,
  Leaf,
  LogOut
} from 'lucide-react';

// Create Context
const AppContext = createContext();

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      console.log('Loading activities for user:', user.uid);
      
      // Try without orderBy first to see if that's the issue
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Loaded activities:', activitiesData.length, 'activities');
      console.log('Activities data:', activitiesData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  // Add test function to window for debugging
  useEffect(() => {
    window.testFirebase = async () => {
      console.log('Testing Firebase connection...');
      try {
        const { collection, addDoc, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        
        // Test write
        const testDoc = await addDoc(collection(db, 'test'), {
          message: 'Test from browser console',
          timestamp: new Date()
        });
        console.log('Test document written with ID:', testDoc.id);
        
        // Test read
        const testQuery = await getDocs(collection(db, 'activities'));
        console.log('Total activities in database:', testQuery.docs.length);
        testQuery.docs.forEach(doc => {
          console.log('Activity doc:', doc.id, doc.data());
        });
        
        return 'Firebase test completed successfully';
      } catch (error) {
        console.error('Firebase test failed:', error);
        return 'Firebase test failed: ' + error.message;
      }
    };
  }, []);

  const contextValue = {
    user,
    setUser,
    activities,
    setActivities,
    currentView,
    setCurrentView
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EcoTracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth setUser={setUser} />;
  }


  const renderCurrentView = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard user={user} setUser={setUser} activities={activities} setActivities={setActivities} loadActivities={loadActivities} />;
        case 'log-activity':
          return (
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-2xl mx-auto px-4 py-8">
                <LogActivity user={user} onActivityAdded={() => {
                  loadActivities(); // Reload activities
                }} />
              </div>
            </div>
          );
        case 'badges':
          return (
            <div className="min-h-screen bg-gray-50">
              <div className="max-w-6xl mx-auto px-4 py-8">
                <Badges user={user} activities={activities} />
              </div>
            </div>
          );
        default:
          return <Dashboard user={user} setUser={setUser} activities={activities} setActivities={setActivities} loadActivities={loadActivities} />;
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading View</h2>
            <p className="text-gray-600 mb-4">There was an error loading the {currentView} view.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { id: 'log-activity', name: 'Log Activity', icon: <Plus className="h-5 w-5" /> },
    { id: 'badges', name: 'Badges', icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Left side - Navigation buttons */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center mr-6">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xl font-semibold text-gray-900">EcoTracker</span>
                </div>
                
                {/* Navigation buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('log-activity')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'log-activity'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </button>
                  <button
                    onClick={() => setCurrentView('badges')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentView === 'badges'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Badges
                  </button>
                </div>
              </div>

              {/* Right side - User info and sign out */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
                <button
                  onClick={async () => {
                    try {
                      const { signOut } = await import('firebase/auth');
                      await signOut(auth);
                      setUser(null);
                      setActivities([]);
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentView()}
        </main>
      </div>
    </AppContext.Provider>
  );
}

export default App;
