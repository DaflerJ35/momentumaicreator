import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Search, Filter, Calendar, Download } from 'lucide-react';


// Sample history data
const historyData = [
  {
    id: 1,
    title: 'Product Launch Announcement',
    type: 'Post',
    status: 'Published',
    platforms: ['Twitter', 'LinkedIn'],
    date: '2025-05-20T10:30:00',
    engagement: 'High',
  },
  {
    id: 2,
    title: 'Weekly Blog: AI Trends',
    type: 'Blog',
    status: 'Draft',
    platforms: ['Website', 'Medium'],
    date: '2025-05-18T14:15:00',
    engagement: 'Medium',
  },
  {
    id: 3,
    title: 'New Feature Update',
    type: 'Update',
    status: 'Published',
    platforms: ['Twitter', 'Facebook', 'LinkedIn'],
    date: '2025-05-15T09:45:00',
    engagement: 'Very High',
  },
  {
    id: 4,
    title: 'Community Q&A',
    type: 'Post',
    status: 'Scheduled',
    platforms: ['Twitter', 'Instagram'],
    date: '2025-05-25T16:00:00',
    engagement: 'N/A',
  },
];

const History = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">Content History</h1>
          <p className="text-muted-foreground">View and manage your published and scheduled content</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search history..."
              className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button variant="outline" className="h-10">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="h-10">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button className="h-10">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <CardTitle>Content History</CardTitle>
            <div className="mt-2 md:mt-0 text-sm text-muted-foreground">
              Showing {historyData.length} items
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Title</th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Platforms</th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Engagement</th>
                  <th className="h-12 px-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.title}</td>
                    <td className="p-4">{item.type}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : item.status === 'Scheduled' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.platforms.map((platform) => (
                          <span key={platform} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.engagement === 'Very High' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : item.engagement === 'High' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : item.engagement === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {item.engagement}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
