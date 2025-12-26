'use client'

import { UserStatCard } from "@/components/user/stat-card";
import { UserServerCard } from "@/components/user/server-card";
import { Button } from "@/components/ui/button";

const servers = [
    {
      name: "Minecraft SMP",
      ip: "192.168.1.12:25565",
      status: "Running",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBogkWIMDrh5eaL38Rww_egDjkcXbBymh-eJclZx1JyY8vDV2nl_BKojR_tqGi0FnzPOK9ZLRncAdCRnKtEhBJoqoe51YNOEyVv9tvvdNKHf7KdbFP_bpVrP5hAu2JprdZQYDUmrOcJa_ZBJ1qVIHdahfPRzWOSJ8B5gYC-MZUNxRtWPc5P6wS5WROaksnw6i6FQhHHiNa1O-FU3XdRNu5mSuUQqvvMKPV3eBzSYt4ofvVVRcxN-1jePdghqzWFyACOWsWSxzveFI0",
      cpuLoad: 12,
      ramUsage: 52,
      diskUsage: 24,
      ramMax: 8,
      ramCurrent: 4.2,
      diskMax: 50,
      diskCurrent: 12,
    },
    {
      name: "Rust Wipe Server",
      ip: "192.168.1.15:28015",
      status: "Stopped",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGD3NFjk34bLUMzdtSo-u2w7yVoNWrJ0HVyCdotKfZUnaAZ_8EDRBlR2_XHvJu0PyDG-3PlyXzL8PA-JCbBJkEdMXPqDjetbNvW0_uIZ_6IY3TZVDYtFSmUFo9U1MVRFZWg_J4iBQqntp82IcUjnEHPGeYzYLqDzsPlijQG5KjdMKlnpDCyhkQyK5XiPjZVnW27M7xc9AivM322bHgceK-Rlq1a71rgMm0ZYlR4cWdjckaUuDxzTUZx7itC1DaKeV72Lv8gQwrYFM",
      cpuLoad: 0,
      ramUsage: 0,
      diskUsage: 45,
      ramMax: 16,
      ramCurrent: 0,
      diskMax: 100,
      diskCurrent: 45,
    },
    {
      name: "NodeJS API",
      ip: "10.0.0.5:3000",
      status: "Building",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJAqy7MHfRgnVhOmykFEWyCWh0uFwA53-dZMGvlTsRB_BlcLj4lkeb1tp8Js_7ngZfNyX61CqimEpU9tHpZDk0ABReG_qyKVqOrXMgzNHmWsvobDRtZmd-0vaz7PtOITipzUD8HOLaZ6DXGzACD0ZiWXvyqfF6wToqzG4IsYZ62ZBeJYHF22EMuD_mP7bnxcG2b38Wyn1aqicqRJ7O7gFmj-0jey-9EiGhFyu3qQeLx2L7sMcyidEJVzkDN-tlWylQkGZleiurppw",
      cpuLoad: 89,
      ramUsage: 60,
      diskUsage: 5,
      ramMax: 2,
      ramCurrent: 1.2,
      diskMax: 10,
      diskCurrent: 0.5,
    },
     {
      name: "CS2 Match",
      ip: "192.168.1.99:27015",
      status: "Running",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRJB6T75JCH3lfttcjhj-nAH4BuV4IgRBS-oxd80oYhWOTZ-RT7sDlvJSDtCeVKFWkpziKytI0QtKWRInQ79HPgUGQY9hadITnlRGOlvnvgb-5j4WLEf1fbyRuW1q2AM1MTeE7dcx4hm0WCVyMnpVMXlwTVH2l0ZENeJZO3OCowcxtCKohenIwQjWIZS3RrKU7ji93SNCtSH9i7dfFeZ7jBIdhy6VH2p7RfhFumTxojEjASCKyqOafEG3s7f09qShQ0leI7QBAlTQ",
      cpuLoad: 45,
      ramUsage: 55,
      diskUsage: 58,
      ramMax: 4,
      ramCurrent: 2.1,
      diskMax: 60,
      diskCurrent: 35,
    },
];

const filters = ["All Servers", "Running", "Stopped", "Installing", "Maintenance"];

export default function MyServersPage() {
    return (
        <div className="mx-auto max-w-7xl flex flex-col gap-8">
            {/* Stats Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <UserStatCard title="Total Servers" value="12" metric="+2 this month" icon="server" metricColor="text-emerald-500" />
                <UserStatCard title="Active Instances" value="8" metric="Running" icon="check_circle" iconColor="text-emerald-500" />
                <UserStatCard title="Total CPU Load" value="45%" metric="Avg across fleet" icon="memory" iconColor="text-orange-400" />
                <UserStatCard title="Monthly Cost" value="$120.50" metric="USD" icon="payments" />
            </section>

            {/* Content Header & Filters */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Your Servers</h2>
                        <p className="text-text-secondary text-sm mt-1">Manage, monitor, and configure your game servers and containers.</p>
                    </div>
                </div>
                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {filters.map((filter, index) => (
                        <Button key={filter} variant={index === 0 ? 'default' : 'outline'} size="sm" className="rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap">
                            {filter}
                        </Button>
                    ))}
                </div>
            </section>
            
            {/* Server Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {servers.map((server) => (
                    <UserServerCard key={server.name} server={server} />
                ))}
            </section>
        </div>
    )
}
