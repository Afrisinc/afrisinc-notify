import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const Logo = () => {
  return (
      <>
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-lg mb-8 text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Notifyr</span>
        </Link>
      </>
  );
};

export default Logo;
