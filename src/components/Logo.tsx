import { Link } from "react-router-dom";

const Logo = () => {
  return (
      <>
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-lg mb-8 text-foreground">
          <img src="/notify-logo.png" alt="Notify Logo" className="h-8 w-8 rounded-lg" />
          <span>Notify</span>
        </Link>
      </>
  );
};

export default Logo;
