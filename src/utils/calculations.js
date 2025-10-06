// CO2 emission factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  transport: {
    car: 0.192, // kg CO2 per km
    bus: 0.089, // kg CO2 per km
    train: 0.041, // kg CO2 per km
    plane: 0.255, // kg CO2 per km
    motorcycle: 0.113, // kg CO2 per km
    bicycle: 0, // kg CO2 per km
    walking: 0, // kg CO2 per km
    electric_car: 0.053, // kg CO2 per km (depending on electricity source)
  },
  food: {
    beef: 27.0, // kg CO2 per kg
    lamb: 21.1, // kg CO2 per kg
    cheese: 13.5, // kg CO2 per kg
    pork: 12.1, // kg CO2 per kg
    chicken: 6.9, // kg CO2 per kg
    fish: 5.1, // kg CO2 per kg
    eggs: 4.2, // kg CO2 per kg
    rice: 2.7, // kg CO2 per kg
    tofu: 2.0, // kg CO2 per kg
    vegetables: 2.0, // kg CO2 per kg
    fruits: 1.1, // kg CO2 per kg
    nuts: 0.3, // kg CO2 per kg
  },
  energy: {
    electricity: 0.0004, // kg CO2 per kWh (varies by country)
    gas: 0.0002, // kg CO2 per kWh
    heating_oil: 0.0003, // kg CO2 per kWh
  },
  lifestyle: {
    clothing: 33.4, // kg CO2 per item (average)
    electronics: 50.0, // kg CO2 per item (average)
    plastic_bag: 0.006, // kg CO2 per bag
    paper: 0.001, // kg CO2 per sheet
  }
};

// Calculate CO2 emissions for different activities
export const calculateEmissions = (activity, data) => {
  const { type, category, amount, unit } = data;
  
  switch (category) {
    case 'transport':
      return calculateTransportEmissions(type, amount);
    case 'food':
      return calculateFoodEmissions(type, amount);
    case 'energy':
      return calculateEnergyEmissions(type, amount);
    case 'lifestyle':
      return calculateLifestyleEmissions(type, amount);
    default:
      return 0;
  }
};

const calculateTransportEmissions = (transportType, distance) => {
  const factor = EMISSION_FACTORS.transport[transportType] || 0;
  return factor * distance;
};

const calculateFoodEmissions = (foodType, weight) => {
  const factor = EMISSION_FACTORS.food[foodType] || 0;
  return factor * weight;
};

const calculateEnergyEmissions = (energyType, consumption) => {
  const factor = EMISSION_FACTORS.energy[energyType] || 0;
  return factor * consumption;
};

const calculateLifestyleEmissions = (itemType, quantity) => {
  const factor = EMISSION_FACTORS.lifestyle[itemType] || 0;
  return factor * quantity;
};

// Get personalized eco-tips based on user's activities and emissions
export const getEcoTips = (userActivities, totalEmissions) => {
  const tips = [];
  
  // Analyze user's transport habits
  const transportActivities = userActivities.filter(a => a.category === 'transport');
  const carUsage = transportActivities.filter(a => a.type === 'car');
  
  if (carUsage.length > 0) {
    tips.push({
      id: 'transport-car',
      title: 'Reduce Car Usage',
      description: 'Consider walking, cycling, or using public transport for short trips.',
      impact: 'Can reduce emissions by up to 50% for short journeys',
      category: 'transport',
      priority: 'high'
    });
  }
  
  // Analyze food choices
  const foodActivities = userActivities.filter(a => a.category === 'food');
  const highEmissionFood = foodActivities.filter(a => 
    ['beef', 'lamb', 'cheese'].includes(a.type)
  );
  
  if (highEmissionFood.length > 0) {
    tips.push({
      id: 'food-plant-based',
      title: 'Try Plant-Based Alternatives',
      description: 'Replace meat with plant-based proteins a few times a week.',
      impact: 'Can reduce food emissions by up to 70%',
      category: 'food',
      priority: 'high'
    });
  }
  
  // General tips based on total emissions
  if (totalEmissions > 20) {
    tips.push({
      id: 'energy-saving',
      title: 'Energy Efficiency',
      description: 'Use LED bulbs, unplug electronics, and adjust thermostat settings.',
      impact: 'Can save 10-15% on energy bills and emissions',
      category: 'energy',
      priority: 'medium'
    });
  }
  
  tips.push({
    id: 'reduce-waste',
    title: 'Reduce, Reuse, Recycle',
    description: 'Bring reusable bags, water bottles, and containers.',
    impact: 'Reduces plastic waste and associated emissions',
    category: 'lifestyle',
    priority: 'medium'
  });
  
  tips.push({
    id: 'local-seasonal',
    title: 'Buy Local & Seasonal',
    description: 'Choose locally grown, seasonal produce to reduce transport emissions.',
    impact: 'Reduces food miles and supports local farmers',
    category: 'food',
    priority: 'low'
  });
  
  return tips.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Get environmental impact level for activity types
export const getActivityImpactLevel = (category, type) => {
  const impactLevels = {
    transport: {
      'car': 'red',           // High emissions
      'motorcycle': 'red',    // High emissions
      'taxi': 'red',          // High emissions
      'flight': 'red',        // Very high emissions
      'bus': 'orange',        // Medium emissions
      'train': 'green',       // Low emissions
      'bicycle': 'green',     // No emissions
      'walking': 'green'      // No emissions
    },
    food: {
      'beef': 'red',          // Very high emissions
      'lamb': 'red',          // Very high emissions
      'pork': 'orange',       // Medium emissions
      'chicken': 'orange',    // Medium emissions
      'fish': 'orange',       // Medium emissions
      'dairy': 'orange',      // Medium emissions
      'vegetables': 'green',  // Low emissions
      'fruits': 'green',      // Low emissions
      'tofu': 'green',        // Low emissions
      'nuts': 'green',        // Low emissions
      'rice': 'green',        // Low emissions
      'pasta': 'green',       // Low emissions
      'bread': 'green'        // Low emissions
    },
    energy: {
      'electricity': 'orange', // Depends on source
      'gas': 'red',           // High emissions
      'oil': 'red',           // High emissions
      'solar': 'green',       // Clean energy
      'wind': 'green',        // Clean energy
      'nuclear': 'green'      // Clean energy
    },
    lifestyle: {
      'clothing': 'orange',   // Medium impact
      'electronics': 'red',   // High impact
      'plastic_bag': 'red',   // High environmental impact
      'paper': 'orange',      // Medium impact
      'water_usage': 'orange', // Medium impact
      'recycling': 'green',   // Positive impact
      'composting': 'green'   // Positive impact
    }
  };

  return impactLevels[category]?.[type] || 'orange';
};

// Get impact description for activity types
export const getActivityImpactDescription = (category, type) => {
  const descriptions = {
    transport: {
      'car': 'High carbon emissions - consider alternatives',
      'motorcycle': 'High carbon emissions - consider alternatives',
      'taxi': 'High carbon emissions - consider alternatives',
      'flight': 'Very high carbon emissions - consider alternatives',
      'bus': 'Medium carbon emissions - better than car',
      'train': 'Low carbon emissions - good choice',
      'bicycle': 'Zero emissions - excellent choice',
      'walking': 'Zero emissions - excellent choice'
    },
    food: {
      'beef': 'Very high carbon footprint - consider alternatives',
      'lamb': 'Very high carbon footprint - consider alternatives',
      'pork': 'Medium carbon footprint',
      'chicken': 'Medium carbon footprint',
      'fish': 'Medium carbon footprint',
      'dairy': 'Medium carbon footprint',
      'vegetables': 'Low carbon footprint - great choice',
      'fruits': 'Low carbon footprint - great choice',
      'tofu': 'Low carbon footprint - great choice',
      'nuts': 'Low carbon footprint - great choice',
      'rice': 'Low carbon footprint - great choice',
      'pasta': 'Low carbon footprint - great choice',
      'bread': 'Low carbon footprint - great choice'
    },
    energy: {
      'electricity': 'Impact depends on energy source',
      'gas': 'High carbon emissions',
      'oil': 'High carbon emissions',
      'solar': 'Clean energy - excellent choice',
      'wind': 'Clean energy - excellent choice',
      'nuclear': 'Clean energy - excellent choice'
    },
    lifestyle: {
      'clothing': 'Medium environmental impact',
      'electronics': 'High environmental impact - consider repair/reuse',
      'plastic_bag': 'High environmental impact - avoid single-use',
      'paper': 'Medium environmental impact',
      'water_usage': 'Medium environmental impact',
      'recycling': 'Positive environmental impact - keep it up!',
      'composting': 'Positive environmental impact - keep it up!'
    }
  };

  return descriptions[category]?.[type] || 'Medium environmental impact';
};

// Calculate daily, weekly, and monthly totals
export const calculateTimeframeTotals = (activities, timeframe) => {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0);
  }
  
  return activities
    .filter(activity => {
      // Handle Firebase timestamp format
      let activityDate;
      if (activity.date && activity.date.seconds) {
        // Firebase Timestamp format
        activityDate = new Date(activity.date.seconds * 1000);
      } else if (activity.date) {
        // Regular Date format
        activityDate = new Date(activity.date);
      } else {
        // No date, skip this activity
        return false;
      }
      return activityDate >= startDate;
    })
    .reduce((total, activity) => total + (activity.emissions || 0), 0);
};

// Get category breakdown for charts
export const getCategoryBreakdown = (activities) => {
  const breakdown = {
    transport: 0,
    food: 0,
    energy: 0,
    lifestyle: 0
  };
  
  activities.forEach(activity => {
    if (breakdown.hasOwnProperty(activity.category)) {
      breakdown[activity.category] += (activity.emissions || 0);
    }
  });
  
  return breakdown;
};

// Calculate user's carbon footprint score (0-100, higher is better)
export const calculateFootprintScore = (totalEmissions, timeframe = 'daily') => {
  // Average daily emissions: 16.5 kg CO2 per person globally
  const averageDaily = 16.5;
  const maxDaily = 50; // Very high emissions
  
  const dailyEmissions = timeframe === 'daily' ? totalEmissions : totalEmissions / 30;
  
  if (dailyEmissions <= averageDaily) {
    return Math.max(0, 100 - (averageDaily - dailyEmissions) * 2);
  } else {
    return Math.max(0, 100 - (dailyEmissions - averageDaily) * 3);
  }
};

// Badge system
export const BADGES = {
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Logged your first activity',
    icon: '🌱',
    condition: (activities) => activities.length >= 1,
    unlocked: false
  },
  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Logged activities for 7 consecutive days',
    icon: '🏆',
    condition: (activities) => {
      if (activities.length < 7) return false;
      const dates = activities.map(a => new Date(a.date).toDateString());
      const uniqueDates = [...new Set(dates)].sort();
      return uniqueDates.length >= 7;
    },
    unlocked: false
  },
  'low-carbon': {
    id: 'low-carbon',
    name: 'Low Carbon Champion',
    description: 'Kept daily emissions under 10kg for a week',
    icon: '🌿',
    condition: (activities) => {
      const weeklyTotal = calculateTimeframeTotals(activities, 'weekly');
      return weeklyTotal < 70; // 10kg per day * 7 days
    },
    unlocked: false
  },
  'transport-hero': {
    id: 'transport-hero',
    name: 'Transport Hero',
    description: 'Used sustainable transport 10 times',
    icon: '🚲',
    condition: (activities) => {
      const sustainableTransport = activities.filter(a => 
        a.category === 'transport' && 
        ['bicycle', 'walking', 'train', 'bus'].includes(a.type)
      );
      return sustainableTransport.length >= 10;
    },
    unlocked: false
  },
  'plant-power': {
    id: 'plant-power',
    name: 'Plant Power',
    description: 'Chose plant-based options 20 times',
    icon: '🥬',
    condition: (activities) => {
      const plantBased = activities.filter(a => 
        a.category === 'food' && 
        ['vegetables', 'fruits', 'tofu', 'nuts'].includes(a.type)
      );
      return plantBased.length >= 20;
    },
    unlocked: false
  }
};

// Check and unlock badges
export const checkBadges = (activities) => {
  const unlockedBadges = [];
  
  Object.values(BADGES).forEach(badge => {
    if (badge.condition(activities) && !badge.unlocked) {
      unlockedBadges.push(badge);
      badge.unlocked = true;
    }
  });
  
  return unlockedBadges;
};
