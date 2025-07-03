// src/pages/SettingsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { User, Bell, Building, Loader2 } from 'lucide-react';
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
import { UserSettings, OrganizationSettings, UserProfileSettingsFormData, NotificationPreferencesFormData, OrganizationSettingsFormData, ApiResponse } from '@/types';
import apiService from '@/api/apiService';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';

// Zod Schemas for forms
const userProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  jobTitle: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
});

const notificationPrefsSchema = z.object({
  emailNotifications: z.object({
    newShipmentUpdates: z.boolean().optional(),
    shipmentDelays: z.boolean().optional(),
    clientMessages: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
    weeklySummary: z.boolean().optional(),
  }).deepPartial().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

const orgSettingsSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')).nullable(),
  primaryContactEmail: z.string().email("Invalid email").optional().or(z.literal('')).nullable(),
  defaultCurrency: z.string().length(3, "Currency code must be 3 letters").optional().or(z.literal('')).nullable(),
  defaultTimezone: z.string().optional().or(z.literal('')).nullable(),
});


const SettingsPage = () => {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading, login } = useAuth(); // Using login to potentially refresh user state after update

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isSavingUserProfile, setIsSavingUserProfile] = useState(false);
  const [isSavingUserPrefs, setIsSavingUserPrefs] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  const userProfileForm = useForm<UserProfileSettingsFormData>({ resolver: zodResolver(userProfileSchema) });
  const notificationPrefsForm = useForm<NotificationPreferencesFormData & Pick<UserSettings, 'theme'|'language'|'timezone'>>({ resolver: zodResolver(notificationPrefsSchema) });
  const orgDetailsForm = useForm<OrganizationSettingsFormData>({ resolver: zodResolver(orgSettingsSchema) });

  const fetchAllSettings = useCallback(async () => {
    if (!authUser && !authLoading) { // Only proceed if auth state is resolved and there's a user
      toast({ title: "Authentication Required", description: "Please log in to view settings.", variant: "destructive"});
      setIsLoadingUser(false); setIsLoadingOrg(false);
      return;
    }
    if (authLoading) return; // Wait for auth to resolve

    setIsLoadingUser(true); setIsLoadingOrg(true);
    try {
      const [userResponse, orgResponse] = await Promise.all([
        apiService.get<ApiResponse<UserSettings>>(`/users/me`),
        apiService.get<ApiResponse<OrganizationSettings>>(`/organization/settings`), // Assuming this endpoint exists
      ]);

      if (userResponse.data.data) {
        setUserSettings(userResponse.data.data);
        userProfileForm.reset(userResponse.data.data.profile);
        notificationPrefsForm.reset({
          emailNotifications: userResponse.data.data.notifications.emailNotifications,
          theme: userResponse.data.data.theme,
          language: userResponse.data.data.language,
          timezone: userResponse.data.data.timezone
        });
      } else if (userResponse.data.error) {
        toast({ title: "Error User Settings", description: userResponse.data.error, variant: "destructive"});
      }

      if (orgResponse.data.data) {
        setOrgSettings(orgResponse.data.data);
        orgDetailsForm.reset(orgResponse.data.data);
      } else if (orgResponse.data.error) {
         toast({ title: "Error Org Settings", description: orgResponse.data.error, variant: "destructive"});
      }
    } catch (error) {
      // Errors are usually caught by the interceptor, this is a fallback.
      console.error("Failed to load settings:", error);
      toast({ title: "Error", description: "Failed to load some settings data.", variant: "destructive"});
    } finally {
      setIsLoadingUser(false); setIsLoadingOrg(false);
    }
  }, [toast, userProfileForm, notificationPrefsForm, orgDetailsForm, authUser, authLoading]);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const handleSaveUserProfile: SubmitHandler<UserProfileSettingsFormData> = async (data) => {
    if (!userSettings || !authUser) return;
    setIsSavingUserProfile(true);
    try {
      const response = await apiService.put<ApiResponse<UserSettings>>(`/users/me`, { profile: data });
      if (response.data.data) {
        setUserSettings(response.data.data);
        userProfileForm.reset(response.data.data.profile);
        if (authUser.role) login(authUser.role); // Re-fetch user in auth context to update header etc.
        toast({ title: "Profile Saved", description: "Your profile information has been updated." });
      } else {
        toast({ title: "Save Error", description: response.data.error || "Failed to save profile.", variant: "destructive"});
      }
    } catch (e) { /* API errors handled by interceptor */ }
    finally { setIsSavingUserProfile(false); }
  };

  const handleSaveNotificationPrefs: SubmitHandler<NotificationPreferencesFormData & Pick<UserSettings, 'theme'|'language'|'timezone'>> = async (data) => {
    if (!userSettings || !authUser) return;
    setIsSavingUserPrefs(true);
    try {
      // Construct payload carefully for partial updates, especially for nested objects
      const payload: Partial<UserSettings> = {
        notifications: data.emailNotifications ? {
             ...userSettings.notifications, // Keep existing push/inApp settings
             emailNotifications: {
                ...userSettings.notifications.emailNotifications, // Keep existing email settings
                ...data.emailNotifications // Override with new ones
             }
        } : userSettings.notifications,
        theme: data.theme || userSettings.theme,
        language: data.language || userSettings.language,
        timezone: data.timezone || userSettings.timezone,
      };
      const response = await apiService.put<ApiResponse<UserSettings>>(`/users/me`, payload);
      if (response.data.data) {
        setUserSettings(response.data.data);
        notificationPrefsForm.reset({
            emailNotifications: response.data.data.notifications.emailNotifications,
            theme: response.data.data.theme,
            language: response.data.data.language,
            timezone: response.data.data.timezone
        });
        if (authUser.role) login(authUser.role); // Re-fetch user in auth context
        toast({ title: "Preferences Saved", description: "Notification and display settings updated." });
      } else {
         toast({ title: "Save Error", description: response.data.error || "Failed to save preferences.", variant: "destructive"});
      }
    } catch (e) { /* Handled by interceptor */ }
    finally { setIsSavingUserPrefs(false); }
  };

  const handleSaveOrgSettings: SubmitHandler<OrganizationSettingsFormData> = async (data) => {
    if (!orgSettings) return;
    setIsSavingOrg(true);
    try {
      const response = await apiService.put<ApiResponse<OrganizationSettings>>(`/organization/settings`, data);
      if (response.data.data) {
        setOrgSettings(response.data.data);
        orgDetailsForm.reset(response.data.data);
        toast({ title: "Organization Settings Saved", description: "Organization details have been updated." });
      } else {
        toast({ title: "Save Error", description: response.data.error || "Failed to save organization settings.", variant: "destructive"});
      }
    } catch (e) { /* Handled by interceptor */ }
    finally { setIsSavingOrg(false); }
  };

  if (isLoadingUser || isLoadingOrg || authLoading) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-logistics-primary" /></div>;
  }

  if (!authUser && !authLoading) {
     return <div className="p-6 text-center text-red-500">Please log in to access settings.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center"><User className="mr-3 w-8 h-8 text-logistics-primary" />Settings</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/>User Profile</CardTitle><CardDescription>Manage your personal information.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={userProfileForm.handleSubmit(handleSaveUserProfile)}>
            <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfileForm.getValues('avatarUrl') || userSettings?.profile.avatarUrl || authUser?.avatarUrl || '/placeholder.svg'} alt={userSettings?.profile.fullName || authUser?.name} />
                    <AvatarFallback>{userSettings?.profile.fullName?.charAt(0).toUpperCase() || authUser?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-1">
                    <Label htmlFor="avatarUrlProf">Avatar URL</Label>
                    <Input id="avatarUrlProf" {...userProfileForm.register('avatarUrl')} placeholder="https://example.com/avatar.png" onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} />
                     {userProfileForm.formState.errors.avatarUrl && <p className="text-xs text-red-500">{userProfileForm.formState.errors.avatarUrl.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="fullNameProf">Full Name</Label><Input id="fullNameProf" {...userProfileForm.register('fullName')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} />{userProfileForm.formState.errors.fullName && <p className="text-xs text-red-500">{userProfileForm.formState.errors.fullName.message}</p>}</div>
              <div><Label htmlFor="emailProf">Email (Read-only)</Label><Input id="emailProf" value={userSettings?.profile.email || authUser?.email || ''} readOnly disabled /></div>
              <div><Label htmlFor="jobTitleProf">Job Title</Label><Input id="jobTitleProf" {...userProfileForm.register('jobTitle')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} /></div>
              <div><Label htmlFor="phoneNumberProf">Phone Number</Label><Input id="phoneNumberProf" {...userProfileForm.register('phoneNumber')} onBlur={userProfileForm.handleSubmit(handleSaveUserProfile)} /></div>
            </div>
             {isSavingUserProfile && <p className="text-xs text-slate-500 italic mt-2 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving Profile...</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Bell className="mr-2"/>Preferences</CardTitle><CardDescription>Manage your notification and display settings.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)}>
            <h3 className="text-md font-semibold mb-2">Email Notifications</h3>
            <div className="space-y-3">
                {userSettings && userSettings.notifications && userSettings.notifications.emailNotifications && Object.keys(userSettings.notifications.emailNotifications).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`email-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Controller name={`emailNotifications.${key as keyof NotificationPreferences['emailNotifications']}`} control={notificationPrefsForm.control} render={({ field }) => (<Switch id={`email-${key}`} checked={!!field.value} onCheckedChange={(val) => { field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)(); }} /> )} />
                    </div>
                ))}
            </div>
            <Separator className="my-6" />
            <h3 className="text-md font-semibold mb-2">Display Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="theme">Theme</Label><Controller name="theme" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select theme"/></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select>)} /></div>
                <div><Label htmlFor="language">Language</Label><Controller name="language" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select>)} /></div>
                <div><Label htmlFor="timezone">Timezone</Label><Controller name="timezone" control={notificationPrefsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); notificationPrefsForm.handleSubmit(handleSaveNotificationPrefs)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select timezone"/></SelectTrigger><SelectContent><SelectItem value="America/New_York">Eastern Time (ET)</SelectItem><SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem><SelectItem value="Europe/London">GMT/London</SelectItem></SelectContent></Select>)} /></div>
            </div>
            {isSavingUserPrefs && <p className="text-xs text-slate-500 italic mt-4 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving Preferences...</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Building className="mr-2"/>Organization Settings</CardTitle><CardDescription>Manage your organization's details (Admin only - RBAC pending).</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={orgDetailsForm.handleSubmit(handleSaveOrgSettings)}>
            <div><Label htmlFor="organizationNameOrg">Organization Name</Label><Input id="organizationNameOrg" {...orgDetailsForm.register('organizationName')} onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.organizationName && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.organizationName.message}</p>}</div>
            <div><Label htmlFor="orgLogoUrlOrg">Logo URL</Label><Input id="orgLogoUrlOrg" {...orgDetailsForm.register('logoUrl')} placeholder="https://example.com/logo.png" onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.logoUrl && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.logoUrl.message}</p>}</div>
            <div><Label htmlFor="orgContactEmail">Primary Contact Email</Label><Input id="orgContactEmail" type="email" {...orgDetailsForm.register('primaryContactEmail')} onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.primaryContactEmail && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.primaryContactEmail.message}</p>}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="orgCurrency">Default Currency</Label><Input id="orgCurrency" {...orgDetailsForm.register('defaultCurrency')} placeholder="USD" onBlur={orgDetailsForm.handleSubmit(handleSaveOrgSettings)} />{orgDetailsForm.formState.errors.defaultCurrency && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.defaultCurrency.message}</p>}</div>
                <div><Label htmlFor="orgTimezone">Default Timezone</Label><Controller name="defaultTimezone" control={orgDetailsForm.control} render={({ field }) => (<Select onValueChange={(val) => {field.onChange(val); orgDetailsForm.handleSubmit(handleSaveOrgSettings)() }} value={field.value}><SelectTrigger><SelectValue placeholder="Select timezone"/></SelectTrigger><SelectContent><SelectItem value="America/New_York">Eastern Time (ET)</SelectItem><SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem><SelectItem value="Europe/London">GMT/London</SelectItem></SelectContent></Select>)} />{orgDetailsForm.formState.errors.defaultTimezone && <p className="text-xs text-red-500">{orgDetailsForm.formState.errors.defaultTimezone.message}</p>}</div>
            </div>
            {isSavingOrg && <p className="text-xs text-slate-500 italic mt-2 flex items-center"><Loader2 className="mr-1 h-3 w-3 animate-spin"/>Saving Organization Settings...</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
