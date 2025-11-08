import { toast } from 'sonner';

/**
 * useToast hook - provides a toast API compatible with shadcn/ui
 * Uses sonner under the hood for consistency
 */
export const useToast = () => {
  return {
    toast: (options) => {
      const { title, description, variant = 'default' } = options;
      
      if (variant === 'destructive') {
        toast.error(title, {
          description,
        });
      } else {
        toast.success(title, {
          description,
        });
      }
    },
  };
};

export default useToast;

