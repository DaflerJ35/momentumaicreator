import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../../components/ui/button';
import { Download, Filter, Calendar, TrendingUp, Users, Eye, Heart } from 'lucide-react';

const analyticsData = [
  { name: 'Jan', engagement: 65, reach: 78, impressions: 89 },
  { name: 'Feb', engagement: 59, reach: 80, impressions: 81 },
  { name: 'Mar', engagement: 80, reach: 90, impressions: 95 },
  { name: 'Apr', engagement: 81, reach: 96, impressions: 100 },
  { name: 'May', engagement: 56, reach: 77, impressions: 85 },
  { name: 'Jun', engagement: 55, reach: 75, impressions: 82 },
];

const platformData = [
  { name: 'Twitter', value: 45, color: '#1DA1F2' },
  { name: 'LinkedIn', value: 30, color: '#0077B5' },
  { name: 'Facebook', value: 15, color: '#4267B2' },
  { name: 'Instagram', value: 10, color: '#E4405F' },
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400">Track and analyze your content performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-slate-800/50 border-slate-700">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" className="bg-slate-800/50 border-slate-700">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Engagement', value: '1,234', change: '+12%', icon: Heart, gradient: 'from-emerald-500 to-cyan-500' },
          { title: 'Total Reach', value: '8,567', change: '+8%', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
          { title: 'Impressions', value: '23,456', change: '+15%', icon: Eye, gradient: 'from-purple-500 to-pink-500' },
          { title: 'Growth Rate', value: '24.3%', change: '+5.2%', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-emerald-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-400">{kpi.change}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{kpi.title}</p>
                    <p className="text-3xl font-bold text-white">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="engagement" fill="#10b981" name="Engagement" />
                <Bar dataKey="reach" fill="#3b82f6" name="Reach" />
                <Bar dataKey="impressions" fill="#8b5cf6" name="Impressions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">Content Title {item}</h4>
                    <p className="text-sm text-slate-400">Posted {item} days ago</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-400">{Math.floor(Math.random() * 500) + 100}</div>
                    <div className="text-xs text-slate-400">engagements</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Engagement by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{platform.name}</span>
                    <span className="font-medium text-white">{platform.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${platform.value}%`,
                        backgroundColor: platform.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
