import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DevSeed = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const seedProducts = async () => {
    setIsSeeding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Auth required", description: "Please sign in first", variant: "destructive" });
      setIsSeeding(false);
      return;
    }

    const samples = [
      { name: "Plastic Bottles", category: "plastic", price: 120, description: "Clean PET bottles" },
      { name: "Aluminum Cans", category: "metal", price: 150, description: "Crushed cans" },
      { name: "Office Paper", category: "paper", price: 80, description: "Sorted white paper" },
    ];

    const { error } = await supabase.from("products").insert(
      samples.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        seller_id: user.id,
      }))
    );

    if (error) {
      toast({ title: "Error", description: "Failed to seed products", variant: "destructive" });
    } else {
      toast({ title: "Seeded", description: "Added 3 products" });
    }
    setIsSeeding(false);
  };

  const seedRecycleRequests = async () => {
    setIsSeeding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Auth required", description: "Please sign in first", variant: "destructive" });
      setIsSeeding(false);
      return;
    }

    // Find a recycler to address requests to
    const { data: recyclers, error: rErr } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "recycler")
      .limit(1);

    if (rErr || !recyclers || recyclers.length === 0) {
      toast({ title: "No recycler", description: "Create a recycler account first", variant: "destructive" });
      setIsSeeding(false);
      return;
    }

    const recycler = recyclers[0];

    const samples = [
      { waste_type: "plastic", description: "50kg mixed plastic" },
      { waste_type: "paper", description: "75kg sorted paper" },
      { waste_type: "metal", description: "25kg aluminum" },
    ];

    const { error } = await supabase.from("recycle_requests").insert(
      samples.map((s) => ({
        waste_type: s.waste_type,
        description: s.description,
        requester_id: user.id,
        recycler_id: recycler.id,
      }))
    );

    if (error) {
      toast({ title: "Error", description: "Failed to seed requests", variant: "destructive" });
    } else {
      toast({ title: "Seeded", description: `Created 3 requests to ${recycler.name}` });
    }
    setIsSeeding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dev Seeding</h1>
          <p className="text-muted-foreground">Quickly add demo data to Supabase</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Seed Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Adds 3 sample products for the current user.</p>
              <Button onClick={seedProducts} disabled={isSeeding} variant="eco">Seed Products</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seed Recycling Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Creates 3 requests addressed to the first recycler found.</p>
              <Button onClick={seedRecycleRequests} disabled={isSeeding} variant="eco">Seed Requests</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DevSeed;


