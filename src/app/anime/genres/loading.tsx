export default function GenresLoading() {
  return (
    <main className="min-h-screen bg-netflix-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-9 w-48 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Genre cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  );
}