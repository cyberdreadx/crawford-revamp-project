import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Phone, Mail, User, ChevronDown, Facebook, Instagram, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const {
    user
  } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide nav after scrolling past 100px to avoid flickering at top
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide nav
          setIsVisible(false);
        } else {
          // Scrolling up - show nav
          setIsVisible(true);
        }
      } else {
        // Always show nav when near top
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const navItems = [{
    name: "About",
    href: "/",
    section: "#about"
  }, {
    name: "Properties",
    href: null,
    section: null,
    isDropdown: true
  }, {
    name: "Resources",
    href: null,
    section: null,
    isDropdown: true,
    isResources: true
  }, {
    name: "Services",
    href: "/",
    section: "#services"
  }, {
    name: "Contact",
    href: "/",
    section: "#contact"
  }];
  const handleNavClick = (item: any) => {
    if (item.href === "/" && item.section && isHomePage) {
      // If we're on homepage and clicking a section link, scroll to section
      const element = document.querySelector(item.section);
      element?.scrollIntoView({
        behavior: "smooth"
      });
    } else if (item.href === "/" && item.section) {
      // If we're not on homepage but clicking a section link, navigate to homepage with hash
      window.location.href = `/${item.section}`;
      return;
    }
    // For non-homepage navigation, React Router will handle the routing
    setIsOpen(false);
  };
  return <>
      
      <nav className={`fixed top-0 w-full bg-background/10 backdrop-blur-md border-b border-white/10 z-50 transition-transform duration-300 ease-in-out shadow-lg ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex-shrink-0 -ml-2">
            <Link to="/" className="block">
              <img src="/lovable-uploads/cc4cbfba-4aae-4fc4-8318-208b94a333eb.png" alt="The Crawford Team" className="h-20 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map(item => item.isDropdown ? <div key={item.name} className="relative group">
                  <button className="text-foreground hover:text-teal-600 px-4 py-2 text-sm font-medium transition-all duration-200 relative flex items-center group">
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                    <div className="py-2">
                      {item.isResources ? <>
                          <Link to="/luxury" className="block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md mx-2">
                            Luxury Portfolio
                          </Link>
                          <Link to="/blog" className="block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md mx-2">
                            Blog
                          </Link>
                        </> : <>
                          <Link to="/listings" className="block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md mx-2">Featured Listings</Link>
                          <Link to="/mls-search" className="block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md mx-2">
                            Search All Listings
                          </Link>
                        </>}
                    </div>
                  </div>
                </div> : item.href === "/" && item.section && !isHomePage ? <a key={item.name} href={`/${item.section}`} className="text-foreground hover:text-teal-600 px-4 py-2 text-sm font-medium transition-all duration-200 relative group">
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </a> : item.href === "/" && !isHomePage ? <Link key={item.name} to={item.href} className="text-foreground hover:text-teal-600 px-4 py-2 text-sm font-medium transition-all duration-200 relative group">
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </Link> : <button key={item.name} onClick={() => handleNavClick(item)} className="text-foreground hover:text-teal-600 px-4 py-2 text-sm font-medium transition-all duration-200 relative group">
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </button>)}
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <a href="https://www.facebook.com/yourcrawfordteam" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-accent hover:bg-accent/10 transition-all duration-200 group">
                <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </a>
              <a href="https://www.instagram.com/yourcrawfordteam" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-accent hover:bg-accent/10 transition-all duration-200 group">
                <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </a>
              <a href="https://www.youtube.com/channel/UCEqjELvyG0pTBTqyJAANrGQ" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-accent hover:bg-accent/10 transition-all duration-200 group">
                <Youtube className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </a>
            </div>
            
            {user ? <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
                <Link to="/member-portal">
                  <User className="w-4 h-4 mr-2" />
                  Portal
                </Link>
              </Button> : <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild={!isHomePage} className="bg-gradient-teal hover:shadow-button transition-all duration-200 text-teal-700">
                  {!isHomePage ? <a href="/#contact">Get Started</a> : <span onClick={() => handleNavClick({
                  href: "/",
                  section: "#contact"
                })}>
                      Get Started
                    </span>}
                </Button>
              </div>}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            {user && <Button variant="ghost" size="sm" asChild>
                <Link to="/member-portal">
                  <User className="w-4 h-4" />
                </Link>
              </Button>}
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
                    <img src="/lovable-uploads/cc4cbfba-4aae-4fc4-8318-208b94a333eb.png" alt="The Crawford Team" className="h-12 w-auto object-contain" />
                  </div>

                  {/* Navigation */}
                  <nav className="flex flex-col space-y-1 py-4 flex-1">
                    {navItems.map(item => item.isDropdown ? <div key={item.name} className="space-y-1">
                          <div className="flex items-center py-3 px-3 text-base font-medium text-foreground">
                            {item.name}
                          </div>
                          <div className="pl-4 space-y-1">
                            {item.isResources ? <>
                                <Link to="/luxury" onClick={() => setIsOpen(false)} className="flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                                  Luxury Portfolio
                                </Link>
                                <Link to="/blog" onClick={() => setIsOpen(false)} className="flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                                  Blog
                                </Link>
                              </> : <>
                                <Link to="/listings" onClick={() => setIsOpen(false)} className="flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                                  Our Listings
                                </Link>
                                <Link to="/mls-search" onClick={() => setIsOpen(false)} className="flex items-center py-2 px-3 text-sm font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                                  Search All Listings
                                </Link>
                              </>}
                          </div>
                        </div> : item.href === "/" && item.section && !isHomePage ? <a key={item.name} href={`/${item.section}`} onClick={() => setIsOpen(false)} className="flex items-center py-3 px-3 text-base font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                          {item.name}
                        </a> : item.href === "/" && !isHomePage ? <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)} className="flex items-center py-3 px-3 text-base font-medium rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                          {item.name}
                        </Link> : <button key={item.name} onClick={() => handleNavClick(item)} className="flex items-center py-3 px-3 text-base font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                          {item.name}
                        </button>)}
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
                      {user ? <Button className="w-full" variant="outline" asChild>
                          <Link to="/member-portal" onClick={() => setIsOpen(false)}>
                            <User className="w-4 h-4 mr-2" />
                            Member Portal
                          </Link>
                        </Button> : <>
                          <Button className="w-full" variant="outline" asChild>
                            <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
                          </Button>
                          <Button className="w-full bg-gradient-teal" asChild={!isHomePage}>
                            {!isHomePage ? <a href="/#contact" onClick={() => setIsOpen(false)}>Get Started</a> : <span onClick={() => {
                            handleNavClick({
                              href: "/",
                              section: "#contact"
                            });
                            setIsOpen(false);
                          }}>
                                Get Started
                              </span>}
                          </Button>
                        </>}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      </nav>
    </>;
};
export default Navigation;