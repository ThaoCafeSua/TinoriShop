import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { formatPrice, ORDER_STATUS_MAP } from "@/lib/utils";
import { Eye } from "lucide-react";

interface SearchParams {
  status?: string;
}

async function getOrders(status?: string) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const orders = await getOrders(params.status);

  const tabs = [
    { status: "", label: "Tất cả" },
    { status: "PENDING_DEPOSIT", label: "Chờ cọc" },
    { status: "DEPOSIT_CONFIRMED", label: "Đã cọc" },
    { status: "PROCESSING", label: "Đang xử lý" },
    { status: "SHIPPING", label: "Đang giao" },
    { status: "DELIVERED", label: "Đã giao" },
    { status: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Đơn hàng</h1>
            <p className="text-gray-500 text-sm">{orders.length} đơn hàng</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={tab.status ? `/admin/orders?status=${tab.status}` : "/admin/orders"}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                (params.status || "") === tab.status
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
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
                        <span className="font-mono text-xs font-bold text-purple-600">
                          {order.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-gray-600 text-xs">
                          {order.items
                            .slice(0, 2)
                            .map((i) => i.product.name)
                            .join(", ")}
                          {order.items.length > 2 && ` +${order.items.length - 2}`}
                        </p>
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
                          {order.depositStatus === "PAID" ? "✓ Đã cọc" : "⏳ Chờ"}
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
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        <br />
                        {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                      Không có đơn hàng nào
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
