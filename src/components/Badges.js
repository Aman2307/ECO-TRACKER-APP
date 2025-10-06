import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { BADGES, checkBadges } from '../utils/calculations';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Leaf, 
  Bike, 
  Apple,
  Crown,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';

const Badges = ({ user, activities }) => {
  const [userBadges, setUserBadges] = useState([]); // Start with no badges unlocked
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (user && activities) {
      loadUserBadges();
    }
  }, [user, activities]);

  useEffect(() => {
    if (activities && activities.length > 0) {
      checkForNewBadges();
      
      // Check and unlock badges based on current activities and progress
      setUserBadges(prev => {
        const newUnlockedBadges = [...prev];
        
        // Check each badge and unlock if it has any progress (including negative)
        Object.keys(BADGES).forEach(badgeId => {
          const progress = getProgress(badgeId, activities);
          if (progress !== 0 && !newUnlockedBadges.includes(badgeId)) {
            newUnlockedBadges.push(badgeId);
          }
        });
        
        return newUnlockedBadges;
      });
    }
  }, [activities]);

  const loadUserBadges = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const badges = userDoc.data().badges || [];
        setUserBadges(badges);
      } else {
        // If no user document exists, check for badges based on activities
        const unlockedBadges = checkBadges(activities);
        if (unlockedBadges.length > 0) {
          setUserBadges(unlockedBadges.map(badge => badge.id));
        }
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      // Fallback: check for badges based on activities
      const unlockedBadges = checkBadges(activities);
      if (unlockedBadges.length > 0) {
        setUserBadges(unlockedBadges.map(badge => badge.id));
      }
    }
    setLoading(false);
  };

  const checkForNewBadges = async () => {
    try {
      const unlockedBadges = checkBadges(activities);
      
      if (unlockedBadges.length > 0) {
        setNewlyUnlocked(unlockedBadges);
        
        // Update user badges in Firestore
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          badges: arrayUnion(...unlockedBadges.map(badge => badge.id))
        });
        
        // Add to local state
        setUserBadges(prev => {
          const newBadges = [...prev, ...unlockedBadges.map(badge => badge.id)];
          return newBadges;
        });
        
        // Clear newly unlocked after 3 seconds
        setTimeout(() => {
          setNewlyUnlocked([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const getBadgeIcon = (badgeId) => {
    const icons = {
      'first-steps': <Leaf className="h-6 w-6" />,
      'week-warrior': <Trophy className="h-6 w-6" />,
      'low-carbon': <Star className="h-6 w-6" />,
      'transport-hero': <Bike className="h-6 w-6" />,
      'plant-power': <Apple className="h-6 w-6" />
    };
    return icons[badgeId] || <Award className="h-6 w-6" />;
  };

  const getBadgeColor = (badgeId) => {
    const colors = {
      'first-steps': 'from-green-400 to-green-600',
      'week-warrior': 'from-yellow-400 to-orange-500',
      'low-carbon': 'from-blue-400 to-blue-600',
      'transport-hero': 'from-purple-400 to-purple-600',
      'plant-power': 'from-emerald-400 to-emerald-600'
    };
    return colors[badgeId] || 'from-gray-400 to-gray-600';
  };

  const getBadgeColorByProgress = (progress) => {
    if (progress < 0) {
      return {
        background: 'bg-red-500',
        border: 'border-red-500',
        isLocked: false
      };
    } else if (progress === 0) {
      return {
        background: 'bg-gray-200',
        border: 'border-gray-200',
        isLocked: true
      };
    } else if (progress === 100) {
      return {
        background: 'bg-green-500',
        border: 'border-green-500',
        isLocked: false
      };
    } else if (progress >= 51 && progress <= 99) {
      return {
        background: 'bg-blue-500',
        border: 'border-blue-500',
        isLocked: false
      };
    } else if (progress >= 1 && progress <= 50) {
      return {
        background: 'bg-purple-500',
        border: 'border-purple-500',
        isLocked: false
      };
    } else {
      // This should not happen, but fallback for any edge cases
      return {
        background: 'bg-gray-200',
        border: 'border-gray-200',
        isLocked: true
      };
    }
  };

  const getBadgeSolidColor = (badgeId, progress) => {
    const colors = getBadgeColorByProgress(progress);
    return colors.background;
  };

  const getBadgeBorderColor = (badgeId, progress) => {
    const colors = getBadgeColorByProgress(progress);
    return colors.border;
  };

  const getProgress = (badgeId, activities) => {
    switch (badgeId) {
      case 'first-steps':
        return activities.length >= 1 ? 100 : (activities.length / 1) * 100;
      case 'week-warrior':
        if (activities.length < 7) return (activities.length / 7) * 100;
        const dates = activities.map(a => new Date(a.date).toDateString());
        const uniqueDates = [...new Set(dates)].sort();
        return Math.min(100, (uniqueDates.length / 7) * 100);
      case 'low-carbon':
        const weeklyTotal = activities.reduce((total, activity) => total + (activity.emissions || 0), 0);
        // If emissions exceed 70kg, show negative progress
        if (weeklyTotal > 70) {
          return Math.max(-100, ((70 - weeklyTotal) / 70) * 100);
        }
        return Math.min(100, ((70 - weeklyTotal) / 70) * 100);
      case 'transport-hero':
        const sustainableTransport = activities.filter(a => 
          a.category === 'transport' && 
          ['bicycle', 'walking', 'train', 'bus'].includes(a.type)
        );
        return Math.min(100, (sustainableTransport.length / 10) * 100);
      case 'plant-power':
        const plantBased = activities.filter(a => 
          a.category === 'food' && 
          ['vegetables', 'fruits', 'tofu', 'nuts'].includes(a.type)
        );
        return Math.min(100, (plantBased.length / 20) * 100);
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Badges & Achievements</h1>
        <p className="text-gray-600">Track your eco-friendly progress and unlock rewards</p>
      </div>


      {/* New Badge Notifications */}
      {newlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newlyUnlocked.map(badge => (
            <div
              key={badge.id}
              className="bg-white rounded-lg shadow-xl border-l-4 border-green-500 p-4 animate-slide-up"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Badge Unlocked!</p>
                  <p className="text-sm text-gray-600">{badge.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
            <p className="text-gray-600">
              {userBadges.length} of {Object.keys(BADGES).length} badges unlocked
            </p>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BADGES).map(([badgeId, badge]) => {
            const isUnlocked = userBadges.includes(badgeId);
            const progress = getProgress(badgeId, activities);
            const colorInfo = getBadgeColorByProgress(progress);
            // Show colors for unlocked badges, but lock badges with exactly 0% progress
            const shouldShowColors = isUnlocked && !colorInfo.isLocked;
            
            
            return (
              <div
                key={badgeId}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  shouldShowColors
                    ? `bg-white ${colorInfo.border} hover:shadow-xl`
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Badge Icon */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                  shouldShowColors 
                    ? `${colorInfo.background} text-white shadow-lg` 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {getBadgeIcon(badgeId)}
                </div>

                {/* Badge Info */}
                <div className="mb-3">
                  <h3 className={`font-semibold ${
                    shouldShowColors ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  <p className={`text-sm ${
                    shouldShowColors ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {badge.description}
                  </p>
                  
                  {/* Negative Progress Warning */}
                  {progress < 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-red-500">⚠️</span>
                        <span className="text-red-700 font-medium">
                          Negative Impact: {Math.round(Math.abs(progress))}% over target
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={shouldShowColors ? 'text-gray-600' : 'text-gray-400'}>
                      Progress
                    </span>
                    <span className={`font-medium ${
                      progress < 0 ? 'text-red-600' : 
                      shouldShowColors ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {progress < 0 ? `${Math.round(progress)}%` : `${Math.round(progress)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        shouldShowColors 
                          ? colorInfo.background
                          : 'bg-gray-300'
                      }`}
                      style={{ 
                        width: progress < 0 ? '100%' : `${Math.max(0, progress)}%`,
                        backgroundColor: progress < 0 ? '#ef4444' : undefined
                      }}
                    ></div>
                    {progress < 0 && (
                      <div className="absolute right-0 top-0 h-2 w-1 bg-red-600 rounded-r-full"></div>
                    )}
                  </div>
                </div>

                {/* Unlocked Badge */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Badge Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{userBadges.length}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {Object.keys(BADGES).length - userBadges.length}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((userBadges.length / Object.keys(BADGES).length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Target className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Next Badge Goals</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          {Object.entries(BADGES)
            .filter(([badgeId]) => !userBadges.includes(badgeId))
            .slice(0, 3)
            .map(([badgeId, badge]) => (
              <div key={badgeId} className="flex items-center">
                <span className="mr-2">{badge.icon}</span>
                <span>{badge.description}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Badge Details</h3>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
                userBadges.includes(selectedBadge.id) && !getBadgeColorByProgress(getProgress(selectedBadge.id, activities)).isLocked
                  ? `${getBadgeSolidColor(selectedBadge.id, getProgress(selectedBadge.id, activities))} text-white shadow-lg`
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {getBadgeIcon(selectedBadge.id)}
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedBadge.name}
              </h4>
              
              <p className="text-gray-600 mb-4">
                {selectedBadge.description}
              </p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                userBadges.includes(selectedBadge.id) && !getBadgeColorByProgress(getProgress(selectedBadge.id, activities)).isLocked
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {userBadges.includes(selectedBadge.id) && !getBadgeColorByProgress(getProgress(selectedBadge.id, activities)).isLocked ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Unlocked
                  </>
                ) : (
                  'Locked'
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{getProgress(selectedBadge.id, activities)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgress(selectedBadge.id, activities)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {(() => {
                    const modalProgress = getProgress(selectedBadge.id, activities);
                    if (modalProgress < 0) {
                      return `⚠️ You're ${Math.round(Math.abs(modalProgress))}% over the target. Consider reducing your environmental impact.`;
                    } else if (userBadges.includes(selectedBadge.id) && modalProgress === 100) {
                      return "Congratulations! You've earned this badge.";
                    } else if (modalProgress === 0) {
                      return "This badge is locked. Start working on the requirements to unlock it.";
                    } else if (modalProgress > 0) {
                      return `You're ${Math.round(modalProgress)}% of the way there. Keep going!`;
                    } else {
                      return "Complete the requirements to unlock this badge.";
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;
