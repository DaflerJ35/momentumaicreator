import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Copy, Share2, Mail, MessageSquare, Award, TrendingUp, Users, Gift, CheckCircle, Star } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { referralService } from '../../services/referralService';
import { useAuth } from '../../contexts/AuthContext';
import confetti from 'canvas-confetti';

export default function Referrals() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailInvite, setEmailInvite] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        referralService.getUserReferralStats(currentUser.uid),
        referralService.getUserReferralHistory(currentUser.uid)
      ]);
      setStats(statsData);
      setReferralLink(statsData.referralLink);
      setReferralHistory(historyData.referrals || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShare = (platform) => {
    const text = `Join Momentum AI and get amazing AI-powered content tools! Use my referral link: ${referralLink}`;
    const url = encodeURIComponent(referralLink);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailInvite = async () => {
    if (!emailInvite.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInvite.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { unifiedAPI } = await import('../../lib/unifiedAPI');
      await unifiedAPI.post('/referrals/invite', {
        email: emailInvite.trim(),
      });
      
      toast({
        title: "Success",
        description: `Invitation sent to ${emailInvite}`,
      });
      setEmailInvite('');
    } catch (error) {
      console.error('Failed to send referral invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = () => {
    if (!stats) return 0;
    const nextTier = getNextTier(stats.completedReferrals);
    if (!nextTier) return 100;
    return (stats.completedReferrals / nextTier) * 100;
  };

  const getNextTier = (current) => {
    if (current < 5) return 5;
    if (current < 10) return 10;
    if (current < 25) return 25;
    if (current < 50) return 50;
    return null;
  };

  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">Earn rewards by inviting friends to Momentum AI</p>
      </div>

      {/* Hero Section - Referral Link */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">Your Referral Link</CardTitle>
          <CardDescription className="text-emerald-100">
            Share this link with friends and earn rewards when they sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button onClick={handleCopyLink} variant="secondary">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => handleShare('twitter')}>
              <Share2 className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleShare('facebook')}>
              <Share2 className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleShare('linkedin')}>
              <Share2 className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingReferrals || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalEarned?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              In rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.availableRewards?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Ready to redeem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Progress to Next Reward Tier</CardTitle>
          <CardDescription>
            {stats?.completedReferrals || 0} referrals completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgressPercentage()} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Tier</span>
            <span className="font-medium">
              {getTierName(stats?.completedReferrals || 0)}
            </span>
          </div>
          {getNextTier(stats?.completedReferrals || 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Tier</span>
              <span className="font-medium">
                {getTierName(getNextTier(stats?.completedReferrals || 0))} 
                ({getNextTier(stats?.completedReferrals || 0) - (stats?.completedReferrals || 0)} more)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Invite */}
      <Card>
        <CardHeader>
          <CardTitle>Invite by Email</CardTitle>
          <CardDescription>Send an invitation directly to someone's inbox</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={emailInvite}
              onChange={(e) => setEmailInvite(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleEmailInvite}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track all your referrals and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {referralHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet</p>
              <p className="text-sm">Start sharing your link to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referralHistory.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{referral.refereeEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        referral.status === 'completed' ? 'default' :
                        referral.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getTierName(referrals) {
  if (referrals < 5) return 'Bronze';
  if (referrals < 10) return 'Silver';
  if (referrals < 25) return 'Gold';
  if (referrals < 50) return 'Platinum';
  return 'Diamond';
}
