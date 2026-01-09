import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CreditCard, Calendar, User, Mail, Phone, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  price: number;
  interval: "month" | "one_time";
}

export function BookingModal({ isOpen, onClose, productId, productName, price, interval }: BookingModalProps) {
  const [step, setStep] = useState<"info" | "appointment" | "processing">("info");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    requestedDate: "",
    requestedTime: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCheckoutMutation = trpc.payments.createBookingCheckout.useMutation({
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: { message: string }) => {
      setStep("appointment");
      setErrors({ submit: error.message });
    },
  });

  const validateInfoStep = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.state) newErrors.state = "State is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAppointmentStep = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.requestedDate) newErrors.requestedDate = "Please select a preferred date";
    if (!formData.requestedTime) newErrors.requestedTime = "Please select a preferred time";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === "info" && validateInfoStep()) {
      setStep("appointment");
    } else if (step === "appointment" && validateAppointmentStep()) {
      setStep("processing");
      createCheckoutMutation.mutate({
        productId,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          state: formData.state as "PA" | "UT" | "Other",
          requestedDate: formData.requestedDate,
          requestedTime: formData.requestedTime,
          selectedProgram: productName,
        },
      });
    }
  };

  const handleClose = () => {
    setStep("info");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      state: "",
      requestedDate: "",
      requestedTime: "",
    });
    setErrors({});
    onClose();
  };

  // Generate available dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Only Monday and Thursday (office hours)
      if (date.getDay() === 1 || date.getDay() === 4) {
        dates.push(date.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const availableTimes = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === "info" && "Your Information"}
            {step === "appointment" && "Schedule Your Consultation"}
            {step === "processing" && "Processing..."}
          </DialogTitle>
          <DialogDescription>
            {step === "info" && "Please provide your contact information to get started."}
            {step === "appointment" && "Select your preferred appointment date and time."}
            {step === "processing" && "Please wait while we set up your booking."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={`h-2 w-16 rounded-full ${step === "info" || step === "appointment" || step === "processing" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-16 rounded-full ${step === "appointment" || step === "processing" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 w-16 rounded-full ${step === "processing" ? "bg-primary" : "bg-muted"}`} />
        </div>

        {/* Selected program summary */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Selected Program</p>
          <p className="font-semibold">{productName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            ${price}/{interval === "month" ? "month" : "one-time"} + $50 booking deposit
          </p>
        </div>

        {step === "info" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Smith"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> State of Residence
              </Label>
              <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="UT">Utah (Coming Soon)</SelectItem>
                  <SelectItem value="Other">Other State</SelectItem>
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              {formData.state === "UT" && (
                <p className="text-sm text-amber-600">Utah telehealth services are coming soon. We'll contact you when available.</p>
              )}
              {formData.state === "Other" && (
                <p className="text-sm text-amber-600">We currently only serve PA residents. We'll notify you when we expand to your state.</p>
              )}
            </div>

            <Button onClick={handleNextStep} className="w-full">
              Continue to Scheduling
            </Button>
          </div>
        )}

        {step === "appointment" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestedDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Preferred Date
              </Label>
              <Select value={formData.requestedDate} onValueChange={(value) => setFormData({ ...formData, requestedDate: value })}>
                <SelectTrigger className={errors.requestedDate ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDates().map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDate(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.requestedDate && <p className="text-sm text-red-500">{errors.requestedDate}</p>}
              <p className="text-xs text-muted-foreground">Office hours: Monday & Thursday, 10 AM – 6 PM</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedTime">Preferred Time</Label>
              <Select value={formData.requestedTime} onValueChange={(value) => setFormData({ ...formData, requestedTime: value })}>
                <SelectTrigger className={errors.requestedTime ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.requestedTime && <p className="text-sm text-red-500">{errors.requestedTime}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is your requested appointment time. We'll confirm your exact appointment via email within 24 hours.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay $50 Deposit
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Setting up your booking...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
