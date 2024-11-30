'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { AlertCircle, Home, DollarSign, Building, Users, Search, ArrowUpRight, ArrowDownRight, Download, Printer, RefreshCcw } from 'lucide-react';

// Sample data with categories for better filtering
const revenueData = [
  { month: 'Jan', revenue: 45000, collected: 38000, overdue: 7000, category: 'residential' },
  { month: 'Feb', revenue: 52000, collected: 45000, overdue: 7000, category: 'commercial' },
  { month: 'Mar', revenue: 48000, collected: 41000, overdue: 7000, category: 'industrial' },
  { month: 'Apr', revenue: 51000, collected: 47000, overdue: 4000, category: 'residential' },
  { month: 'May', revenue: 54000, collected: 49000, overdue: 5000, category: 'commercial' },
  { month: 'Jun', revenue: 49000, collected: 43000, overdue: 6000, category: 'industrial' },
];

const propertyData = [
  { category: 'residential', count: 450, rate: 1000 },
  { category: 'commercial', count: 120, rate: 2500 },
  { category: 'industrial', count: 45, rate: 5000 },
  { category: 'agricultural', count: 85, rate: 750 },
];

const recentTransactions = [
  { id: 1, date: '2024-03-10', propertyId: 'P123', owner: 'John Doe', amount: 2500, status: 'completed', category: 'residential' },
  { id: 2, date: '2024-03-09', propertyId: 'P124', owner: 'Jane Smith', amount: 1800, status: 'pending', category: 'commercial' },
  { id: 3, date: '2024-03-08', propertyId: 'P125', owner: 'Bob Wilson', amount: 3200, status: 'completed', category: 'industrial' },
  { id: 4, date: '2024-03-07', propertyId: 'P126', owner: 'Alice Brown', amount: 1500, status: 'overdue', category: 'residential' },
  { id: 5, date: '2024-03-06', propertyId: 'P127', owner: 'Charlie Davis', amount: 2100, status: 'completed', category: 'commercial' },
];

// Calculate summary statistics based on filtered data
const calculateSummaryStats = (filteredTransactions, categoryFilter) => {
  const filteredRevenue = categoryFilter === 'all' 
    ? revenueData 
    : revenueData.filter(item => item.category === categoryFilter);

  const totalRevenue = filteredRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalCollected = filteredRevenue.reduce((sum, item) => sum + item.collected, 0);
  const totalOverdue = filteredRevenue.reduce((sum, item) => sum + item.overdue, 0);
  const collectionRate = (totalCollected / totalRevenue) * 100;
  
  const filteredProperties = categoryFilter === 'all'
    ? propertyData
    : propertyData.filter(item => item.category === categoryFilter);
    
  const totalProperties = filteredProperties.reduce((sum, item) => sum + item.count, 0);
  
  return {
    totalRevenue,
    totalCollected,
    totalOverdue,
    collectionRate: collectionRate.toFixed(1),
    totalProperties,
    averagePropertyValue: totalProperties > 0 ? (totalRevenue / totalProperties).toFixed(2) : '0'
  };
};

// Improved filter function
const filterTransactions = (transactions, searchTerm, timeFilter, categoryFilter) => {
  return transactions.filter(transaction => {
    // Search term matching
    const matchesSearch = searchTerm === '' || 
      transaction.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Time filter matching
    const matchesTimeFilter = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365
    };
    
    const transactionDate = new Date(transaction.date);
    const daysAgo = (new Date() - transactionDate) / (1000 * 60 * 60 * 24);
    const matchesTime = daysAgo <= matchesTimeFilter[timeFilter];

    // Category filter matching
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

    return matchesSearch && matchesTime && matchesCategory;
  });
};

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('6m');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('line');
  const [summaryStats, setSummaryStats] = useState(calculateSummaryStats(recentTransactions, 'all'));
  const [showDetails, setShowDetails] = useState({});

  const filteredTransactions = filterTransactions(recentTransactions, searchTerm, timeFilter, categoryFilter);

  // Update summary stats when filters change
  useEffect(() => {
    setSummaryStats(calculateSummaryStats(filteredTransactions, categoryFilter));
  }, [timeFilter, categoryFilter, searchTerm]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      const { timeFilter: savedTimeFilter, categoryFilter: savedCategoryFilter } = JSON.parse(savedPreferences);
      setTimeFilter(savedTimeFilter);
      setCategoryFilter(savedCategoryFilter);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('dashboardPreferences', JSON.stringify({ timeFilter, categoryFilter }));
  }, [timeFilter, categoryFilter]);

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800'
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const exportToCSV = () => {
    const headers = ['Date', 'Property ID', 'Owner', 'Amount', 'Status', 'Category'];
    const csvContent = 
      headers.join(',') + '\n' +
      filteredTransactions.map(t => 
        [t.date, t.propertyId, t.owner, t.amount, t.status, t.category].join(',')
      ).join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const refreshData = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setSummaryStats(calculateSummaryStats(filteredTransactions, categoryFilter));
      setIsLoading(false);
    }, 1000);
  };
  
  // Remove this line as it's already defined in the component state
  // const filteredTransactions = filterTransactions(recentTransactions, searchTerm, timeFilter);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Tax Management Dashboard</h1>
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <select 
            className="px-3 py-2 border rounded-lg"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <select 
            className="px-3 py-2 border rounded-lg"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSummaryStats(calculateSummaryStats(filteredTransactions, e.target.value));
            }}
          >
            <option value="all">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total Revenue</p>
              <p className="text-xl font-bold">${summaryStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Collected</p>
              <p className="text-xl font-bold">${summaryStats.totalCollected.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Total Overdue</p>
              <p className="text-xl font-bold">${summaryStats.totalOverdue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">Collection Rate</p>
              <p className="text-xl font-bold">{summaryStats.collectionRate}%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Total Properties</p>
              <p className="text-xl font-bold">{summaryStats.totalProperties}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600">Avg Property Value</p>
              <p className="text-xl font-bold">${summaryStats.averagePropertyValue}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold">700</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +5% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Revenue Collected</p>
              <p className="text-2xl font-bold">$263,000</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +8% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Bills</p>
              <p className="text-2xl font-bold">124</p>
              <p className="text-sm text-red-600 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1" /> +12% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Collection Rate</p>
              <p className="text-2xl font-bold">84.5%</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +2.5% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Revenue Trends</CardTitle>
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1 rounded ${activeChart === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setActiveChart('line')}
                >
                  Line
                </button>
                <button 
                  className={`px-3 py-1 rounded ${activeChart === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setActiveChart('bar')}
                >
                  Bar
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'line' ? (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Expected Revenue" />
                    <Line type="monotone" dataKey="collected" stroke="#82ca9d" name="Collected Revenue" />
                    <Line type="monotone" dataKey="overdue" stroke="#ff7c7c" name="Overdue Amount" />
                  </LineChart>
                ) : (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Expected Revenue" />
                    <Bar dataKey="collected" fill="#82ca9d" name="Collected Revenue" />
                    <Bar dataKey="overdue" fill="#ff7c7c" name="Overdue Amount" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Rate by Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyData}
                    dataKey="rate"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {propertyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full md:w-64 px-3 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{transaction.propertyId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{transaction.owner}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${transaction.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[transaction.status]}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Property Tax Rate Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rate Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Number of Properties" />
                <Bar yAxisId="right" dataKey="rate" fill="#82ca9d" name="Tax Rate ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;