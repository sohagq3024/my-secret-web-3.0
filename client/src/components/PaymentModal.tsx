import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string | null;
  onSuccess: () => void;
}

const paymentMethods = [
  { id: "visa", name: "Visa", icon: CreditCard, color: "text-blue-600" },
  { id: "mastercard", name: "Mastercard", icon: CreditCard, color: "text-red-600" },
  { id: "paypal", name: "PayPal", icon: CreditCard, color: "text-blue-500" },
  { id: "bkash", name: "Bkash", icon: Smartphone, color: "text-pink-500" },
  { id: "nagad", name: "Nagad", icon: Smartphone, color: "text-orange-500" },
];

const planPrices = {
  "3-days": { usd: 2, bdt: 150 },
  "15-days": { usd: 3, bdt: 250 },
  "30-days": { usd: 5, bdt: 500 },
};

export function PaymentModal({ isOpen, onClose, selectedPlan, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setShowForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedMethod || !user) return;

    setIsProcessing(true);
    
    try {
      const planData = planPrices[selectedPlan as keyof typeof planPrices];
      
      await apiRequest("POST", "/api/membership/request", {
        userId: user.id,
        plan: selectedPlan,
        price: planData.usd.toString(),
        paymentMethod: selectedMethod,
      });

      setShowForm(false);
      setShowSuccess(true);
      
      toast({
        title: "Payment submitted successfully!",
        description: "Your membership request has been sent to our admin team.",
      });
      
      // Close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setShowForm(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!selectedPlan) return null;

  const planData = planPrices[selectedPlan as keyof typeof planPrices];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!showForm && !showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Payment Method
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-gray-700">
                  {selectedPlan.replace("-", " ").toUpperCase()} Plan
                </p>
                <p className="text-2xl font-bold text-primary">
                  ৳{planData.bdt} (${planData.usd} USD)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className="cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200"
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <method.icon className={`h-8 w-8 mx-auto mb-2 ${method.color}`} />
                      <p className="text-sm font-medium">{method.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : showForm ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Payment Details
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-gray-700">
                  {selectedMethod?.toUpperCase()} Payment
                </p>
                <p className="text-xl font-bold text-primary">
                  ৳{planData.bdt} (${planData.usd} USD)
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      required
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      required
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full gradient-primary text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
                Payment Successful!
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-green-600 h-8 w-8" />
              </div>
              <p className="text-gray-600">
                Please wait, our agent will contact you. Thank you for your purchase.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
