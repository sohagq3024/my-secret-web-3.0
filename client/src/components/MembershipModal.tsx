import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { PaymentModal } from "./PaymentModal";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const membershipPlans = [
  {
    id: "3-days",
    name: "3 Days",
    priceUSD: 2,
    priceBDT: 150,
    features: [
      "View bought items",
      "Download purchased content",
      "3 days full access",
      "Basic support",
    ],
  },
  {
    id: "15-days",
    name: "15 Days",
    priceUSD: 3,
    priceBDT: 250,
    features: [
      "View bought items",
      "Download purchased content",
      "15 days full access",
      "Priority support",
      "Exclusive content",
    ],
    popular: true,
  },
  {
    id: "30-days",
    name: "30 Days",
    priceUSD: 5,
    priceBDT: 500,
    features: [
      "View bought items",
      "Download purchased content",
      "30 days full access",
      "VIP support",
      "All exclusive content",
      "Early access to new releases",
    ],
  },
];

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <Dialog open={isOpen && !showPayment} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Select Membership
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">Select the perfect membership for your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`card-hover relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 gradient-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">৳{plan.priceBDT}</div>
                  <div className="text-lg text-gray-600 mb-6">${plan.priceUSD} USD</div>
                  
                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full gradient-primary text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={showPayment}
        onClose={handleClosePayment}
        selectedPlan={selectedPlan}
        onSuccess={onClose}
      />
    </>
  );
}
