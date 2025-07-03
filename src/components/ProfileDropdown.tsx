// src/components/ProfileDropdown.tsx
import React, { useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Link } from 'react-router-dom';
import { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming shadcn/ui avatar
import { Button } from '@/components/ui/button';
import { Settings, LogOut, UserCircle, Briefcase, AlertTriangle, Loader2, Mail, Phone, ShieldCheck, Activity } from 'lucide-react'; // Added more icons

interface ProfileDropdownProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  onClose: () => void; // To close the dropdown
  onLogout: () => void; // Placeholder for logout action
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userProfile,
  isLoading,
  error,
  onClose,
  onLogout,
}) => {
  const settingsLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isLoading && !error && userProfile && settingsLinkRef.current) {
      // Delay focus slightly
      setTimeout(() => settingsLinkRef.current?.focus(), 50);
    }
  }, [isLoading, error, userProfile]);

  const getInitials = (name: string = ""): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-4">
        <div className="flex items-center justify-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-4">
        <div className="flex flex-col items-center text-red-600">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <span className="font-semibold">Error loading profile</span>
          <p className="text-xs text-center">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return ( // Should ideally not be reached if error handles 'profile not found'
      <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-4">
        <div className="flex flex-col items-center text-slate-500">
          <UserCircle className="w-8 h-8 mb-2" />
          <span className="font-semibold">Profile not available</span>
        </div>
      </div>
    );
  }

  const { name, email, role, status, profilePictureUrl, currentTask, phone } = userProfile;

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={profilePictureUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 truncate" title={name}>{name}</h4>
            <p className="text-xs text-slate-500 truncate" title={email}>{email}</p>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs">
          {phone && (
            <div className="flex items-center text-slate-600">
              <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <span>{phone}</span>
            </div>
          )}
          <div className="flex items-center text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>{role} - <span className={status === 'Active' ? 'text-green-600' : 'text-amber-600'}>{status}</span></span>
          </div>
        </div>
      </div>

      {currentTask && (
        <div className="p-4 border-b border-slate-100">
          <h5 className="text-xs font-medium text-slate-400 mb-1.5">Current Task</h5>
          <div className="flex items-start">
            <Briefcase className="w-4 h-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-700 font-medium truncate" title={currentTask.taskTitle}>
                {currentTask.taskTitle}
              </p>
              <p className="text-xs text-slate-500">
                Status: <span className={
                  currentTask.status === 'Completed' ? 'text-green-500' :
                  currentTask.status === 'In Progress' ? 'text-blue-500' : 'text-slate-500'
                }>{currentTask.status}</span>
                {currentTask.dueDate && (
                    <span className="ml-2">Due: {new Date(currentTask.dueDate).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        <Link
          ref={settingsLinkRef}
          to="/settings" // Placeholder link
          onClick={onClose}
          className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
        <Button
          variant="ghost"
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center justify-start px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
