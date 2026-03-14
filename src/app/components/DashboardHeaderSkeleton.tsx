export function DashboardHeaderSkeleton() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-gray-600">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-4 w-48 bg-white/20 rounded mb-2"></div>
            <div className="h-12 w-96 bg-white/30 rounded mb-3"></div>
            <div className="h-6 w-full max-w-2xl bg-white/20 rounded"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 animate-pulse"
              >
                <div className="h-5 w-5 bg-white/20 rounded mb-2"></div>
                <div className="h-8 w-16 bg-white/30 rounded mb-1"></div>
                <div className="h-3 w-20 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 animate-pulse">
              <div className="h-6 w-48 bg-white/30 rounded mb-4"></div>
              <div className="h-20 w-full bg-white/20 rounded"></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-white/30 rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full bg-white/20 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
