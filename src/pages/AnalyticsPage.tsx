// src/pages/AnalyticsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart3, CalendarDays, Loader2, ServerCrash, TrendingUp, TrendingDown, PieChartIcon, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Pie, Cell, PieLabel } from 'recharts';
import { AnalyticsChartData, TimeRange, TimeSeriesDataPoint, CategoricalDataPoint } from '@/types';
import * as api from '@/api/mockService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For potential chart type filter

const CHART_HEIGHT = 300;

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Last Year', value: '1y' },
  ];

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err);
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderChart = (chartData: AnalyticsChartData) => {
    const { type, data, title, dataKeys = ['value'] } = chartData;
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

    // Ensure data is not empty and is an array
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-center text-slate-500 py-10">No data available for this chart.</p>;
    }

    const firstDataPoint = data[0];
    const isTimeSeries = 'date' in firstDataPoint;

    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        {type === 'line' && isTimeSeries && (
          <ComposedChart data={data as TimeSeriesDataPoint[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
            {dataKeys.map((key, index) => (
                 <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} activeDot={{ r: 8 }} name={key.charAt(0).toUpperCase() + key.slice(1)} />
            ))}
          </ComposedChart>
        )}
        {type === 'bar' && (
          <ComposedChart data={data as Array<TimeSeriesDataPoint | CategoricalDataPoint>}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={isTimeSeries ? "date" : "name"} tickFormatter={isTimeSeries ? (tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Legend />
             {dataKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} name={key.charAt(0).toUpperCase() + key.slice(1)} />
            ))}
          </ComposedChart>
        )}
        {type === 'pie' && !isTimeSeries && (
             <PieChartIcon width="100%" height={CHART_HEIGHT}> {/* This should be PieChart from recharts */}
                 <Pie
                    data={data as CategoricalDataPoint[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={CHART_HEIGHT / 2 * 0.7}
                    dataKey={dataKeys[0]}
                    nameKey="name"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                    }}
                >
                    {(data as CategoricalDataPoint[]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Legend />
            </PieChartIcon>
        )}
      </ResponsiveContainer>
    );
  };

  const getChartIcon = (type: string) => {
    if (type.includes('Volume') || type.includes('Revenue')) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (type.includes('Delay') || type.includes('Cost') || type.includes('Expense')) return <TrendingDown className="w-5 h-5 text-red-500" />;
    if (type.includes('Performance') || type.includes('Agent')) return <Users className="w-5 h-5 text-blue-500" />;
    if (type.includes('Distribution') || type.includes('Status')) return <PieChartIcon className="w-5 h-5 text-purple-500" />; // Recharts PieChart icon
    return <BarChart3 className="w-5 h-5 text-slate-600" />;
  }


  if (isLoading && analyticsData.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-12 h-12 animate-spin text-logistics-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-red-500">
        <ServerCrash className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Analytics</h2>
        <p>{error.message}</p>
        <Button onClick={fetchAnalytics} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center"><BarChart3 className="mr-3 w-8 h-8 text-logistics-primary" />Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-slate-500" />
          {timeRangeOptions.map(opt => (
            <Button
              key={typeof opt.value === 'string' ? opt.value : `${opt.value.from}-${opt.value.to}`}
              variant={timeRange === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsData.map((chart, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center space-x-2">
                {getChartIcon(chart.title)}
                <CardTitle>{chart.title}</CardTitle>
              </div>
              {chart.description && <CardDescription>{chart.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="w-full h-[300px]" /> : renderChart(chart)}
            </CardContent>
          </Card>
        ))}
         {analyticsData.length === 0 && !isLoading && (
            <p className="text-center text-slate-500 py-10 col-span-full">No analytics data available for the selected range.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
