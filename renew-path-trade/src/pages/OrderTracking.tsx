import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Recycle, Clock, CheckCircle, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface Order {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  products: {
    name: string;
    category: string;
  };
}

interface RecycleRequest {
  id: string;
  waste_type: string;
  description: string;
  status: string;
  created_at: string;
  recycler_id: string | null;
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [recycleRequests, setRecycleRequests] = useState<RecycleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchOrders();
    fetchSellerOrders();
    fetchRecycleRequests();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "buyer");
    }
  };

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        quantity,
        total_amount,
        status,
        created_at,
        buyer_id,
        products (
          name,
          category
        )
      `)
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const fetchSellerOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        quantity,
        total_amount,
        status,
        created_at,
        buyer_id,
        products!inner (
          name,
          category,
          seller_id
        )
      `)
      .eq("products.seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch seller orders",
        variant: "destructive",
      });
    } else {
      setSellerOrders(data || []);
    }
  };

  const fetchRecycleRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("recycle_requests")
      .select("*")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recycle requests",
        variant: "destructive",
      });
    } else {
      setRecycleRequests(data || []);
    }
    setIsLoading(false);
  };

  const completeOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to complete order",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
      fetchSellerOrders();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "in_progress":
        return <Truck className="w-5 h-5" />;
      case "delivered":
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "delivered":
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "placed":
      case "pending":
        return 33;
      case "in_progress":
        return 66;
      case "delivered":
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-muted-foreground">Track your orders and recycling requests in real-time</p>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className={`grid w-full ${userRole === "seller" ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            {userRole === "seller" && (
              <TabsTrigger value="sales">Sales Orders</TabsTrigger>
            )}
            <TabsTrigger value="recycle">Recycling Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Your purchase orders will appear here once you start buying.</p>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.products.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.products.category} • Qty: {order.quantity}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="font-semibold">₹{order.total_amount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Order Date</span>
                        <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgressPercentage(order.status)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${getProgressPercentage(order.status)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Placed</span>
                          <span>In Progress</span>
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {userRole === "seller" && (
            <TabsContent value="sales" className="space-y-6">
              {sellerOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No sales orders yet</h3>
                  <p className="text-muted-foreground">Orders for your products will appear here once customers start buying.</p>
                </div>
              ) : (
                sellerOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.products.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {order.products.category} • Qty: {order.quantity}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Amount</span>
                          <span className="font-semibold">₹{order.total_amount}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Order Date</span>
                          <span className="text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{getProgressPercentage(order.status)}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${getProgressPercentage(order.status)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Placed</span>
                            <span>In Progress</span>
                            <span>Delivered</span>
                          </div>
                        </div>

                        {/* Order completion button for sellers */}
                        {order.status === "placed" && (
                          <Button 
                            onClick={() => completeOrder(order.id)} 
                            variant="eco" 
                            size="sm"
                            className="w-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}

          <TabsContent value="recycle" className="space-y-6">
            {recycleRequests.length === 0 ? (
              <div className="text-center py-12">
                <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No recycling requests</h3>
                <p className="text-muted-foreground">Your recycling requests will appear here once you create them.</p>
              </div>
            ) : (
              recycleRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg capitalize">{request.waste_type} Recycling</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {request.description.substring(0, 100)}...
                        </p>
                      </div>
                      <Badge variant={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-2 capitalize">{request.status.replace("_", " ")}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Request Date</span>
                        <span className="text-sm">{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Recycler Assigned</span>
                        <span className="text-sm">{request.recycler_id ? "Yes" : "Pending"}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{getProgressPercentage(request.status)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${getProgressPercentage(request.status)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Pending</span>
                          <span>In Progress</span>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OrderTracking;