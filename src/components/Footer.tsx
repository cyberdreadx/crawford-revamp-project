import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-warm-brown text-cream-light py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <img 
                src="/lovable-uploads/4be61148-f344-4248-a724-1f4c0aad30d2.png" 
                alt="The Crawford Team" 
                className="h-16 mb-4 mx-auto md:mx-0"
              />
              <p className="text-cream-light/80 mb-6 max-w-md leading-relaxed">
                Your trusted real estate partners in St. Petersburg, Florida. 
                We bring expertise, dedication, and personalized service to every transaction.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gold-accent" />
                  <a href="tel:727-599-1944" className="text-cream-light/90 hover:text-gold-accent transition-colors">
                    (727) 599-1944
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gold-accent" />
                  <a href="mailto:hello@yourcrawfordteam.com" className="text-cream-light/90 hover:text-gold-accent transition-colors">
                    hello@yourcrawfordteam.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gold-accent" />
                  <span className="text-cream-light/90">St. Petersburg, FL</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-cream-light/80 hover:text-gold-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="/#about" className="text-cream-light/80 hover:text-gold-accent transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <Link to="/listings" className="text-cream-light/80 hover:text-gold-accent transition-colors">
                    Properties
                  </Link>
                </li>
                <li>
                  <a href="/#services" className="text-cream-light/80 hover:text-gold-accent transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/#contact" className="text-cream-light/80 hover:text-gold-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-cream-light/80">Home Buying</span>
                </li>
                <li>
                  <span className="text-cream-light/80">Home Selling</span>
                </li>
                <li>
                  <span className="text-cream-light/80">Investment Properties</span>
                </li>
                <li>
                  <span className="text-cream-light/80">Market Analysis</span>
                </li>
                <li>
                  <span className="text-cream-light/80">Property Management</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media & Bottom */}
          <div className="pt-8 border-t border-cream-light/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <a 
                  href="https://www.facebook.com/yourcrawfordteam" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-light/60 hover:text-gold-accent transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a 
                  href="https://www.instagram.com/yourcrawfordteam/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-light/60 hover:text-gold-accent transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a 
                  href="https://www.youtube.com/channel/UCEqjELvyG0pTBTqyJAANrGQ" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream-light/60 hover:text-gold-accent transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-cream-light/60 text-sm mb-1">
                  © {currentYear} The Crawford Team. All rights reserved.
                </p>
                <p className="text-cream-light/40 text-xs">
                  Licensed Real Estate Professionals | Keller Williams St Pete Realty
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;