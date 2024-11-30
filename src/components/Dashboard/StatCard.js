import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { bgColorMapping } from './bgColorMapping';

export const StatCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  bgColor = 'blue', 
  showTrend = true,
  formatValue = (v) => v 
}) => {
  const isPositive = parseFloat(trend) >= 0;
  
  return (
    <Card>
      <CardContent className="flex items-center p-4 group relative">
        <div className={`p-2 ${bgColorMapping[bgColor].bg} rounded-lg`}>
          <Icon className={`h-6 w-6 ${bgColorMapping[bgColor].text}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{formatValue(value)}</p>
          {showTrend && (
            <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend)}% from previous month
            </p>
          )}
        </div>
        <div className="hidden group-hover:block absolute top-0 left-0 mt-[-20px] bg-gray-800 text-white p-2 rounded text-xs">
          Compare to previous month
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;