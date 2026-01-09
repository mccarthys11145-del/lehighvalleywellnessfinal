import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CheckoutButtonProps {
  productId: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  email?: string;
  name?: string;
}

export default function CheckoutButton({
  productId,
  children,
  variant = "default",
  size = "default",
  className = "",
  email,
  name,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const createCheckout = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.info("Redirecting to checkout...", {
        description: "You'll be taken to our secure payment page.",
      });
      // Open checkout in new tab
      window.open(data.checkoutUrl, "_blank");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error("Checkout failed", {
        description: error.message || "Please try again or contact us for assistance.",
      });
      setIsLoading(false);
    },
  });

  const handleClick = () => {
    setIsLoading(true);
    createCheckout.mutate({ productId, email, name });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
