import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Loader2, Eye, EyeOff, Save, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PinUser {
  id: string;
  name: string;
  pin: string;
  is_admin: boolean;
  brand_id: string | null;
  last_login_at: string | null;
}

interface Brand {
  id: string;
  name: string;
}

const AdminPinManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<PinUser[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [editingPins, setEditingPins] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // New user form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [newUserBrandId, setNewUserBrandId] = useState<string>("none");
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, brandsRes] = await Promise.all([
        supabase.from('login_pins').select('*').order('name'),
        supabase.from('brands').select('id, name').order('name')
      ]);

      if (usersRes.error) throw usersRes.error;
      if (brandsRes.error) throw brandsRes.error;

      setUsers(usersRes.data || []);
      setBrands(brandsRes.data || []);
      
      // Initialize editing pins with current values
      const pinsMap: Record<string, string> = {};
      usersRes.data?.forEach(user => {
        pinsMap[user.id] = user.pin;
      });
      setEditingPins(pinsMap);
    } catch (err: any) {
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPin = (userId: string) => {
    setShowPins(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handlePinChange = (userId: string, newPin: string) => {
    // Only allow numeric input, max 6 digits
    if (/^\d{0,6}$/.test(newPin)) {
      setEditingPins(prev => ({ ...prev, [userId]: newPin }));
    }
  };

  const handleSavePin = async (userId: string) => {
    const newPin = editingPins[userId];
    
    if (!newPin || newPin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate PINs
    const isDuplicate = users.some(u => u.id !== userId && u.pin === newPin);
    if (isDuplicate) {
      toast({
        title: "Duplicate PIN",
        description: "This PIN is already in use by another user.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(userId);
    try {
      const { error } = await supabase.functions.invoke('manage-pins', {
        body: { action: 'update', userId, newPin }
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, pin: newPin } : u
      ));

      toast({
        title: "PIN updated",
        description: "The PIN has been changed successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error updating PIN",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the user.",
        variant: "destructive",
      });
      return;
    }

    if (!newUserPin || newUserPin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate PINs
    const isDuplicate = users.some(u => u.pin === newUserPin);
    if (isDuplicate) {
      toast({
        title: "Duplicate PIN",
        description: "This PIN is already in use.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-pins', {
        body: { 
          action: 'create', 
          name: newUserName.trim(),
          pin: newUserPin,
          brandId: newUserBrandId === "none" ? null : newUserBrandId,
          isAdmin: newUserIsAdmin
        }
      });

      if (error) throw error;

      toast({
        title: "User created",
        description: `${newUserName} has been added with PIN ${newUserPin}.`,
      });

      // Reset form and close dialog
      setNewUserName("");
      setNewUserPin("");
      setNewUserBrandId("none");
      setNewUserIsAdmin(false);
      setIsAddDialogOpen(false);
      
      // Refresh data
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error creating user",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeletingId(userId);
    try {
      const { error } = await supabase.functions.invoke('manage-pins', {
        body: { action: 'delete', userId }
      });

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "User deleted",
        description: `${userName} has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Error deleting user",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getBrandName = (brandId: string | null) => {
    if (!brandId) return "Admin / All Gyms";
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || "Unknown";
  };

  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#b48f8f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/biopage')}
              className="bg-white/80 hover:bg-white shadow-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#737373]">PIN Management</h1>
              <p className="text-sm text-[#737373]/70">View and manage user PINs</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#b48f8f] hover:bg-[#a07e7e] text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new PIN login for a user or gym.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Smith or Gym Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4-6 digits)</Label>
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g., 1234"
                    value={newUserPin}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) {
                        setNewUserPin(e.target.value);
                      }
                    }}
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym">Associated Gym</Label>
                  <Select value={newUserBrandId} onValueChange={setNewUserBrandId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gym" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Admin)</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={newUserIsAdmin}
                    onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isAdmin" className="text-sm font-normal">
                    Grant admin access (can manage all gyms)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="bg-[#b48f8f] hover:bg-[#a07e7e]"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#b48f8f]/10 to-transparent">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#b48f8f]" />
              <span className="font-semibold text-[#737373]">All Users ({users.length})</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map(user => (
              <div key={user.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#737373] truncate">{user.name}</span>
                      {user.is_admin && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#b48f8f]/20 text-[#b48f8f] rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#737373]/60 truncate">
                      {getBrandName(user.brand_id)}
                    </p>
                    <p className="text-xs text-[#737373]/40 mt-1">
                      Last login: {formatLastLogin(user.last_login_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type={showPins[user.id] ? "text" : "password"}
                        value={editingPins[user.id] || ""}
                        onChange={(e) => handlePinChange(user.id, e.target.value)}
                        className="w-24 pr-8 text-center font-mono"
                        inputMode="numeric"
                        maxLength={6}
                      />
                      <button
                        onClick={() => toggleShowPin(user.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPins[user.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSavePin(user.id)}
                      disabled={savingId === user.id || editingPins[user.id] === user.pin}
                      className="bg-[#b48f8f] hover:bg-[#a07e7e] disabled:opacity-50"
                    >
                      {savingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {user.name}'s PIN access. They will no longer be able to log in.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-[#737373]/60 space-y-1">
          <p>PINs must be 4-6 digits and unique per user.</p>
          <p>Changes take effect immediately after saving.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPinManagement;