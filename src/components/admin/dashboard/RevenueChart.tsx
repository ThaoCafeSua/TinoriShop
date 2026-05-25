"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "12months">("7days");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // In a real implementation, you would filter the `data` prop based on the timeRange.
  // For now, we will just use the passed data directly and slice it based on range.
  // Assuming `data` passed in contains daily data for the past 12 months.
  
  const displayData = useMemo(() => {
    let sliced = data;
    if (timeRange === "7days") {
      sliced = data.slice(-7);
    } else if (timeRange === "30days") {
      sliced = data.slice(-30);
    } else if (timeRange === "12months") {
      // For 12 months, we should ideally group by month.
      // We will group the raw daily data into months here.
      const monthlyData: Record<string, RevenueDataPoint> = {};
      data.forEach((d) => {
        // format expected: YYYY-MM-DD
        const month = d.date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = { date: month, revenue: 0, orders: 0 };
        }
        monthlyData[month].revenue += d.revenue;
        monthlyData[month].orders += d.orders;
      });
      sliced = Object.values(monthlyData).slice(-12);
    }
    return sliced;
  }, [data, timeRange]);

  const totalRevenue = displayData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = displayData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-pink-100 text-sm">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          <p className="text-pink-600 font-semibold">
            Doanh thu: {formatPrice(payload[0].value)}
          </p>
          <p className="text-gray-500">
            Đơn hàng: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-gray-900">Doanh thu</h2>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Tổng</p>
              <p className="text-xl font-black text-pink-600">{formatPrice(totalRevenue)}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Số đơn</p>
              <p className="text-lg font-bold text-gray-700">{totalOrders}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Trung bình</p>
              <p className="text-lg font-bold text-gray-700">{formatPrice(avgOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-50 p-1 rounded-xl flex">
            {(["7days", "30days", "12months"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  timeRange === range
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {range === "7days" ? "7 ngày" : range === "30days" ? "30 ngày" : "12 tháng"}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 p-1 rounded-xl flex">
             <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  chartType === "bar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cột
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  chartType === "line"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Đường
              </button>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fce7f3', opacity: 0.4 }} />
              <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <LineChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
