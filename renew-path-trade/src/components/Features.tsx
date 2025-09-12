import { Card, CardContent } from "@/components/ui/card";
import { Recycle, ShoppingCart, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Smart Recycling",
      description: "Advanced AI-powered waste sorting and recycling recommendations"
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "Marketplace",
      description: "Buy and sell recyclable materials in our secure marketplace"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community",
      description: "Connect with recyclers, buyers, and sellers in your area"
    }
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Sustainable Solutions for Everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform connects waste generators with recyclers and creates value 
            from materials that would otherwise end up in landfills.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;