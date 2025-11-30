import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiCalendar, FiMapPin, FiUsers, FiLayers, FiFilter } from 'react-icons/fi';
import { searchService, type SearchResult } from '../services/searchService';

type FilterType = 'all' | 'events' | 'venues' | 'clients' | 'menus';
type SortOption = 'relevance' | 'name' | 'date';

const SearchPage: React.FC = () => {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResult>({ events: [], venues: [], clients: [], menus: [] });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  useEffect(() => {
    const run = async () => {
      if (!q) return;
      try {
        setLoading(true);
        setError(null);
        const res = await searchService.searchAll(q);
        setData(res);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Search failed';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q]);

  // Filter and sort results
  const filteredData = useMemo(() => {
    let result = { ...data };

    // Apply filter
    if (activeFilter !== 'all') {
      result = {
        events: activeFilter === 'events' ? data.events : [],
        venues: activeFilter === 'venues' ? data.venues : [],
        clients: activeFilter === 'clients' ? data.clients : [],
        menus: activeFilter === 'menus' ? data.menus : [],
      };
    }

    // Apply sort
    if (sortBy === 'name') {
      result.events = [...result.events].sort((a, b) => a.title.localeCompare(b.title));
      result.venues = [...result.venues].sort((a, b) => a.name.localeCompare(b.name));
      result.clients = [...result.clients].sort((a, b) => 
        `${a.firstName} ${a.secondName}`.localeCompare(`${b.firstName} ${b.secondName}`)
      );
      result.menus = [...result.menus].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'date') {
      result.events = [...result.events].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      result.venues = [...result.venues]; // Venues don't have dates
      result.clients = [...result.clients].sort((a, b) => 
        new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime()
      );
      result.menus = [...result.menus]; // Menus don't have dates
    }

    return result;
  }, [data, activeFilter, sortBy]);

  const totalResults = filteredData.events.length + filteredData.venues.length + 
                       filteredData.clients.length + filteredData.menus.length;

  const filterOptions: Array<{ key: FilterType; label: string; count: number; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'all', label: 'All', count: data.events.length + data.venues.length + data.clients.length + data.menus.length, icon: FiSearch },
    { key: 'events', label: 'Events', count: data.events.length, icon: FiCalendar },
    { key: 'venues', label: 'Venues', count: data.venues.length, icon: FiMapPin },
    { key: 'clients', label: 'Clients', count: data.clients.length, icon: FiUsers },
    { key: 'menus', label: 'Menus', count: data.menus.length, icon: FiLayers },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FiSearch className="h-5 w-5 text-gray-500"/>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        {q && <span className="text-gray-500">for "{q}"</span>}
        {!loading && totalResults > 0 && (
          <span className="text-sm text-gray-500">({totalResults} results)</span>
        )}
      </div>

      {/* Filter Tabs and Sort */}
      {!loading && !error && q && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                  ${activeFilter === key
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${activeFilter === key
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-600" />
            <label htmlFor="sort" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      )}

      {loading && <div className="card p-4 text-gray-500">Searching...</div>}
      {error && <div className="card p-4 bg-red-50 text-red-700 text-sm">{error}</div>}

      {!loading && !error && q && (
        <div className="space-y-8">
          {/* Events */}
          {(activeFilter === 'all' || activeFilter === 'events') && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FiCalendar className="h-5 w-5 text-primary-600"/>
                <h2 className="text-lg font-semibold text-gray-900">Events</h2>
                <span className="text-xs text-gray-500">{filteredData.events.length}</span>
              </div>
              {filteredData.events.length === 0 ? (
                <p className="text-sm text-gray-500">No matching events.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {filteredData.events.map(e => (
                    <Link key={e.id} to={`/dashboard/events`} className="card p-4 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{e.title}</div>
                      <div className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{e.location}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Venues */}
          {(activeFilter === 'all' || activeFilter === 'venues') && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin className="h-5 w-5 text-green-600"/>
                <h2 className="text-lg font-semibold text-gray-900">Venues</h2>
                <span className="text-xs text-gray-500">{filteredData.venues.length}</span>
              </div>
              {filteredData.venues.length === 0 ? (
                <p className="text-sm text-gray-500">No matching venues.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {filteredData.venues.map(v => (
                    <Link key={v.id} to={`/dashboard/venues`} className="card p-4 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-500">Capacity: {v.capacity}</div>
                      <div className="text-xs text-gray-500">{v.address}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Clients */}
          {(activeFilter === 'all' || activeFilter === 'clients') && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FiUsers className="h-5 w-5 text-orange-600"/>
                <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
                <span className="text-xs text-gray-500">{filteredData.clients.length}</span>
              </div>
              {filteredData.clients.length === 0 ? (
                <p className="text-sm text-gray-500">No matching clients.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {filteredData.clients.map(c => (
                    <Link key={c.id} to={`/dashboard/clients`} className="card p-4 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{c.firstName} {c.secondName}</div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                      <div className="text-xs text-gray-500">{c.company || c.phone}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Menus */}
          {(activeFilter === 'all' || activeFilter === 'menus') && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FiLayers className="h-5 w-5 text-indigo-600"/>
                <h2 className="text-lg font-semibold text-gray-900">Menus</h2>
                <span className="text-xs text-gray-500">{filteredData.menus.length}</span>
              </div>
              {filteredData.menus.length === 0 ? (
                <p className="text-sm text-gray-500">No matching menus.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {filteredData.menus.map(m => (
                    <Link key={m.id} to={`/dashboard/menus`} className="card p-4 hover:bg-gray-50">
                      <div className="font-medium text-gray-900">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.category}</div>
                      <div className="text-xs text-gray-500">${m.pricePerPerson.toFixed(2)}/person</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
