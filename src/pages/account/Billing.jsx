import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  FileText, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Shield, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Billing() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('subscription');

  // Mock data - replace with actual data from your backend
  const subscriptionData = {
    plan: 'Pro',
    status: 'active',
    nextBillingDate: '2023-12-01',
    price: '$29.99/month',
    usage: {
      credits: 750,
      totalCredits: 1000,
      lastUpdated: '2023-11-15T14:30:00',
    },
  };

  const paymentMethods = [
    {
      id: 'card_1',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: 'card_2',
      brand: 'mastercard',
      last4: '4444',
      expMonth: 6,
      expYear: 2024,
      isDefault: false,
    },
  ];

  const invoices = [
    {
      id: 'inv_001',
      date: '2023-11-01',
      amount: '$29.99',
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'inv_002',
      date: '2023-10-01',
      amount: '$29.99',
      status: 'paid',
      downloadUrl: '#',
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUpdatePaymentMethod = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle success
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      // Handle subscription cancellation
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <Tabs 
        defaultValue="subscription" 
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your current subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold">
                      {subscriptionData.plan}
                    </p>
                    <Badge 
                      variant={subscriptionData.status === 'active' ? 'success' : 'destructive'} 
                      className="ml-2"
                    >
                      {subscriptionData.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscriptionData.nextBillingDate)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">
                    {subscriptionData.price}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Credits Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used this month</span>
                    <span>
                      {subscriptionData.usage.credits} / {subscriptionData.usage.totalCredits} credits
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{
                        width: `${(subscriptionData.usage.credits / subscriptionData.usage.totalCredits) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatDate(subscriptionData.usage.lastUpdated)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Plan
                </Button>
                <Button variant="outline" onClick={handleCancelSubscription}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear.toString().slice(-2)}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={method.isDefault}
                        onClick={() => setDefaultPaymentMethod(method.id)}
                      >
                        {method.isDefault ? 'Default' : 'Set as default'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => removePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your previous invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Invoice #{invoice.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.date)}
                        </p>
                      </div>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'success' : 'outline'}
                        className="ml-2"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">
                        {invoice.amount}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.downloadUrl}>
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No invoices found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your billing history will appear here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
