import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, Star, Download, ShoppingCart, Filter, X, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { marketplaceService } from '../../services/marketplaceService';
import { useAuth } from '../../contexts/AuthContext';
import { stripePromise } from '../../config/stripe';

export default function Marketplace() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, [selectedType, sortBy, searchQuery]);

  // Handle payment success callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && params.get('itemId')) {
      const itemId = params.get('itemId');
      toast({
        title: "Purchase successful!",
        description: "Your item has been added to your library",
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const result = await marketplaceService.getMarketplaceItems({
        type: selectedType !== 'all' ? selectedType : undefined,
        searchQuery: searchQuery || undefined,
        sortBy,
        limit: 50
      });
      setItems(result.items);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

    const handlePurchase = async (item) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase items",
        variant: "destructive",
      });
      return;
    }

    try {
      if (item.isFree) {
        // Free item - directly download
        const result = await marketplaceService.downloadItem(item.id, currentUser.uid);
        window.open(result.downloadUrl, '_blank');
        toast({
          title: "Success",
          description: "Item downloaded successfully!",
        });
      } else {
        // Paid item - redirect to Stripe checkout
        setPurchasing(true);
        try {
          const response = await fetch('/api/marketplace/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            },
            body: JSON.stringify({
              itemId: item.id,
              itemName: item.name,
              price: item.price,
              customerEmail: currentUser.email,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create checkout session');
          }

          const { sessionId } = await response.json();
          
          // Redirect to Stripe Checkout
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({ sessionId });
          
          if (error) {
            throw error;
          }
        } catch (error) {
          toast({
            title: "Error",
            description: error?.message || "Failed to process purchase",
            variant: "destructive",
          });
          setPurchasing(false);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (item) => {
    try {
      const fullItem = await marketplaceService.getMarketplaceItem(item.id);
      if (fullItem) {
        setSelectedItem(fullItem);
        setIsDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load item details",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground">Browse AI models, templates, plugins, and datasets</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ai_model">AI Models</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="plugin">Plugins</SelectItem>
            <SelectItem value="dataset">Datasets</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading marketplace items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No items found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Download className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2">
                  {item.type.replace('_', ' ')}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1 mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(item.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({item.reviewCount})
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    {item.isFree ? 'Free' : `$${item.price.toFixed(2)}`}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>By {item.creatorName}</span>
                  <span>{item.stats.downloads} downloads</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(item)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePurchase(item)}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processing...
                      </>
                    ) : item.isFree ? (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Purchase
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <p className="text-2xl font-bold">
                      {selectedItem.isFree ? 'Free' : `$${selectedItem.price.toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <div className="flex items-center gap-1">
                      {renderStars(selectedItem.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        {selectedItem.rating.toFixed(1)} ({selectedItem.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {selectedItem.previewImages && selectedItem.previewImages.length > 0 && (
                  <div>
                    <Label>Preview Images</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedItem.previewImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="rounded-md w-full h-32 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.requirements && selectedItem.requirements.length > 0 && (
                  <div>
                    <Label>Requirements</Label>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {selectedItem.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedItem.modelDetails && (
                  <div>
                    <Label>Model Details</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Framework: </span>
                        <span>{selectedItem.modelDetails.framework}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy: </span>
                        <span>{(selectedItem.modelDetails.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handlePurchase(selectedItem)}
                    className="flex-1"
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : selectedItem.isFree ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase ${selectedItem.price.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
