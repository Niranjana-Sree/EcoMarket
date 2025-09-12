import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recycle, Users, Leaf, TrendingUp, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Waste Trading",
      description: "Buy and sell waste materials in a transparent marketplace with fair pricing and quality assurance."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community Driven",
      description: "Connect with local recyclers, buyers, and sellers to build a sustainable waste management ecosystem."
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Environmental Impact",
      description: "Reduce waste in landfills and promote circular economy principles for a greener future."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Economic Benefits",
      description: "Turn waste into wealth by monetizing recyclable materials and creating new revenue streams."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Verified Users",
      description: "All users are verified with proper documentation ensuring trust and security in transactions."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Local Focus",
      description: "Connect with nearby recyclers and buyers to minimize transportation costs and carbon footprint."
    }
  ];

  const stats = [
    { number: "1000+", label: "Active Users" },
    { number: "500+", label: "Tons Recycled" },
    { number: "₹2M+", label: "Value Traded" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About EcoMarket</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforming waste into wealth through a sustainable marketplace that connects buyers, 
            sellers, and recyclers in the circular economy.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/10 border-none">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-center text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                EcoMarket is dedicated to revolutionizing waste management by creating a digital platform 
                that makes recycling profitable and accessible. We believe that every piece of waste has 
                value, and by connecting the right people, we can build a sustainable future where 
                environmental responsibility meets economic opportunity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EcoMarket?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="text-primary-foreground/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <CardTitle>Sign Up & Choose Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Register as a buyer, seller, or recycler based on your needs and expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <CardTitle>List or Browse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sellers list their waste materials, buyers browse and purchase, recyclers accept requests.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <CardTitle>Connect & Transact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete transactions securely with integrated payment systems and track your orders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-none">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start your journey towards sustainable waste management and be part of the circular economy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="eco" 
                  size="lg"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/marketplace")}
                >
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
