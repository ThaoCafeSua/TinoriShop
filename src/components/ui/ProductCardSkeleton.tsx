export default function ProductCardSkeleton() {
  return (
    <div className="block h-full">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm h-full flex flex-col border border-gray-50">
        <div className="relative aspect-square bg-gray-100 animate-pulse" />
        <div className="p-4 flex flex-col flex-1">
          <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4 animate-pulse" />
          
          <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-4 animate-pulse" />
          
          <div className="mt-auto">
            <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4 animate-pulse" />
            <div className="flex gap-2">
              <div className="flex-1 h-9 bg-gray-100 rounded-xl animate-pulse" />
              <div className="flex-1 h-9 bg-pink-50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
