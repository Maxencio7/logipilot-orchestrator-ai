// src/hooks/useUserProfile.ts
import { useState, useCallback } from 'react';
import { UserProfile, TaskPreview, TaskStatus } from '@/types';
import * as api from '@/api/mockService';

export interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserTaskStatus: (userId: string, taskId: string, newStatus: TaskStatus) => Promise<void>; // Example update function
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) {
      setUserProfile(null);
      setError(new Error("User ID is required to fetch profile."));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUserProfile(userId);
      if (data) {
        setUserProfile(data);
      } else {
        setUserProfile(null);
        setError(new Error(`User profile not found for ID: ${userId}`));
      }
    } catch (err: any) {
      setError(err);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Example of a function that might update a task and then refresh the profile
  // This specific updateUserTask in mockService modifies the task in its DB and the user's currentTask.
  // So, refetching the profile should show the updated task.
  const updateUserTaskStatus = useCallback(async (userId: string, taskId: string, newStatus: TaskStatus) => {
    if (!userId || !taskId) {
        console.error("User ID and Task ID are required for update.");
        // Optionally set an error state specific to this action
        return;
    }
    setIsLoading(true); // Potentially use a different loading state for updates
    setError(null);
    try {
      // First, call the API to update the task
      // The mock updateUserTask updates the task in its DB and assigns it to the user
      await api.updateUserTask(userId, taskId, newStatus);
      // Then, refetch the user profile to get the latest state including the updated task
      // (or the mock service could return the updated profile directly)
      const updatedProfile = await api.getUserProfile(userId);
       if (updatedProfile) {
        setUserProfile(updatedProfile);
      } else {
        // This case should ideally not happen if the user exists
        setError(new Error(`User profile not found after task update for ID: ${userId}`));
      }

    } catch (err: any) {
      setError(err); // Set main error state or a specific update error state
    } finally {
      setIsLoading(false); // Reset main loading state
    }
  }, []);


  // Note: Initial fetch is not done here.
  // The component using this hook will call fetchUserProfile with a specific userId.

  return {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    updateUserTaskStatus,
  };
};
