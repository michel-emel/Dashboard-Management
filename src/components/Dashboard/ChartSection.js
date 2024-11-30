import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartSection = ({ 
  data, 
  type = 'line', 
  title, 
  onTypeChange,
  height = "288" 
}) => {
  const renderChart = () => {
    switch(type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total Revenue" />
            <Area type="monotone" dataKey="collected" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Collected" />
            <Area type="monotone" dataKey="overdue" stackId="3" stroke="#ffc658" fill="#ffc658" name="Overdue" />
          </AreaChart>
        );
      
      case 'stackedBar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" stackId="a" fill="#8884d8" name="Properties" />
            <Bar dataKey="rate" stackId="a" fill="#82ca9d" name="Rate" />
          </BarChart>
        );
      
      //     case 'pie':
      // return (
      //   <PieChart>
      //     <Pie
      //       data={data}
      //       cx="50%"
      //       cy="50%"
      //       outerRadius={80} // No innerRadius for a full pie chart
      //       fill="#8884d8"
      //       dataKey="value"
      //       label
      //     >
      //       {data.map((entry, index) => (
      //         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      //       ))}
      //     </Pie>
      //     <Tooltip />
      //     <Legend />
      //   </PieChart>
      // );

      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx="50%" 
              cy="50%"
              outerRadius={80} // Full pie chart, no innerRadius
              dataKey="value" // This will be used to calculate the slice sizes
              label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`} // Show the category name and percentage
              >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Expected Revenue" />
            <Line type="monotone" dataKey="collected" stroke="#82ca9d" name="Collected Revenue" />
            <Line type="monotone" dataKey="overdue" stroke="#ff7c7c" name="Overdue Amount" />
          </LineChart>
        );

      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar dataKey="collected" fill="#82ca9d" name="Collected" />
          </BarChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {onTypeChange && (
            <div className="flex gap-2">
              <button 
                className={`px-3 py-1 rounded ${type === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => onTypeChange('line')}
              >
                Line
              </button>
              <button 
                className={`px-3 py-1 rounded ${type === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => onTypeChange('bar')}
              >
                Bar
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[288px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSection;