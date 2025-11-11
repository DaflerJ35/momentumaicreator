import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export default function Settings() {
  const { currentUser, updateProfile, updateEmail, updatePassword, deleteAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    website: ''
  });

  const [emailForm, setEmailForm] = useState({
    email: '',
    currentPassword: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    marketing: false,
    productUpdates: true,
    securityAlerts: true
  });

  // Load user data on mount
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        bio: currentUser.bio || '',
        website: currentUser.website || ''
      });
      setEmailForm(prev => ({ ...prev, email: currentUser.email || '' }));
    }
  }, [currentUser]);

  // Handle form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name) => {
    setNotifications(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Form submissions
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateProfile(profileForm);
      setSuccess('Profile updated successfully!');
      toast.success('Your profile has been updated.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateEmail(emailForm.email, emailForm.currentPassword);
      setSuccess('Email updated successfully!');
      toast.success('Your email has been updated.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Your password has been updated.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/');
        toast.success('Your account has been successfully deleted.');
      } catch (err) {
        setError(err.message);
        toast({
          title: 'Error',
          description: err.message,
          status: 'error',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs 
        defaultValue="profile" 
        className="space-y-6"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-1/2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account's profile information and photo.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileForm.photoURL} alt={profileForm.displayName} />
                      <AvatarFallback>
                        {profileForm.displayName ? 
                          profileForm.displayName.charAt(0).toUpperCase() : 
                          currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon" 
                      className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        // Handle photo upload
                        document.getElementById('photo-upload')?.click();
                      }}
                    >
                      <input
                        type="file"
                        id="photo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setProfileForm(prev => ({
                                ...prev,
                                photoURL: event.target?.result?.toString() || ''
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-medium leading-none">Profile Photo</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileForm.displayName}
                      onChange={handleProfileChange}
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        https://
                      </span>
                      <Input
                        id="website"
                        name="website"
                        type="text"
                        value={profileForm.website.replace('https://', '')}
                        onChange={(e) => {
                          setProfileForm(prev => ({
                            ...prev,
                            website: `https://${e.target.value}`
                          }));
                        }}
                        placeholder="yourwebsite.com"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Email</CardTitle>
              <CardDescription>
                Update your email address. You will need to confirm the new email address.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={emailForm.email}
                    onChange={handleEmailChange}
                    placeholder="Enter your new email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPasswordEmail">Current Password</Label>
                  <Input
                    id="currentPasswordEmail"
                    name="currentPassword"
                    type="password"
                    value={emailForm.currentPassword}
                    onChange={handleEmailChange}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Email'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a long, random password to stay secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new products, features, and more.
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notifications.marketing}
                    onCheckedChange={() => handleNotificationChange('marketing')}
                    disabled={!notifications.email}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="product-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get important updates about our products and services.
                    </p>
                  </div>
                  <Switch
                    id="product-updates"
                    checked={notifications.productUpdates}
                    onCheckedChange={() => handleNotificationChange('productUpdates')}
                    disabled={!notifications.email}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="security-alerts">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important security notifications.
                    </p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={notifications.securityAlerts}
                    onCheckedChange={() => handleNotificationChange('securityAlerts')}
                    disabled={!notifications.email}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button 
                onClick={() => {
                  // Save notification preferences
                  toast.success('Your notification preferences have been saved.');
                }}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible. Please be certain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-destructive p-4">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all of your data.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/50 p-4">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download all your data in a JSON file.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Export data logic
                      toast.info('Your data export has been queued. You will receive an email when it\'s ready.');
                    }}
                  >
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
