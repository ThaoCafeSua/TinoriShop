import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import ExportOrdersButton from "@/components/admin/ExportOrdersButton";
import { formatPrice, ORDER_STATUS_MAP } from "@/lib/utils";
import { Eye, Search, Calendar } from "lucide-react";
import Pagination from "@/components/admin/Pagination";

interface SearchParams {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
}

async function getOrders(params: SearchParams) {
  const { status, search, startDate, endDate, page } = params;
  const currentPage = Number(page) || 1;
  const limit = 20;
  const skip = (currentPage - 1) * limit;
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { code: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
    ];
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    
    // Swap if start > end
    if (start && end && start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    
    if (start) {
      where.createdAt.gte = start;
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where })
  ]);

  return { orders, totalPages: Math.ceil(total / limit), total };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const { orders, totalPages, total } = await getOrders(params);

  const tabs = [
    { status: "", label: "Tất cả" },
    { status: "PENDING_DEPOSIT", label: "Chờ cọc" },
    { status: "PENDING_CONFIRM", label: "Chờ xác nhận" },
    { status: "CONFIRMED", label: "Đã xác nhận" },
    { status: "SHIPPING", label: "Đang giao" },
    { status: "COMPLETED", label: "Hoàn tất" },
    { status: "CANCELLED", label: "Đã hủy" },
  ];

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Đơn hàng</h1>
            <p className="text-gray-500 text-sm">{total} đơn hàng được tìm thấy</p>
          </div>
          <div>
            <ExportOrdersButton />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 space-y-4">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Tìm mã đơn, tên, sđt..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="startDate"
                defaultValue={params.startDate}
                max={params.endDate || today}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="endDate"
                defaultValue={params.endDate}
                max={today}
                min={params.startDate}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <input type="hidden" name="status" value={params.status || ""} />
            <button
              type="submit"
              className="bg-gray-900 text-white rounded-xl py-2 px-4 text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Lọc kết quả
            </button>
          </form>

          {/* Status filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-t pt-4">
            {tabs.map((tab) => {
              const query: any = { ...params, status: tab.status };
              if (!tab.status) delete query.status;
              const queryString = new URLSearchParams(query).toString();
              
              return (
                <Link
                  key={tab.status}
                  href={`/admin/orders?${queryString}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    (params.status || "") === tab.status
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] custom-scrollbar">
            <table className="w-full text-sm relative">
              <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mã đơn</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Khách hàng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                    Sản phẩm
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                    Giá trị
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Cọc</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                    Ngày đặt
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-pink-600">
                          {order.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-gray-600 text-xs leading-relaxed max-w-[250px]">
                          <p className="line-clamp-2">
                            {order.items
                              .slice(0, 2)
                              .map((i) => i.product.name)
                              .join(", ")}
                          </p>
                          {order.items.length > 2 && (
                            <span className="text-pink-600 font-semibold block mt-0.5">
                              +{order.items.length - 2} sản phẩm khác...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="font-bold text-gray-800">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            order.depositStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.depositStatus === "PAID" ? "Đã cọc" : "Chờ cọc"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh"
                        })}
                        <br />
                        {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Ho_Chi_Minh"
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {order.status === "PENDING_DEPOSIT" && (
                            <TestSePayButton orderCode={order.code} depositAmount={order.depositAmount} />
                          )}
                          <Link href={`/admin/orders/${order.id}`}>
                            <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                      Không tìm thấy đơn hàng nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
