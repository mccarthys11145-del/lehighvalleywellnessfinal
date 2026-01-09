import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  Save,
  User,
  FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  CONTACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  SCHEDULED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const interestLabels: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss",
  MENOPAUSE_HRT: "Menopause/HRT",
  GENERAL: "General Question",
  OTHER: "Other",
};

const contactMethodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  PHONE: { label: "Phone", icon: <Phone className="h-4 w-4" /> },
  EMAIL: { label: "Email", icon: <Mail className="h-4 w-4" /> },
  TEXT: { label: "Text Message", icon: <MessageSquare className="h-4 w-4" /> },
};

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const leadId = params.id;

  const { data: lead, isLoading, refetch } = trpc.admin.getLead.useQuery(
    { id: leadId! },
    { enabled: !!leadId }
  );

  const [status, setStatus] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setInternalNotes(lead.internalNotes || "");
    }
  }, [lead]);

  useEffect(() => {
    if (lead) {
      const statusChanged = status !== lead.status;
      const notesChanged = internalNotes !== (lead.internalNotes || "");
      setHasChanges(statusChanged || notesChanged);
    }
  }, [status, internalNotes, lead]);

  const updateLead = trpc.admin.updateLead.useMutation({
    onSuccess: () => {
      toast.success("Lead updated successfully");
      refetch();
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead");
    },
  });

  const handleSave = () => {
    if (!leadId) return;
    updateLead.mutate({
      id: leadId,
      status: status as any,
      internalNotes: internalNotes || null,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading lead details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Lead not found</p>
            <Link href="/admin/leads">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leads
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const contactMethod = contactMethodLabels[lead.preferredContactMethod];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/leads">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold">{lead.fullName}</h1>
              <p className="text-muted-foreground">{lead.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[lead.status]
              }`}
            >
              {lead.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <div className="bg-card p-6 rounded-lg border space-y-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-primary hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-primary hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p>{lead.state}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {contactMethod.icon}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Contact Method
                  </p>
                  <p>{contactMethod.label}</p>
                </div>
              </div>
              {lead.preferredContactTime && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Preferred Contact Time
                    </p>
                    <p>{lead.preferredContactTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interest & Source */}
          <div className="bg-card p-6 rounded-lg border space-y-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Interest Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Service Interest</p>
                <p className="font-medium">
                  {interestLabels[lead.interest] || lead.interest}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p>{lead.source}</p>
              </div>
              {lead.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="bg-muted/50 p-3 rounded-md text-sm mt-1">
                    {lead.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="bg-card p-6 rounded-lg border space-y-6">
          <h2 className="font-heading font-semibold text-lg">Manage Lead</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add internal notes about this lead..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              These notes are only visible to staff and admins.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="text-amber-600">You have unsaved changes</span>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateLead.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateLead.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-muted/30 p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(lead.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Updated: {formatDate(lead.updatedAt)}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
