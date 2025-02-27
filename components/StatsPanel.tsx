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
      <h2 className="text-xl font-semibold mb-4 text-violet-300">Data Summary</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-700/50 px-4 py-2 rounded-lg">
          <span className="text-gray-300">Total Persons</span>
          <span className="text-2xl font-bold text-violet-400">{data.length}</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">Distribution by Country</h3>
          <div className="grid gap-2">
            {sortedCountries.map(([country, count]) => (
              <div key={country} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-gray-300">{country}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-violet-500 rounded-full" 
                    style={{ width: `${(count / data.length) * 100}px` }} 
                  />
                  <span className="text-violet-400 font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
