import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recycle, Send, Leaf, Phone, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface RecycleRequest {
  id: string;
  waste_type: string;
  description: string;
  status: string;
  created_at: string;
  requester_id: string;
  recycler_id: string | null;
}

interface Profile {
  id: string;
  name: string;
  role: string;
  mobile?: string | null;
  address?: string | null;
  avatar_url?: string | null;
}

const RecyclingServices = () => {
  const [requests, setRequests] = useState<RecycleRequest[]>([]);
  const [recyclers, setRecyclers] = useState<Profile[]>([]);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>("");
  const [selectedRecycler, setSelectedRecycler] = useState<Profile | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // New request form
  const [newRequest, setNewRequest] = useState({
    waste_type: "",
    description: "",
  });

  useEffect(() => {
    checkUserRole();
    fetchRecyclers();
    fetchRequests();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "");
    }
  };

  const fetchRecyclers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, mobile, address, avatar_url")
      .eq("role", "recycler");

    if (!error) {
      setRecyclers(data || []);
    }
  };

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase.from("recycle_requests").select("*");

    if (userRole === "recycler") {
      // Recyclers see all requests addressed to them (pending, in_progress, and completed)
      query = query.eq("recycler_id", user.id).in("status", ["pending", "in_progress", "completed"]);
    } else {
      // Users see only their own requests
      query = query.eq("requester_id", user.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  const createRequest = async () => {
    if (!newRequest.waste_type || !newRequest.description || !selectedRecyclerId) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a recycler",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("recycle_requests").insert({
      waste_type: newRequest.waste_type,
      description: newRequest.description,
      requester_id: user.id,
      recycler_id: selectedRecyclerId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Recycling request created successfully",
      });
      setNewRequest({ waste_type: "", description: "" });
      setSelectedRecyclerId("");
      fetchRequests();
    }
  };

  const createSampleRequests = async () => {
    if (!selectedRecyclerId) {
      toast({
        title: "Error",
        description: "Please select a recycler first",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const samplePayloads = [
      { waste_type: "plastic", description: "50kg mixed plastic bottles" },
      { waste_type: "paper", description: "75kg office paper and cartons" },
      { waste_type: "metal", description: "25kg aluminum cans" },
    ];

    const { error } = await supabase.from("recycle_requests").insert(
      samplePayloads.map((p) => ({
        waste_type: p.waste_type,
        description: p.description,
        requester_id: user.id,
        recycler_id: selectedRecyclerId,
      }))
    );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create sample requests",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Sample requests created" });
      fetchRequests();
    }
  };

  const acceptRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("recycle_requests")
      .update({ 
        recycler_id: user.id, 
        status: "in_progress" 
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Request accepted successfully",
      });
      fetchRequests();
    }
  };

  const completeRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("recycle_requests")
      .update({ status: "completed" })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Request marked as completed",
      });
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "in_progress": return "default";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading recycling services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recycling Services</h1>
            <p className="text-muted-foreground">
              {userRole === "recycler" 
                ? "Accept and manage recycling requests from users"
                : "Find recyclers for your waste materials"
              }
            </p>
          </div>
          
          {/* Non-recyclers will initiate requests via recycler cards below */}
        </div>

        {userRole !== "recycler" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Recyclers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recyclers.map((r) => (
                <Card key={r.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedRecycler(r); setSelectedRecyclerId(r.id); setIsRequestDialogOpen(true); }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {r.avatar_url ? (
                          <img 
                            src={r.avatar_url} 
                            alt={`${r.name} avatar`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{r.name}</CardTitle>
                        <p className="text-sm text-primary font-medium">Professional Recycler</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {r.mobile && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {r.mobile}
                        </div>
                      )}
                      {r.address && (
                        <div className="flex items-start text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{r.address}</span>
                        </div>
                      )}
                      {!r.mobile && !r.address && (
                        <p className="text-sm text-muted-foreground">Contact details not available</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRecycler ? `Send Request to ${selectedRecycler.name}` : "Create Recycling Request"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRecycler && (
                <div className="rounded-md border p-3 text-sm">
                  <div><span className="font-medium">Contact:</span> {selectedRecycler.mobile || "N/A"}</div>
                  <div><span className="font-medium">Address:</span> {selectedRecycler.address || "N/A"}</div>
                </div>
              )}
              {!selectedRecycler && (
                <div>
                  <Label htmlFor="recycler">Select Recycler</Label>
                  <Select 
                    value={selectedRecyclerId} 
                    onValueChange={(value) => {
                      setSelectedRecyclerId(value);
                      const found = recyclers.find((x) => x.id === value) || null;
                      setSelectedRecycler(found);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recycler" />
                    </SelectTrigger>
                    <SelectContent>
                      {recyclers.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="waste_type">Waste Type</Label>
                <Select 
                  value={newRequest.waste_type} 
                  onValueChange={(value) => setNewRequest({ ...newRequest, waste_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select waste type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plastic">Plastic</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="paper">Paper</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe the waste materials, quantity, location, etc."
                />
              </div>
              <Button onClick={async () => { await createRequest(); setIsRequestDialogOpen(false); }} className="w-full" variant="eco">
                Send Request
              </Button>
              <Button onClick={createSampleRequests} className="w-full" variant="outline">
                Create 3 Sample Requests
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg capitalize">{request.waste_type} Waste</CardTitle>
                  <Badge variant={getStatusColor(request.status)}>
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {request.description}
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  Created: {new Date(request.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  {userRole === "recycler" && request.status === "pending" && (
                    <Button 
                      onClick={() => acceptRequest(request.id)} 
                      variant="eco" 
                      size="sm"
                    >
                      <Recycle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  )}
                  
                  {userRole === "recycler" && request.status === "in_progress" && request.recycler_id && (
                    <Button 
                      onClick={() => completeRequest(request.id)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Leaf className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recycling requests</h3>
            <p className="text-muted-foreground">
              {userRole === "recycler" 
                ? "No pending requests at the moment. Check back later."
                : "You haven't created any recycling requests yet."
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecyclingServices;