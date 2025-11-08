import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';

const Schedule = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Schedule</h1>
          <p className="text-muted-foreground">Manage your content publishing calendar</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">New Product Launch</h3>
                  <p className="text-sm text-muted-foreground">Twitter, LinkedIn, Facebook</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Tomorrow, 9:00 AM</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Weekly Blog Post</h3>
                  <p className="text-sm text-muted-foreground">Blog, LinkedIn, Twitter</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Friday, 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;
