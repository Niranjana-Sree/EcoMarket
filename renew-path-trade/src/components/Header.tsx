import { Button } from "@/components/ui/button";
import { Recycle } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Recycle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">EcoMarket</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/about'}>
            About
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
          <Button variant="hero" size="sm" onClick={() => window.location.href = '/auth'}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;