'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, DollarSign, Users, Download, Printer, RefreshCcw } from 'lucide-react';
import StatCard from './StatCard';
import ChartSection from './ChartSection';
import TransactionTable from './TransactionTable';
import { 
  calculateTrend, 
  filterTransactions, 
  calculateSummaryStats,
  filterRevenueData,
  getCurrentMonth 
} from './helpers';
import { bgColorMapping } from './bgColorMapping';


// Updated sample data with more realistic monthly progression
const revenueData = [
    { month: 'Jan', revenue: 45000, collected: 38000, overdue: 7000, category: 'residential', totalProperties: 450 },
    { month: 'Feb', revenue: 52000, collected: 45000, overdue: 7000, category: 'commercial', totalProperties: 120 },
    { month: 'Mar', revenue: 48000, collected: 41000, overdue: 7000, category: 'industrial', totalProperties: 45 },
    { month: 'Apr', revenue: 51000, collected: 47000, overdue: 4000, category: 'residential', totalProperties: 450 },
    { month: 'May', revenue: 54000, collected: 49000, overdue: 5000, category: 'commercial', totalProperties: 120 },
    { month: 'Jun', revenue: 49000, collected: 43000, overdue: 6000, category: 'industrial', totalProperties: 45 },
    { month: 'Jul', revenue: 55000, collected: 50000, overdue: 5000, category: 'mixed-use', totalProperties: 60 },
    { month: 'Aug', revenue: 56000, collected: 51000, overdue: 5000, category: 'agricultural', totalProperties: 85 },
    { month: 'Sep', revenue: 53000, collected: 48000, overdue: 5000, category: 'industrial', totalProperties: 45 },
    { month: 'Oct', revenue: 60000, collected: 55000, overdue: 5000, category: 'agricultural', totalProperties: 85 },
    { month: 'Nov', revenue: 58000, collected: 53000, overdue: 5000, category: 'vacant', totalProperties: 20 },
    { month: 'Dec', revenue: 62000, collected: 57000, overdue: 5000, category: 'mixed-use', totalProperties: 60 }
  ];
  
  

  const propertyData = [
    { category: 'residential', count: 450, rate: 1000, value: 1000 },
    { category: 'commercial', count: 120, rate: 2500, value: 2500 },
    { category: 'industrial', count: 45, rate: 5000, value: 5000 },
    { category: 'agricultural', count: 85, rate: 750, value: 750 },
    { category: 'recreational', count: 30, rate: 1500, value: 1500 },
    { category: 'mixed-use', count: 60, rate: 2000, value: 2000 },
    { category: 'vacant', count: 20, rate: 500, value: 500 },
    ];
  

const recentTransactions = [
    { id: 1, date: '2024-03-10', propertyId: 'P123', owner: 'John Doe', amount: 2500, status: 'completed', category: 'residential' },
    { id: 2, date: '2024-03-09', propertyId: 'P124', owner: 'Jane Smith', amount: 1800, status: 'pending', category: 'commercial' },
    { id: 3, date: '2024-03-08', propertyId: 'P125', owner: 'Bob Wilson', amount: 3200, status: 'completed', category: 'industrial' },
    { id: 4, date: '2024-03-07', propertyId: 'P126', owner: 'Alice Brown', amount: 1500, status: 'overdue', category: 'residential' },
    { id: 5, date: '2024-03-06', propertyId: 'P127', owner: 'Charlie Davis', amount: 2100, status: 'completed', category: 'commercial' },
    { id: 6, date: '2024-03-05', propertyId: 'P128', owner: 'Emily Green', amount: 1200, status: 'completed', category: 'agricultural' },
    { id: 7, date: '2024-03-04', propertyId: 'P129', owner: 'Frank Taylor', amount: 2700, status: 'pending', category: 'mixed-use' },
    { id: 8, date: '2024-03-03', propertyId: 'P130', owner: 'Grace Lee', amount: 800, status: 'overdue', category: 'vacant' },
    { id: 9, date: '2024-03-02', propertyId: 'P131', owner: 'Henry Johnson', amount: 3000, status: 'completed', category: 'industrial' },
    { id: 10, date: '2024-03-01', propertyId: 'P132', owner: 'Ivy Martinez', amount: 2200, status: 'pending', category: 'agricultural' }
    ];
      

const Dashboard = () => {
    // State management
    const [timeFilter, setTimeFilter] = useState('6m');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeChart, setActiveChart] = useState('line');
    const [summaryStats, setSummaryStats] = useState(null);
    const [trends, setTrends] = useState(null);
  
    // Get current filtered data
    const filteredTransactions = filterTransactions(
      recentTransactions, 
      searchTerm, 
      timeFilter, 
      categoryFilter
    );
  
    const filteredRevenue = filterRevenueData(
      revenueData,
      timeFilter,
      categoryFilter
    );
  
    // Calculate trends and stats
    useEffect(() => {
      // Calculate trends directly from revenue data
      const calculatedTrends = calculateTrend(revenueData);
      setTrends(calculatedTrends);
  
      // Calculate summary stats from filtered transactions
      const stats = calculateSummaryStats(filteredTransactions, categoryFilter);
      setSummaryStats({
        ...stats,
        // Add month-over-month comparisons
        propertyTrend: calculatedTrends.propertyChange,
        revenueTrend: calculatedTrends.revenueChange,
        pendingTrend: calculatedTrends.pendingChange,
        collectionTrend: calculatedTrends.collectionChange
      });
    }, [timeFilter, categoryFilter, searchTerm]);
  
    // Load saved preferences
    useEffect(() => {
      const savedPreferences = localStorage.getItem('dashboardPreferences');
      if (savedPreferences) {
        const { timeFilter: savedTimeFilter, categoryFilter: savedCategoryFilter } = JSON.parse(savedPreferences);
        setTimeFilter(savedTimeFilter);
        setCategoryFilter(savedCategoryFilter);
      }
    }, []);
  
    // Save preferences
    useEffect(() => {
      localStorage.setItem('dashboardPreferences', 
        JSON.stringify({ timeFilter, categoryFilter })
      );
    }, [timeFilter, categoryFilter]);
  
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };

  // Handlers
  const exportToCSV = () => {
    const headers = ['Date', 'Property ID', 'Owner', 'Amount', 'Status', 'Category'];
    const csvContent = headers.join(',') + '\n' +
      filteredTransactions.map(t => [
        t.date, 
        t.propertyId, 
        t.owner, 
        t.amount, 
        t.status, 
        t.category
      ].join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
  };

  const handlePrint = () => window.print();

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSummaryStats(calculateSummaryStats(filteredTransactions, categoryFilter));
      setIsLoading(false);
    }, 1000);
  };

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
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Limbe City Revenue Management Dashboard</h1>
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
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="commercial">agricultural</option>
            <option value="industrial">mixed-use</option>
            <option value="industrial">vacant</option>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
            title="Total Properties"
            value={trends?.currentMonthProperties}
            trend={trends?.propertyChange}
            icon={Home}
            bgColor="blue"
            formatValue={(v) => Number(v).toLocaleString()}
        />
        <StatCard
            title="Revenue Collected"
            value={trends?.currentMonthCollected}
            trend={trends?.revenueChange}
            icon={DollarSign}
            bgColor="green"
            formatValue={(v) => `$${Number(v).toLocaleString()}`}
        />
        <StatCard
            title="Pending Bills"
            value={trends?.currentMonthPending}
            trend={trends?.pendingChange}
            icon={AlertCircle}
            bgColor="yellow"
            formatValue={(v) => Number(v).toLocaleString()}
        />
        <StatCard
            title="Collection Rate"
            value={trends?.currentCollectionRate}
            trend={trends?.collectionChange}
            icon={Users}
            bgColor="purple"
            formatValue={(v) => `${Number(v).toFixed(1)}%`}
        />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trends */}
        <ChartSection
            title="Revenue Trends"
            data={filteredRevenue}
            type={activeChart}
            onTypeChange={setActiveChart}
        />

        {/* Property Distribution */}
        <ChartSection
            title="Property Distribution"
            data={propertyData}
            type="pie"
        />

        {/* Revenue Growth */}
        <ChartSection
            title="Cumulative Revenue Growth"
            data={filteredRevenue}
            type="area"
        />

        {/* Category Performance */}
        <ChartSection
            title="Category Performance"
            data={propertyData}
            type="stackedBar"
        />
        </div>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        statusColors={statusColors}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};


export default Dashboard;