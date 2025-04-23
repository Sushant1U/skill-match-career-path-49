
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useResumeStorage() {
  const [bucketExists, setBucketExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        console.log("Checking if 'resumes' bucket exists...");
        
        // Try to list from the bucket as a quick check if it exists
        const { data, error } = await supabase
          .storage
          .from('resumes')
          .list('', { limit: 1 });
          
        if (!error) {
          console.log("Resumes bucket exists, found items:", data);
          setBucketExists(true);
          setIsChecking(false);
          return;
        }
        
        // If we get an error, check if it's because the bucket doesn't exist
        console.log("Bucket error response:", error);
        
        if (error.message.includes('The resource was not found') || 
            error.message.includes('404')) {
          // Bucket doesn't exist, create it
          console.log("Resumes bucket does not exist. Creating it...");
          const { data: createData, error: createError } = await supabase.storage.createBucket('resumes', {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024 // 10MB
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            setBucketExists(false);
          } else {
            console.log("Bucket created successfully:", createData);
            setBucketExists(true);
          }
        } else {
          // Other error occurred
          console.error("Error checking bucket:", error);
          setBucketExists(false);
        }
      } catch (error) {
        console.error("Exception during bucket check or creation:", error);
        setBucketExists(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAndCreateBucket();
  }, []);

  return {
    bucketExists,
    isChecking
  };
}
