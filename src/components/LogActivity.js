import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateEmissions, getActivityImpactLevel, getActivityImpactDescription } from '../utils/calculations';
import { 
  Car, 
  Bus, 
  Train, 
  Plane, 
  Bike, 
  Footprints, 
  Apple, 
  Beef, 
  Fish, 
  Leaf, 
  Zap, 
  ShoppingBag,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';

const LogActivity = ({ user, onActivityAdded }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = {
    transport: {
      name: 'Transport',
      icon: <Car className="h-5 w-5" />,
      color: 'blue',
      types: {
        car: { name: 'Car', icon: <Car className="h-4 w-4" />, unit: 'km' },
        bus: { name: 'Bus', icon: <Bus className="h-4 w-4" />, unit: 'km' },
        train: { name: 'Train', icon: <Train className="h-4 w-4" />, unit: 'km' },
        plane: { name: 'Plane', icon: <Plane className="h-4 w-4" />, unit: 'km' },
        motorcycle: { name: 'Motorcycle', icon: <Bike className="h-4 w-4" />, unit: 'km' },
        bicycle: { name: 'Bicycle', icon: <Bike className="h-4 w-4" />, unit: 'km' },
        walking: { name: 'Walking', icon: <Footprints className="h-4 w-4" />, unit: 'km' },
        electric_car: { name: 'Electric Car', icon: <Car className="h-4 w-4" />, unit: 'km' }
      }
    },
    food: {
      name: 'Food',
      icon: <Apple className="h-5 w-5" />,
      color: 'orange',
      types: {
        beef: { name: 'Beef', icon: <Beef className="h-4 w-4" />, unit: 'kg' },
        lamb: { name: 'Lamb', icon: <Beef className="h-4 w-4" />, unit: 'kg' },
        chicken: { name: 'Chicken', icon: <Beef className="h-4 w-4" />, unit: 'kg' },
        fish: { name: 'Fish', icon: <Fish className="h-4 w-4" />, unit: 'kg' },
        cheese: { name: 'Cheese', icon: <Beef className="h-4 w-4" />, unit: 'kg' },
        eggs: { name: 'Eggs', icon: <Apple className="h-4 w-4" />, unit: 'kg' },
        vegetables: { name: 'Vegetables', icon: <Leaf className="h-4 w-4" />, unit: 'kg' },
        fruits: { name: 'Fruits', icon: <Apple className="h-4 w-4" />, unit: 'kg' },
        rice: { name: 'Rice', icon: <Apple className="h-4 w-4" />, unit: 'kg' },
        tofu: { name: 'Tofu', icon: <Leaf className="h-4 w-4" />, unit: 'kg' },
        nuts: { name: 'Nuts', icon: <Apple className="h-4 w-4" />, unit: 'kg' }
      }
    },
    energy: {
      name: 'Energy',
      icon: <Zap className="h-5 w-5" />,
      color: 'yellow',
      types: {
        electricity: { name: 'Electricity', icon: <Zap className="h-4 w-4" />, unit: 'kWh' },
        gas: { name: 'Gas', icon: <Zap className="h-4 w-4" />, unit: 'kWh' },
        heating_oil: { name: 'Heating Oil', icon: <Zap className="h-4 w-4" />, unit: 'kWh' }
      }
    },
    lifestyle: {
      name: 'Lifestyle',
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'purple',
      types: {
        clothing: { name: 'Clothing', icon: <ShoppingBag className="h-4 w-4" />, unit: 'items' },
        electronics: { name: 'Electronics', icon: <Zap className="h-4 w-4" />, unit: 'items' },
        plastic_bag: { name: 'Plastic Bags', icon: <ShoppingBag className="h-4 w-4" />, unit: 'bags' },
        paper: { name: 'Paper', icon: <ShoppingBag className="h-4 w-4" />, unit: 'sheets' }
      }
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedType('');
    setAmount('');
    setUnit('');
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setUnit(categories[selectedCategory].types[type].unit);
  };

  const getImpactColor = (level) => {
    switch (level) {
      case 'green':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'orange':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'red':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getImpactIcon = (level) => {
    switch (level) {
      case 'green':
        return '🌱';
      case 'orange':
        return '⚠️';
      case 'red':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedType || !amount) return;

    setLoading(true);
    
    try {
      const emissions = calculateEmissions('', {
        category: selectedCategory,
        type: selectedType,
        amount: parseFloat(amount)
      });

      const activityData = {
        userId: user.uid,
        category: selectedCategory,
        type: selectedType,
        amount: parseFloat(amount),
        unit: unit,
        emissions: emissions,
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'activities'), activityData);
      console.log('Activity saved with ID:', docRef.id);
      
      setSuccess(true);
      
      // Call the callback to reload activities
      if (onActivityAdded) {
        onActivityAdded();
      }
      
      setTimeout(() => {
        setSuccess(false);
        setSelectedCategory('');
        setSelectedType('');
        setAmount('');
        setUnit('');
      }, 2000);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
    
    setLoading(false);
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Log Activity</h1>
        <p className="text-gray-600">Track your daily activities and their environmental impact</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Activity logged successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategorySelect(key)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                  selectedCategory === key
                    ? `${getCategoryColor(category.color)} border-current`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Selection */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select {categories[selectedCategory].name} Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categories[selectedCategory].types).map(([key, type]) => {
                const impactLevel = getActivityImpactLevel(selectedCategory, key);
                const impactDescription = getActivityImpactDescription(selectedCategory, key);
                const isSelected = selectedType === key;
                
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeSelect(key)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 relative ${
                      isSelected
                        ? `${getImpactColor(impactLevel)} border-current`
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    title={impactDescription}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium flex-1 text-left">{type.name}</span>
                    <span className="text-sm">{getImpactIcon(impactLevel)}</span>
                    
                    {/* Impact indicator dot */}
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      impactLevel === 'green' ? 'bg-green-500' :
                      impactLevel === 'orange' ? 'bg-orange-500' :
                      impactLevel === 'red' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Impact Indicator */}
        {selectedType && (
          <div className={`p-4 rounded-lg border-l-4 ${getImpactColor(getActivityImpactLevel(selectedCategory, selectedType))}`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getImpactIcon(getActivityImpactLevel(selectedCategory, selectedType))}</span>
              <h4 className="font-semibold">
                {getActivityImpactLevel(selectedCategory, selectedType) === 'green' && 'Eco-Friendly Choice! 🌱'}
                {getActivityImpactLevel(selectedCategory, selectedType) === 'orange' && 'Moderate Impact ⚠️'}
                {getActivityImpactLevel(selectedCategory, selectedType) === 'red' && 'High Impact - Consider Alternatives 🚨'}
              </h4>
            </div>
            <p className="text-sm">
              {getActivityImpactDescription(selectedCategory, selectedType)}
            </p>
          </div>
        )}

        {/* Amount Input */}
        {selectedType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ({unit})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${unit}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              step="0.1"
              min="0"
              required
            />
          </div>
        )}

        {/* Estimated Emissions Preview */}
        {amount && selectedType && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Estimated CO₂ Emissions:</span>
              <span className="text-green-800 font-bold">
                {calculateEmissions('', {
                  category: selectedCategory,
                  type: selectedType,
                  amount: parseFloat(amount)
                }).toFixed(2)} kg CO₂
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedCategory || !selectedType || !amount || loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Logging...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </>
          )}
        </button>
      </form>

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">💡 Quick Tips:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Log activities as soon as you complete them for accuracy</li>
          <li>• Use sustainable transport options when possible</li>
          <li>• Choose plant-based foods to reduce emissions</li>
          <li>• Small changes add up to big environmental impact!</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default LogActivity;
