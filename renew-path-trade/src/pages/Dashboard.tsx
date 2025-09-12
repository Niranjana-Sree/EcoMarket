import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Recycle, Package, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Set up real-time subscription for recycler requests
    if (userRole === "recycler") {
      const channel = supabase
        .channel('recycler-requests')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'recycle_requests',
            filter: `recycler_id=eq.${user?.id}`
          }, 
          () => {
            if (user?.id) fetchRecyclerRequests(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole, user?.id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUser(user);
    setUserEmail(user.email || "");
    
    // Get user profile with role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUserRole(profile.role);
      if (profile.role === "recycler") {
        fetchRecyclerRequests(user.id);
      } else {
        setIsLoading(false);
      }
      return;
    }

    // If no profile exists, create one from auth metadata
    const metadata = (user as any).user_metadata || {};
    const inferredRole = metadata.role || "buyer";
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: metadata.name || user.email || "User",
        mobile: metadata.mobile || null,
        address: metadata.address || null,
        role: inferredRole,
      });

    if (insertError) {
      setIsLoading(false);
      return;
    }

    setUserRole(inferredRole);
    if (inferredRole === "recycler") {
      fetchRecyclerRequests(user.id);
    } else {
      setIsLoading(false);
    }
  };

  const fetchRecyclerRequests = async (userId: string) => {
    // Recyclers see only requests addressed to them (pending or in_progress)
    const { data, error } = await supabase
      .from("recycle_requests")
      .select("*")
      .eq("recycler_id", userId)
      .in("status", ["pending", "in_progress"]) 
      .order("created_at", { ascending: false });

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

  const acceptRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("recycle_requests")
      .update({ recycler_id: user.id, status: "in_progress" })
      .eq("id", requestId)
      .eq("status", "pending");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Request accepted" });
      fetchRecyclerRequests(user.id);
    }
  };

  const rejectRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("recycle_requests")
      .update({ recycler_id: user.id, status: "rejected" })
      .eq("id", requestId)
      .eq("status", "pending");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } else {
      toast({ title: "Updated", description: "Request rejected" });
      fetchRecyclerRequests(user.id);
    }
  };

  const completeRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("recycle_requests")
      .update({ status: "completed" })
      .eq("id", requestId)
      .eq("recycler_id", user.id)
      .eq("status", "in_progress");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete request",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Request marked as completed" });
      fetchRecyclerRequests(user.id);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const dashboardCards = [
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "Buy/Sell Materials",
      description: "Browse marketplace or list your materials for sale",
      buttonText: "Visit Marketplace",
      action: () => navigate("/marketplace")
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Recycling Services", 
      description: "Find recyclers and send materials for proper processing",
      buttonText: "Find Recyclers",
      action: () => navigate("/recycling")
    },
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Order Tracking",
      description: "Track your orders and recycling requests",
      buttonText: "View Orders", 
      action: () => navigate("/orders")
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{userRole}</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your waste trading and recycling activities
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{userEmail}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {userRole === "recycler" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recycling Requests</h2>
            {isLoading ? (
              <div className="text-center">Loading requests...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg capitalize">{request.waste_type} Waste</CardTitle>
                        <Badge variant={request.status === "pending" ? "secondary" : request.status === "in_progress" ? "default" : "outline"}>
                          {String(request.status).replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">{request.description}</p>
                        <div className="text-xs text-muted-foreground">Created: {new Date(request.created_at).toLocaleDateString()}</div>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button variant="eco" size="sm" onClick={() => acceptRequest(request.id)}>
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => rejectRequest(request.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                        {request.status === "in_progress" && request.recycler_id && (
                          <div className="flex gap-2">
                            <div className="text-sm text-muted-foreground">In Progress</div>
                            <Button variant="eco" size="sm" onClick={() => completeRequest(request.id)}>
                              Mark Complete
                            </Button>
                          </div>
                        )}
                        {request.status === "completed" && (
                          <div className="text-sm text-green-600 font-medium">Completed</div>
                        )}
                        {request.status === "rejected" && (
                          <div className="text-sm text-red-600 font-medium">Rejected</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {requests.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No recycling requests</h3>
                <p className="text-muted-foreground">No pending or assigned requests at the moment.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {dashboardCards.map((card, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {card.icon}
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                    <Button 
                      variant="eco" 
                      className="w-full"
                      onClick={card.action}
                    >
                      {card.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Active Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1.2 tons</div>
                <div className="text-sm text-muted-foreground">Materials Traded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹45,600</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;