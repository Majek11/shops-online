import { useState, useEffect } from "react";
import { Loader2, Filter, Download, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isAuthenticated } from "@/lib/billstackApi";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: "success" | "failed" | "pending";
  date: string;
  reference: string;
  description: string;
}

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock transaction data - would be replaced with real API call
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "Airtime",
      amount: "1000",
      status: "success",
      date: "2026-02-23T10:30:00Z",
      reference: "TXN123456789",
      description: "MTN Airtime Purchase - 08012345678"
    },
    {
      id: "2",
      type: "Data",
      amount: "5000",
      status: "success",
      date: "2026-02-22T15:45:00Z",
      reference: "TXN123456788",
      description: "MTN 20GB Monthly Data - 08012345678"
    },
    {
      id: "3",
      type: "Electricity",
      amount: "15000",
      status: "pending",
      date: "2026-02-22T09:15:00Z",
      reference: "TXN123456787",
      description: "Ikeja Electric - Meter: 43901725754"
    },
    {
      id: "4",
      type: "Cable TV",
      amount: "10500",
      status: "failed",
      date: "2026-02-21T18:20:00Z",
      reference: "TXN123456786",
      description: "DSTV Compact Subscription - 43901725754"
    }
  ];

  useEffect(() => {
    const loadTransactions = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTransactions(mockTransactions);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === "all" || transaction.status === filter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated()) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your transactions</p>
        <Button onClick={() => window.location.href = '/login'}>
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions History</h1>
        <p className="text-sm text-muted-foreground">View all your past transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="success">Successful</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            {searchTerm || filter !== "all" ? "No transactions match your filters" : "No Transactions Yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <span className="font-medium text-foreground">{transaction.type}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{transaction.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">₦{transaction.amount}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-muted-foreground">{transaction.reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsHistory;
