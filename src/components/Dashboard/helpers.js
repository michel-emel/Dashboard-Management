// Helper functions for data processing and calculations
export const calculateMonthlyChanges = (data) => {
    // Default values for initial state
    if (!data) {
      return {
        propertyChange: 5,  // Example default value
        revenueChange: 8,   // Example default value
        pendingChange: -12, // Example default value
        collectionChange: 2.5 // Example default value
      };
    }
  
    // Handle division by zero and initial states
    const calculatePercentage = (current, previous) => {
      if (!previous) return 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };
  
    return {
      propertyChange: calculatePercentage(
        data.currentMonthProperties, 
        data.lastMonthProperties
      ) || 0,
      revenueChange: calculatePercentage(
        data.currentMonthRevenue, 
        data.lastMonthRevenue
      ) || 0,
      pendingChange: calculatePercentage(
        data.currentMonthPending, 
        data.lastMonthPending
      ) || 0,
      collectionChange: calculatePercentage(
        data.currentMonthCollection, 
        data.lastMonthCollection
      ) || 0
    };
  };
  
  export const calculateTrend = (revenueData) => {
    // Get current and previous month data
    const currentMonthData = revenueData[revenueData.length - 1] || { revenue: 0, collected: 0, overdue: 0, totalProperties: 0 };
    const previousMonthData = revenueData[revenueData.length - 2] || { revenue: 0, collected: 0, overdue: 0, totalProperties: 0 };
  
    // Ensure we have numbers for all calculations
    const currentProperties = currentMonthData.totalProperties || 0;
    const previousProperties = previousMonthData.totalProperties || 0;
  
    const currentCollected = currentMonthData.collected || 0;
    const previousCollected = previousMonthData.collected || 0;
  
    const currentPending = (currentMonthData.revenue - currentMonthData.collected) || 0;
    const previousPending = (previousMonthData.revenue - previousMonthData.collected) || 0;
  
    const currentCollectionRate = currentMonthData.revenue ? 
      ((currentMonthData.collected / currentMonthData.revenue) * 100) : 0;
    const previousCollectionRate = previousMonthData.revenue ? 
      ((previousMonthData.collected / previousMonthData.revenue) * 100) : 0;
  
    return {
      propertyChange: calculatePercentageChange(currentProperties, previousProperties),
      revenueChange: calculatePercentageChange(currentCollected, previousCollected),
      pendingChange: calculatePercentageChange(currentPending, previousPending),
      collectionChange: calculatePercentageChange(currentCollectionRate, previousCollectionRate),
  
      // Current values with defaults
      currentMonthProperties: currentProperties,
      currentMonthRevenue: currentMonthData.revenue || 0,
      currentMonthCollected: currentCollected,
      currentMonthPending: currentPending,
      currentCollectionRate: currentCollectionRate,
    };
  };
  
  const calculatePercentageChange = (current, previous) => {
    if (!previous || !current) return 0;
    const change = ((current - previous) / previous * 100);
    return isFinite(change) ? change.toFixed(1) : 0;
  };
  // Helper function to get month name
  export const getCurrentMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

  export const filterTransactions = (transactions, searchTerm, timeFilter, categoryFilter) => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTimeFilter = {
        '1m': 30,
        '3m': 90,
        '6m': 180,
        '1y': 365
      };
      
      const transactionDate = new Date(transaction.date);
      const daysAgo = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
      const matchesTime = daysAgo <= matchesTimeFilter[timeFilter];
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
  
      return matchesSearch && matchesTime && matchesCategory;
    });
  };
  
  export const filterRevenueData = (data, timeFilter, categoryFilter) => {
    const filteredByCategory = categoryFilter === 'all' 
      ? data 
      : data.filter(item => item.category === categoryFilter);
  
    const monthsToShow = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12
    };
  
    return filteredByCategory.slice(-monthsToShow[timeFilter]);
  };
  
  export const calculateSummaryStats = (filteredTransactions, categoryFilter) => {
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const collectedAmount = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const overdueAmount = filteredTransactions
      .filter(t => t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalRevenue: totalAmount,
      totalCollected: collectedAmount,
      totalOverdue: overdueAmount,
      collectionRate: totalAmount ? ((collectedAmount / totalAmount) * 100).toFixed(1) : '0',
      totalProperties:filteredTransactions.length,
      averagePropertyValue: filteredTransactions.length 
        ? (totalAmount / filteredTransactions.length).toFixed(2) 
        : '0'
    };
  };