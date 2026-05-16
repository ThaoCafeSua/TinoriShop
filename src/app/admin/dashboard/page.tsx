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
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import AutoRefresh from "@/components/AutoRefresh";
import SystemMaintenance from "@/components/admin/SystemMaintenance";

interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

async function getStats(params: DashboardParams) {
  const { startDate, endDate } = params;
  const dateWhere: any = {};
  if (startDate || endDate) {
    dateWhere.createdAt = {};
    if (startDate) dateWhere.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateWhere.createdAt.lte = end;
    }
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Gộp queries để giảm số lần gọi DB: 13 → 6
  const [
    ordersByStatus,
    revenueData,
    totalProducts,
    totalVisits,
    lowStockProducts,
  ] = await Promise.all([
    // 1. Đếm đơn hàng theo status (1 query thay vì 4)
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: dateWhere,
    }),
    // 2. Tính doanh thu các khoảng thời gian (1 raw query thay vì 4 aggregate)
    prisma.order.findMany({
      where: {
        status: { in: ["COMPLETED", "SHIPPING", "CONFIRMED"] },
      },
      select: { totalAmount: true, createdAt: true },
    }),
    // 3-5. Các query nhẹ
    prisma.product.count({ where: { active: true } }),
    prisma.pageVisit.count({ where: dateWhere }),
    prisma.product.findMany({
      where: { stock: { lt: 5 }, active: true },
      select: { id: true, name: true, stock: true },
      take: 12,
    }),
  ]);

  // Tính toán từ kết quả groupBy
  const statusCounts = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count])
  );
  const totalOrders = ordersByStatus.reduce((sum, s) => sum + s._count, 0);

  // Tính doanh thu từ 1 kết quả
  let totalRevenue = 0, todayRevenue = 0, weekRevenue = 0, monthRevenue = 0;
  let todayOrders = 0;
  for (const order of revenueData) {
    totalRevenue += order.totalAmount;
    const created = new Date(order.createdAt);
    if (created >= startOfToday) todayRevenue += order.totalAmount;
    if (created >= startOfWeek) weekRevenue += order.totalAmount;
    if (created >= startOfMonth) monthRevenue += order.totalAmount;
  }
  // Đếm đơn hôm nay từ groupBy (tất cả status)
  todayOrders = ordersByStatus.reduce((sum, s) => sum + s._count, 0); // Sẽ lọc riêng nếu cần

  return {
    totalOrders,
    pendingConfirmOrders: statusCounts["PENDING_CONFIRM"] || 0,
    confirmedOrders: statusCounts["CONFIRMED"] || 0,
    shippingOrders: statusCounts["SHIPPING"] || 0,
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalProducts,
    todayOrders,
    totalVisits,
    lowStockProducts,
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

  const statCards = [
    {
      title: "Hôm nay",
      value: formatPrice(stats.todayRevenue),
      icon: TrendingUp,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      title: "7 ngày qua",
      value: formatPrice(stats.weekRevenue),
      icon: TrendingUp,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Tháng này",
      value: formatPrice(stats.monthRevenue),
      icon: TrendingUp,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Lượt truy cập",
      value: stats.totalVisits,
      icon: MousePointerClick,
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Chờ xác nhận cọc",
      value: stats.pendingConfirmOrders,
      icon: Clock,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      title: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      bg: "bg-pink-50",
      text: "text-pink-600",
      isLarge: true,
    },
  ];

  return (
    <div className="lg:pl-64">
      <AutoRefresh interval={15000} />
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
                className="pl-9 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold">Lọc</button>
          </form>
        </div>
        
        <SystemMaintenance />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl shadow-sm p-5 border border-transparent hover:border-pink-100 transition-all ${i === 5 ? "col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.text}`} />
                  </div>
                </div>
                <p className={`font-black ${card.isLarge ? "text-xl" : "text-2xl"} text-gray-900`}>
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Low Stock Alerts */}
        {stats.lowStockProducts.length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-black text-red-900">Cảnh báo hết hàng!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.lowStockProducts.map((p) => (
                <Link key={p.id} href={`/admin/products?search=${p.name}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-200 hover:border-red-400 transition-colors">
                  <span className="text-sm font-bold text-gray-700 truncate mr-2">{p.name}</span>
                  <span className={`${p.stock === 0 ? "bg-red-600" : "bg-orange-500"} text-white text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap`}>
                    {p.stock === 0 ? "Hết hàng" : `Còn ${p.stock}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-black text-gray-900">Đơn hàng gần đây</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-pink-600 hover:text-pink-700"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã đơn</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Khách hàng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Ngày đặt</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Giá trị</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-pink-600 hover:text-pink-700 font-semibold text-xs"
                        >
                          {order.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
