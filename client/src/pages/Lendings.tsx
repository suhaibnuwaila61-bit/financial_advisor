import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Lendings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "lent",
    personName: "",
    amount: "",
    description: "",
    dueDate: ""
  });

  const { data: lendings = [] } = trpc.lendings.list.useQuery();
  const createLending = trpc.lendings.create.useMutation();
  const updateRepayment = trpc.lendings.updateRepayment.useMutation();
  const deleteLending = trpc.lendings.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName || !form.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createLending.mutateAsync({
        type: form.type as "lent" | "borrowed",
        personName: form.personName,
        amount: form.amount,
        description: form.description || undefined,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined
      });
      toast.success("Lending record created!");
      setForm({ type: "lent", personName: "", amount: "", description: "", dueDate: "" });
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to create lending record");
    }
  };

  const handleRepayment = async (lendingId: number, amount: string) => {
    try {
      await updateRepayment.mutateAsync({
        lendingId,
        amountRepaid: amount
      });
      toast.success("Repayment recorded!");
    } catch (error) {
      toast.error("Failed to record repayment");
    }
  };

  const handleDelete = async (lendingId: number) => {
    if (window.confirm("Are you sure you want to delete this lending record?")) {
      try {
        await deleteLending.mutateAsync({ id: lendingId });
        toast.success("Lending record deleted!");
      } catch (error) {
        toast.error("Failed to delete lending record");
      }
    }
  };

  const totalLent = lendings
    .filter(l => l.type === "lent")
    .reduce((sum, l) => sum + parseFloat(l.amount), 0);

  const totalBorrowed = lendings
    .filter(l => l.type === "borrowed")
    .reduce((sum, l) => sum + parseFloat(l.amount), 0);

  const netLending = totalLent - totalBorrowed;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Lending & Borrowing</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Lent</p>
                <p className="text-2xl font-bold text-green-600">${totalLent.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Borrowed</p>
                <p className="text-2xl font-bold text-red-600">${totalBorrowed.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Position</p>
                <p className={`text-2xl font-bold ${netLending >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netLending.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 opacity-20" />
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Add Lending/Borrowing Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="lent">Money Lent (I gave money)</option>
                    <option value="borrowed">Money Borrowed (I took money)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Person Name *</label>
                  <input
                    type="text"
                    value={form.personName}
                    onChange={(e) => setForm({ ...form, personName: e.target.value })}
                    placeholder="Name of person"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createLending.isPending}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {createLending.isPending ? "Adding..." : "Add Record"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lendings List */}
        <div className="space-y-4">
          {lendings.length === 0 ? (
            <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-12 text-center">
              <p className="text-muted-foreground">No lending or borrowing records yet</p>
            </div>
          ) : (
            lendings.map((lending) => {
              const outstanding = parseFloat(lending.amount) - parseFloat(lending.amountRepaid);
              const isLent = lending.type === "lent";

              return (
                <div key={lending.id} className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{lending.personName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isLent 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {isLent ? 'Lent' : 'Borrowed'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lending.status === 'repaid'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : lending.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {lending.status.charAt(0).toUpperCase() + lending.status.slice(1)}
                        </span>
                      </div>
                      {lending.description && (
                        <p className="text-sm text-muted-foreground mb-2">{lending.description}</p>
                      )}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold">${parseFloat(lending.amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Repaid</p>
                          <p className="font-semibold">${parseFloat(lending.amountRepaid).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Outstanding</p>
                          <p className={`font-semibold ${outstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ${outstanding.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(lending.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {outstanding > 0 && lending.status !== 'repaid' && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Repayment amount"
                        id={`repay-${lending.id}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`repay-${lending.id}`) as HTMLInputElement;
                          if (input.value) {
                            handleRepayment(lending.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all text-sm"
                      >
                        Record Repayment
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
