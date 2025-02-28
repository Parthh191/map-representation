interface StatsPanelProps {
  data: Array<{
    name: string;
    city: string;
    country: string;
    coordinates: [number, number];
  }>;
}

export default function StatsPanel({ data }: StatsPanelProps) {
  const countByCountry = data.reduce((acc, item) => {
    acc[item.country] = (acc[item.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countByCountry)
    .sort(([,a], [,b]) => b - a);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Data Summary</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-gray-700/30 px-6 py-4 rounded-xl border border-gray-600/30">
          <span className="text-gray-300">Total Persons</span>
          <span className="text-3xl font-bold text-violet-400">{data.length}</span>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Distribution by Country</h3>
          <div className="grid gap-3">
            {sortedCountries.map(([country, count]) => (
              <div key={country} 
                className="flex items-center justify-between p-3 rounded-xl bg-gray-700/20 hover:bg-gray-700/30 transition-colors border border-gray-600/20"
              >
                <span className="text-gray-300">{country}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" 
                    style={{ width: `${(count / data.length) * 100}px` }} 
                  />
                  <span className="text-violet-400 font-semibold min-w-[2rem] text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}