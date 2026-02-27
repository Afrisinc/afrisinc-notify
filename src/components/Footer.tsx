import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50">
    <div className="container py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-semibold mb-3">
            <img src="/notify-logo.svg" alt="Notify Logo" className="h-7 w-7 rounded-lg bg-white p-0.5" />
            Notify
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Notification infrastructure for modern teams. Email, SMS, and Push — one API.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
            <li><Link to="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">DPA</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 mt-10 pt-6 text-center text-xs text-muted-foreground">
        © 2026 Notifyr. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
