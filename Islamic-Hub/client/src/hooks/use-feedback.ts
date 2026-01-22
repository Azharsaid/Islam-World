import { useMutation } from "@tanstack/react-query";
import { api, type InsertFeedback } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateFeedback() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      // Validate with Zod before sending
      const validated = api.feedback.create.input.parse(data);
      
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send feedback');
      }
      
      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "شكراً لك",
        description: "تم استلام رسالتك بنجاح",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
