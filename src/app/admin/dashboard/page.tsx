import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import { formatPrice, ORDER_STATUS_MAP } from "@/lib/utils";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  Heart,
} from "lucide-react";
import Link from "next/link";
import SystemMaintenance from "@/components/admin/SystemMaintenance";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";

interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

async function getStats(params: DashboardParams) {
  const { startDate, endDate } = params;
  const dateWhere: any = {};
  if (startDate || endDate) {
    dateWhere.createdAt = {};
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    
    // Swap if start > end
    if (start && end && start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    
    if (start) {
      dateWhere.createdAt.gte = start;
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
      dateWhere.createdAt.lte = end;
    }
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const visitsWhere = { ...dateWhere };
  if (!startDate && !endDate) {
    visitsWhere.createdAt = { gte: startOfToday };
  }

  // New Queries for Dashboard v2
  const [
    ordersByStatus,
    revenueData,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    allOrders, // For top products and preorder stats
    newCustomers,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: dateWhere,
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["COMPLETED", "SHIPPING", "CONFIRMED"] },
        ...dateWhere,
      },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.findMany({
      where: { stock: { lt: 5, gt: 0 }, active: true },
      select: { id: true, name: true, stock: true },
      take: 5,
    }),
    prisma.product.findMany({
      where: { stock: 0, active: true },
      select: { id: true, name: true, stock: true },
      take: 5,
    }),
    // Fetch recent valid orders to calculate top products and preorder stats
    prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        ...dateWhere,
      },
      select: {
        createdAt: true,
        status: true,
        customerPhone: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { id: true, name: true, fulfillmentType: true } }
          }
        }
      }
    }),
    // Estimate new customers by unique phones in this period (naive approach for speed)
    prisma.order.findMany({
      where: dateWhere,
      distinct: ['customerPhone'],
      select: { customerPhone: true }
    })
  ]);

  const statusCounts = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count])
  );
  const totalOrders = ordersByStatus.reduce((sum, s) => sum + s._count, 0);

  let totalRevenue = 0;
  // Prepare daily data for the past 365 days (max) or just use revenueData to group by day
  const revenueMap: Record<string, { revenue: number, orders: number }> = {};
  
  for (const order of revenueData) {
    totalRevenue += order.totalAmount;
    
    // YYYY-MM-DD
    const dateKey = new Date(order.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    if (!revenueMap[dateKey]) {
      revenueMap[dateKey] = { revenue: 0, orders: 0 };
    }
    revenueMap[dateKey].revenue += order.totalAmount;
    revenueMap[dateKey].orders += 1;
  }
  
  // Create an array of the last 365 days
  const chartData = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    chartData.push({
      date: dateKey,
      revenue: revenueMap[dateKey]?.revenue || 0,
      orders: revenueMap[dateKey]?.orders || 0,
    });
  }

  // Calculate top products and preorder stats
  const productStats: Record<string, { name: string; qty: number; rev: number; isPreorder: boolean }> = {};
  let totalPreorders = 0;
  let overduePreorders = 0;

  allOrders.forEach(order => {
    let hasPreorder = false;
    order.items.forEach(item => {
      const pId = item.product.id;
      if (!productStats[pId]) {
        productStats[pId] = { name: item.product.name, qty: 0, rev: 0, isPreorder: item.product.fulfillmentType === 'preorder' };
      }
      productStats[pId].qty += item.quantity;
      productStats[pId].rev += item.price * item.quantity;
      if (item.product.fulfillmentType === 'preorder') hasPreorder = true;
    });

    if (hasPreorder) {
      totalPreorders++;
      // If older than 10 days and not completed
      const ageInDays = (now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24);
      if (ageInDays > 10 && order.status !== 'COMPLETED' && order.status !== 'SHIPPING') {
        overduePreorders++;
      }
    }
  });

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const topPreorderProducts = Object.values(productStats)
    .filter(p => p.isPreorder)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    totalOrders,
    pendingConfirmOrders: statusCounts["PENDING_CONFIRM"] || 0,
    confirmedOrders: statusCounts["CONFIRMED"] || 0,
    shippingOrders: statusCounts["SHIPPING"] || 0,
    completedOrders: statusCounts["COMPLETED"] || 0,
    cancelledOrders: statusCounts["CANCELLED"] || 0,
    totalRevenue,
    chartData,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    newCustomersCount: newCustomers.length,
    topProducts,
    preorderStats: {
      total: totalPreorders,
      overdue: overduePreorders,
      topProducts: topPreorderProducts
    }
  };
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      customerName: true,
      customerPhone: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const [stats, recentOrders] = await Promise.all([getStats(params), getRecentOrders()]);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Khách hàng mới",
      value: stats.newCustomersCount,
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Sản phẩm đã bán",
      value: stats.topProducts.reduce((sum, p) => sum + p.qty, 0) + "+",
      icon: TrendingUp,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "Đơn chờ xử lý",
      value: stats.pendingConfirmOrders,
      icon: Clock,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      title: "Đơn Pre-order",
      value: stats.preorderStats.total,
      icon: Package,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
  ];

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Tổng quan</h1>
            <p className="text-gray-500 text-sm">
              Xin chào, {session.user?.name || session.user?.email}
            </p>
          </div>
          
          <form className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="startDate"
                defaultValue={params.startDate}
                max={params.endDate || today}
                className="pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="endDate"
                defaultValue={params.endDate}
                max={today}
                min={params.startDate}
                className="pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold">Lọc</button>
          </form>
        </div>
        
        <SystemMaintenance />

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-4 border border-transparent hover:border-pink-100 transition-all flex flex-col items-center text-center"
              >
                <div className={`w-10 h-10 ${card.bg} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${card.text}`} />
                </div>
                <p className="font-black text-xl text-gray-900 mb-0.5">
                  {card.value}
                </p>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
              </div>
            );
          })}
        </div>



        {/* Charts & Top Products */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart data={stats.chartData} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-500" /> Sản phẩm bán chạy
            </h2>
            <div className="space-y-4">
              {stats.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 shrink-0 text-xs">
                      #{idx + 1}
                    </div>
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-black text-pink-600">{p.qty} <span className="text-xs text-gray-400 font-medium">đã bán</span></p>
                  </div>
                </div>
              ))}
              {stats.topProducts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Preorder Tracking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" /> Thống kê Hàng đặt trước
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Đơn Preorder</p>
                <p className="text-2xl font-black text-indigo-700">{stats.preorderStats.total}</p>
              </div>
              <div className={`rounded-xl p-3 ${stats.preorderStats.overdue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${stats.preorderStats.overdue > 0 ? 'text-red-400' : 'text-gray-400'}`}>Sắp quá hạn 14 ngày</p>
                <p className={`text-2xl font-black ${stats.preorderStats.overdue > 0 ? 'text-red-600 flex items-center gap-2' : 'text-gray-700'}`}>
                  {stats.preorderStats.overdue}
                  {stats.preorderStats.overdue > 0 && <AlertTriangle className="h-5 w-5" />}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Preorder</p>
              {stats.preorderStats.topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-sm">
                  <span className="font-semibold text-gray-700 truncate mr-2">{p.name}</span>
                  <span className="font-bold text-indigo-600 shrink-0">{p.qty} đơn</span>
                </div>
              ))}
              {stats.preorderStats.topProducts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">Không có đơn đặt trước</p>
              )}
            </div>
          </div>

          {/* Inventory & Customers */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" /> Tồn kho
              </h2>
              <div className="space-y-3">
                {stats.outOfStockProducts.length > 0 && (
                  <div className="flex items-start gap-2 text-sm bg-red-50 text-red-700 p-3 rounded-xl border border-red-100">
                    <span className="font-black shrink-0 mt-0.5">HẾT HÀNG:</span>
                    <span className="leading-relaxed">
                      {stats.outOfStockProducts.map(p => p.name).join(", ")}
                    </span>
                  </div>
                )}
                {stats.lowStockProducts.length > 0 && (
                  <div className="flex items-start gap-2 text-sm bg-orange-50 text-orange-700 p-3 rounded-xl border border-orange-100">
                    <span className="font-black shrink-0 mt-0.5">SẮP HẾT:</span>
                    <span className="leading-relaxed">
                      {stats.lowStockProducts.map(p => `${p.name} (${p.stock})`).join(", ")}
                    </span>
                  </div>
                )}
                {stats.outOfStockProducts.length === 0 && stats.lowStockProducts.length === 0 && (
                  <div className="text-center text-sm text-gray-400 py-2">Tồn kho ổn định</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
               <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" /> Khách hàng
              </h2>
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Khách tương tác</p>
                  <p className="text-2xl font-black text-gray-900">{stats.newCustomersCount}</p>
                </div>
                 <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đơn gần đây</p>
                  <p className="text-2xl font-black text-gray-900">{recentOrders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
