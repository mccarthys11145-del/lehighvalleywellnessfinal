import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Download, 
  Phone, 
  Mail, 
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type SortBy = "createdAt" | "updatedAt" | "fullName" | "email";
type SortOrder = "asc" | "desc";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  CONTACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  SCHEDULED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const interestLabels: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss",
  MENOPAUSE_HRT: "Menopause/HRT",
  GENERAL: "General",
  OTHER: "Other",
};

const contactMethodIcons: Record<string, React.ReactNode> = {
  PHONE: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  TEXT: <MessageSquare className="h-4 w-4" />,
};

export default function LeadsList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [interestFilter, setInterestFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const queryParams = useMemo(() => ({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    interest: interestFilter !== "all" ? interestFilter as any : undefined,
    sortBy,
    sortOrder,
  }), [search, statusFilter, interestFilter, sortBy, sortOrder]);

  const { data: leads, isLoading, refetch } = trpc.admin.listLeads.useQuery(queryParams);
  
  const markAsContacted = trpc.admin.markAsContacted.useMutation({
    onSuccess: () => {
      toast.success("Lead marked as contacted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update lead");
    },
  });

  const exportQuery = trpc.admin.exportLeads.useQuery(queryParams, {
    enabled: false, // Only fetch when triggered
  });

  const handleExport = async () => {
    try {
      const result = await exportQuery.refetch();
      if (result.data) {
        const blob = new Blob([result.data.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${result.data.count} leads`);
      }
    } catch (error) {
      toast.error("Failed to export leads");
    }
  };

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortBy }) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Leads</h1>
            <p className="text-muted-foreground">
              Manage contact form submissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {isAdmin && (
              <Button size="sm" onClick={handleExport} disabled={exportQuery.isFetching}>
                <Download className="h-4 w-4 mr-2" />
                {exportQuery.isFetching ? "Exporting..." : "Export CSV"}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-lg border space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={interestFilter} onValueChange={setInterestFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interests</SelectItem>
                  <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                  <SelectItem value="MENOPAUSE_HRT">Menopause/HRT</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleSort("fullName")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <SortIcon column="fullName" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleSort("email")}
                    >
                      <div className="flex items-center gap-1">
                        Contact
                        <SortIcon column="email" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Interest
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/80"
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        <SortIcon column="createdAt" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{lead.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.state}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm">{lead.email}</p>
                          {lead.phone && (
                            <p className="text-sm text-muted-foreground">
                              {lead.phone}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {contactMethodIcons[lead.preferredContactMethod]}
                            <span className="capitalize">
                              {lead.preferredContactMethod.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {interestLabels[lead.interest] || lead.interest}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[lead.status]
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status === "NEW" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsContacted.mutate({ id: lead.id })}
                              disabled={markAsContacted.isPending}
                              title="Mark as Contacted"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/admin/leads/${lead.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {leads && leads.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
