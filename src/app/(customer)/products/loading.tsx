import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { SlidersHorizontal } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {/* Sort & Filter bar Skeleton */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
