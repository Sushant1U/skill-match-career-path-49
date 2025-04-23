
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useResumeStorage() {
  const [bucketExists, setBucketExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        console.log("Checking if 'resumes' bucket exists...");
        
        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
        
        if (bucketsError) {
          console.error("Error checking buckets:", bucketsError);
          
          // Try to create the bucket if we couldn't list buckets (might be permission issue)
          try {
            const { data: createData, error: createError } = await supabase.storage.createBucket('resumes', {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024 // 10MB
            });
            
            if (createError && !createError.message.includes('already exists')) {
              console.error("Error creating bucket:", createError);
              setBucketExists(false);
            } else {
              console.log("Bucket created or already exists:", createData);
              setBucketExists(true);
            }
          } catch (e) {
            console.error("Exception creating bucket:", e);
            setBucketExists(false);
          }
          
          setIsChecking(false);
          return;
        }
        
        const bucket = buckets?.find(b => b.name === 'resumes');
        
        if (!bucket) {
          console.log("Resumes bucket does not exist yet. Creating it...");
          try {
            const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('resumes', {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024 // 10MB
            });
            
            if (bucketError && !bucketError.message.includes('already exists')) {
              console.error("Error creating bucket:", bucketError);
              setBucketExists(false);
            } else {
              console.log("Bucket created successfully:", bucketData);
              setBucketExists(true);
            }
          } catch (createError) {
            console.error("Error creating bucket:", createError);
            setBucketExists(false);
          }
        } else {
          console.log("Resumes bucket exists:", bucket);
          setBucketExists(true);
        }
      } catch (error) {
        console.error("Error checking bucket:", error);
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
