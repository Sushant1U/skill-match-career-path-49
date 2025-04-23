
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useResumeStorage() {
  const [bucketExists, setBucketExists] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        // Check if bucket exists by trying to list files in it
        const { data, error } = await supabase.storage
          .from('resumes')
          .list('', { limit: 1 });
        
        if (error) {
          if (error.message.includes('The resource was not found')) {
            console.log("Resumes bucket does not exist yet. Creating it...");
            try {
              const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('resumes', {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024 // 10MB
              });
              
              if (bucketError) {
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
            console.error("Error checking bucket:", error);
            setBucketExists(false);
          }
        } else {
          console.log("Resumes bucket exists:", data);
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
