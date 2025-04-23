
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useResumeStorage() {
  const [bucketExists, setBucketExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        console.log("Checking if 'resumes' bucket exists...");
        
        // Try to get bucket information directly
        const { data: bucketInfo, error: bucketError } = await supabase
          .storage
          .getBucket('resumes');
          
        if (!bucketError && bucketInfo) {
          console.log("Resumes bucket exists:", bucketInfo);
          setBucketExists(true);
          setIsChecking(false);
          return;
        }
        
        if (bucketError) {
          console.log("Bucket error response:", bucketError);
          
          // If error is not "bucket not found", log and exit with error
          if (!bucketError.message.includes('The resource was not found')) {
            console.error("Error checking bucket:", bucketError);
            setBucketExists(false);
            setIsChecking(false);
            return;
          }
          
          // If we get here, bucket doesn't exist, so create it
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
