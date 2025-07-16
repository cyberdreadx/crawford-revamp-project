import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Mail, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user } = useAuth();

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
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-teal bg-clip-text text-transparent">
                The Crawford Team
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-6 flex items-baseline space-x-6">
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

          {/* Contact Info & CTA - Simplified */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <a href="tel:727-599-1944" className="flex items-center space-x-1 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                <span className="hidden xl:inline">(727) 599-1944</span>
              </a>
              <a href="mailto:hello@yourcrawfordteam.com" className="flex items-center space-x-1 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                <span className="hidden xl:inline">hello@yourcrawfordteam.com</span>
              </a>
            </div>
            
            {user ? (
              <Button 
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                asChild
              >
                <Link to="/member-portal">
                  <User className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Portal</span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-teal hover:shadow-button transition-all duration-200"
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
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <Button 
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/member-portal">
                  <User className="w-4 h-4" />
                </Link>
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="py-4 border-b border-border">
                    <h2 className="text-lg font-semibold bg-gradient-teal bg-clip-text text-transparent">
                      The Crawford Team
                    </h2>
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-col space-y-1 py-4 flex-1">
                    {navItems.map((item) => (
                      item.href === "/listings" ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center py-3 px-3 text-base font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          {item.name}
                        </Link>
                      ) : item.href === "/" && item.section && !isHomePage ? (
                        <a
                          key={item.name}
                          href={`/${item.section}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center py-3 px-3 text-base font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          {item.name}
                        </a>
                      ) : item.href === "/" && !isHomePage ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center py-3 px-3 text-base font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={() => handleNavClick(item)}
                          className="flex items-center py-3 px-3 text-base font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          {item.name}
                        </button>
                      )
                    ))}
                  </nav>

                  {/* Footer */}
                  <div className="border-t border-border pt-4 space-y-4">
                    <div className="space-y-3">
                      <a href="tel:727-599-1944" className="flex items-center space-x-3 text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-accent/10">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">(727) 599-1944</span>
                      </a>
                      <a href="mailto:hello@yourcrawfordteam.com" className="flex items-center space-x-3 text-muted-foreground hover:text-accent transition-colors p-2 rounded-lg hover:bg-accent/10">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">hello@yourcrawfordteam.com</span>
                      </a>
                    </div>
                    
                    <div className="space-y-2">
                      {user ? (
                        <Button 
                          className="w-full"
                          variant="outline"
                          asChild
                        >
                          <Link to="/member-portal" onClick={() => setIsOpen(false)}>
                            <User className="w-4 h-4 mr-2" />
                            Member Portal
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button 
                            className="w-full"
                            variant="outline"
                            asChild
                          >
                            <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                          </Button>
                          <Button 
                            className="w-full bg-gradient-teal"
                            asChild={!isHomePage}
                          >
                            {!isHomePage ? (
                              <a href="/#contact" onClick={() => setIsOpen(false)}>Get Started</a>
                            ) : (
                              <span onClick={() => {
                                handleNavClick({ href: "/", section: "#contact" });
                                setIsOpen(false);
                              }}>
                                Get Started
                              </span>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;