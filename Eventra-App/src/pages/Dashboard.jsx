import { FaCalendarCheck, FaChartLine, FaUsers } from 'react-icons/fa'
import { FaTent } from 'react-icons/fa6'

const stats = [
  { label: 'Total Bookings', value: '127', change: '+12%', icon: FaCalendarCheck, color: 'bg-blue-600' },
  { label: 'Available Marquees', value: '18', change: '+3', icon: FaTent, color: 'bg-amber-500' },
  { label: 'Revenue This Month', value: '$45,280', change: '+8%', icon: FaChartLine, color: 'bg-green-500' },
  { label: 'Active Clients', value: '89', change: '+5', icon: FaUsers, color: 'bg-sky-500' },
]

const upcomingEvents = [
  { id: 1, name: 'Tech Conference 2025', date: '2025-11-22', marquee: 'Grand Pavilion', status: 'confirmed', attendees: 250 },
  { id: 2, name: 'Wedding Celebration', date: '2025-11-25', marquee: 'Elegant Garden', status: 'pending', attendees: 120 },
  { id: 3, name: 'Corporate Gala', date: '2025-12-01', marquee: 'Luxury Suite', status: 'confirmed', attendees: 180 },
  { id: 4, name: 'Birthday Party', date: '2025-12-05', marquee: 'Cozy Tent', status: 'confirmed', attendees: 50 },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="group rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${stat.color} p-3 text-white transition-transform group-hover:scale-110`}>
                <stat.icon className="h-5 w-5" aria-hidden />
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

  <div className="rounded-lg border border-neutral-200 bg-[--page-bg] p-6 shadow-sm dark:border-neutral-800">
        <h2 className="mb-4 text-lg font-semibold">Upcoming Events</h2>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div key={event.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-[--page-bg] p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
              <div className="flex-1">
                <h3 className="font-medium">{event.name}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{event.marquee} · {event.attendees} attendees</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${event.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
