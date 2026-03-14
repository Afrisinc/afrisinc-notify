import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50">
    <div className="container py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 heading-label">
            <img src="/notify-logo.svg" alt="Notify Logo" className="h-7 w-7 rounded-lg bg-card p-0.5" />
            Notify
          </Link>
          <p className="heading-description leading-relaxed">
            Notification infrastructure for modern teams. Email, SMS, and Push — one API.
          </p>
        </div>
        <div>
          <h4 className="heading-label">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/templates" className="heading-description hover:text-foreground">Templates</Link></li>
            <li><Link to="/pricing" className="heading-description hover:text-foreground">Pricing</Link></li>
            <li><Link to="/docs" className="heading-description hover:text-foreground">Documentation</Link></li>
            <li><Link to="/signup" className="heading-description hover:text-foreground">Get Started</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="heading-label">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#" className="heading-description hover:text-foreground">Blog</a></li>
            <li><a href="#" className="heading-description hover:text-foreground">Changelog</a></li>
            <li><a href="#" className="heading-description hover:text-foreground">Status</a></li>
          </ul>
        </div>
        <div>
          <h4 className="heading-label">Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className="heading-description hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="heading-description hover:text-foreground">Terms of Service</a></li>
            <li><a href="#" className="heading-description hover:text-foreground">DPA</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 mt-10 pt-6 text-center text-sm text-muted-foreground">
        © 2026 Notifyr. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
