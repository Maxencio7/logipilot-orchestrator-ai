// src/pages/SettingsPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { User, Bell, Building, Palette, Globe, Clock, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserSettings, OrganizationSettings, UserProfileSettingsFormData, NotificationPreferencesFormData, OrganizationSettingsFormData } from '@/types';
import * as api from '@/api/mockService';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Zod Schemas for forms
const userProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

const notificationPrefsSchema = z.object({
  emailNotifications: z.object({
    newShipmentUpdates: z.boolean().optional(),
    shipmentDelays: z.boolean().optional(),
    clientMessages: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }).optional(),
  // Skipping push & inApp for brevity in this form example
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

const orgSettingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  primaryContactEmail: z.string().email("Invalid email").optional(),
  defaultCurrency: z.string().length(3, "Currency code must be 3 letters").optional(),
  defaultTimezone: z.string().optional(),
});


const SettingsPage = () => {
  const { toast } = useToast();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // --- User Settings Form ---
  const userProfileForm = useForm<UserProfileSettingsFormData>({ resolver: zodResolver(userProfileSchema) });
  const notificationPrefsForm = useForm<NotificationPreferencesFormData & {theme?: string, language?: string, timezone?: string}>({ resolver: zodResolver(notificationPrefsSchema) });

  // --- Org Settings Form ---
  const orgDetailsForm = useForm<OrganizationSettingsFormData>({ resolver: zodResolver(orgSettingsSchema) });

  const fetchAllSettings = useCallback(async () => {
    setIsLoadingUser(true); setIsLoadingOrg(true);
    try {
      const [userData, orgData] = await Promise.all([
        api.getUserSettings(),
        api.getOrganizationSettings(),
      ]);
      setUserSettings(userData);
      setOrgSettings(orgData);
      // Reset forms with fetched data
      userProfileForm.reset(userData.profile);
      notificationPrefsForm.reset({
        emailNotifications: userData.notifications.emailNotifications,
        theme: userData.theme, language: userData.language, timezone: userData.timezone
      });
      orgDetailsForm.reset(orgData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load settings.", variant: "destructive"});
      console.error(error);
    } finally {
      setIsLoadingUser(false); setIsLoadingOrg(false);
    }
  }, [toast, userProfileForm, notificationPrefsForm, orgDetailsForm]);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  // --- Save Handlers with Auto-Save Simulation ---
  const handleSaveUserProfile: SubmitHandler<UserProfileSettingsFormData> = async (data) => {
    if (!userSettings) return;
    setIsSavingUser(true);
    try {
      const updatedProfile = { ...userSettings.profile, ...data };
      await api.updateUserSettings(userSettings.id, { profile: updatedProfile });
      setUserSettings(prev => prev ? {...prev, profile: updatedProfile} : null);
      toast({ title: "Profile Saved", description: "Your profile information has been updated." });
    } catch (e) { toast({ title: "Error", description: "Failed to save profile.", variant: "destructive"}); }
    finally { setIsSavingUser(false); }
  };

  const handleSaveNotificationPrefs: SubmitHandler<any> = async (data) => {
    if (!userSettings) return;
    setIsSavingUser(true); // Use same saving flag or could have separate
    try {
      const { theme, language, timezone, ...notifPrefsData } = data;
      const updatedSettings: Partial<UserSettings> = {
        notifications: notifPrefsData.emailNotifications ? { ...userSettings.notifications, emailNotifications: notifPrefsData.emailNotifications } : userSettings.notifications,
        theme: theme || userSettings.theme,
        language: language || userSettings.language,
        timezone: timezone || userSettings.timezone,
      };
      await api.updateUserSettings(userSettings.id, updatedSettings);
      setUserSettings(prev => prev ? {...prev, ...updatedSettings} : null);
      toast({ title: "Preferences Saved", description: "Notification and display settings updated." });
    } catch (e) { toast({ title: "Error", description: "Failed to save preferences.", variant: "destructive"}); }
    finally { setIsSavingUser(false); }
  };

  const handleSaveOrgSettings: SubmitHandler<OrganizationSettingsFormData> = async (data) => {
    if (!orgSettings) return;
    setIsSavingOrg(true);
    try {
      await api.updateOrganizationSettings(orgSettings.id, data);
      setOrgSettings(prev => prev ? {...prev, ...data} : null);
      toast({ title: "Organization Settings Saved", description: "Organization details have been updated." });
    } catch (e) { toast({ title: "Error", description: "Failed to save organization settings.", variant: "destructive"}); }
    finally { setIsSavingOrg(false); }
  };

  // Auto-save simulation (onBlur for inputs, onCheckedChange for switches)
  // For brevity, I'll show one example for profile and one for org.
  // A more robust solution might use _.debounce or watch fields.

  if (isLoadingUser || isLoadingOrg) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-logistics-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center"><User className="mr-3 w-8 h-8 text-logistics-primary" />Settings</h1>

      {/* User Profile Card */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/>User Profile</CardTitle><CardDescription>Manage your personal information.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={userProfileForm.handleSubmit(handleSaveUserProfile)}>
            <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfileForm.watch('avatarUrl') || userSettings?.profile.avatarUrl || '/placeholder.svg'} alt={userSettings?.profile.fullName} />
                    <AvatarFallback>{userSettings?.profile.fullName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-1">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input id="avatarUrl" {...userProfileForm.register('avatarUrl')} placeholder="https://example.com/avatar.png" onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} />
                     {userProfileForm.formState.errors.avatarUrl && <p className="text-xs text-red-500">{userProfileForm.formState.errors.avatarUrl.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" {...userProfileForm.register('fullName')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} />{userProfileForm.formState.errors.fullName && <p className="text-xs text-red-500">{userProfileForm.formState.errors.fullName.message}</p>}</div>
              <div><Label htmlFor="email">Email (Read-only)</Label><Input id="email" value={userSettings?.profile.email || ''} readOnly disabled /></div>
              <div><Label htmlFor="jobTitle">Job Title</Label><Input id="jobTitle" {...userProfileForm.register('jobTitle')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} /></div>
              <div><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" {...userProfileForm.register('phoneNumber')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} /></div>
            </div>
             {isSavingUser && <p className="text-xs text-slate-500 italic mt-2 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving...</p>}
          </form>
        </CardContent>
      </Card>

      {/* Notification and Display Preferences Card */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Bell className="mr-2"/>Preferences</CardTitle><CardDescription>Manage your notification and display settings.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)}>
            <h3 className="text-md font-semibold mb-2">Email Notifications</h3>
            <div className="space-y-3">
                {Object.keys(userSettings?.notifications.emailNotifications || {}).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`email-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Controller name={`emailNotifications.${key as keyof NotificationPreferences['emailNotifications']}`} control={notificationPrefsForm.control} render={({ field }) => (<Switch id={`email-${key}`} checked={field.value} onCheckedChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} /> )} />
                    </div>
                ))}
            </div>
            <Separator className="my-6" />
            <h3 className="text-md font-semibold mb-2">Display Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="theme">Theme</Label><Controller name="theme" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select theme"/></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select>)} /></div>
                <div><Label htmlFor="language">Language (Mock)</Label><Controller name="language" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español (Mock)</SelectItem></SelectContent></Select>)} /></div>
                <div><Label htmlFor="timezone">Timezone (Mock)</Label><Controller name="timezone" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select timezone"/></SelectTrigger><SelectContent><SelectItem value="America/New_York">Eastern Time (ET)</SelectItem><SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem><SelectItem value="Europe/London">GMT/London</SelectItem></SelectContent></Select>)} /></div>
            </div>
            {isSavingUser && <p className="text-xs text-slate-500 italic mt-4 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving...</p>}
          </form>
        </CardContent>
      </Card>

      {/* Organization Settings Card (simplified for example) */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Building className="mr-2"/>Organization Settings</CardTitle><CardDescription>Manage your organization's details (Admin only - RBAC pending).</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={orgDetailsForm.handleSubmit(handleSaveOrgSettings)}>
            <div><Label htmlFor="organizationName">Organization Name</Label><Input id="organizationName" {...orgDetailsForm.register('organizationName')} onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.organizationName && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.organizationName.message}</p>}</div>
            <div><Label htmlFor="orgLogoUrl">Logo URL</Label><Input id="orgLogoUrl" {...orgDetailsForm.register('logoUrl')} placeholder="https://example.com/logo.png" onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.logoUrl && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.logoUrl.message}</p>}</div>
            {/* Add more org settings fields here: contact, currency, timezone, etc. */}
            {isSavingOrg && <p className="text-xs text-slate-500 italic mt-2 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving...</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
