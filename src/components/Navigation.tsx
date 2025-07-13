import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = [
    { name: "Home", href: "/", section: "#home" },
    { name: "About", href: "/", section: "#about" },
    { name: "Properties", href: "/listings", section: "#properties" },
    { name: "Services", href: "/", section: "#services" },
    { name: "Contact", href: "/", section: "#contact" },
  ];

  const handleNavClick = (item: any) => {
    if (item.href === "/" && item.section && isHomePage) {
      // If we're on homepage and clicking a section link, scroll to section
      const element = document.querySelector(item.section);
      element?.scrollIntoView({ behavior: "smooth" });
    } else if (item.href === "/" && item.section) {
      // If we're not on homepage but clicking a section link, navigate to homepage with hash
      window.location.href = `/${item.section}`;
      return;
    }
    // For non-homepage navigation, React Router will handle the routing
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                The Crawford Team
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                item.href === "/listings" ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-foreground hover:text-accent-foreground px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </Link>
                ) : item.href === "/" && item.section && !isHomePage ? (
                  <a
                    key={item.name}
                    href={`/${item.section}`}
                    className="text-foreground hover:text-accent-foreground px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </a>
                ) : item.href === "/" && !isHomePage ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-foreground hover:text-accent-foreground px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item)}
                    className="text-foreground hover:text-accent-foreground px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="tel:727-599-1944" className="flex items-center space-x-1 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                <span>(727) 599-1944</span>
              </a>
              <a href="mailto:hello@yourcrawfordteam.com" className="flex items-center space-x-1 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                <span>hello@yourcrawfordteam.com</span>
              </a>
            </div>
            <Button 
              variant="default"
              className="bg-gradient-gold hover:shadow-button transition-all duration-200"
              asChild={!isHomePage}
            >
              {!isHomePage ? (
                <a href="/#contact">Get Started</a>
              ) : (
                <span onClick={() => handleNavClick({ href: "/", section: "#contact" })}>
                  Get Started
                </span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-6 mt-6">
                  {navItems.map((item) => (
                    item.href === "/listings" ? (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-left py-2 hover:text-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                    ) : item.href === "/" && item.section && !isHomePage ? (
                      <a
                        key={item.name}
                        href={`/${item.section}`}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-left py-2 hover:text-accent transition-colors"
                      >
                        {item.name}
                      </a>
                    ) : item.href === "/" && !isHomePage ? (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-left py-2 hover:text-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <button
                        key={item.name}
                        onClick={() => handleNavClick(item)}
                        className="text-lg font-medium text-left py-2 hover:text-accent transition-colors"
                      >
                        {item.name}
                      </button>
                    )
                  ))}
                  <div className="pt-6 border-t border-border space-y-4">
                    <a href="tel:727-599-1944" className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors">
                      <Phone className="w-5 h-5" />
                      <span>(727) 599-1944</span>
                    </a>
                    <a href="mailto:hello@yourcrawfordteam.com" className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors">
                      <Mail className="w-5 h-5" />
                      <span>hello@yourcrawfordteam.com</span>
                    </a>
                    <Button 
                      className="w-full bg-gradient-gold"
                      asChild={!isHomePage}
                    >
                      {!isHomePage ? (
                        <a href="/#contact">Get Started</a>
                      ) : (
                        <span onClick={() => handleNavClick({ href: "/", section: "#contact" })}>
                          Get Started
                        </span>
                      )}
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;