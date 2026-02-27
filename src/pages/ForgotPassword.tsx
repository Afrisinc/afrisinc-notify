import { Link } from "react-router-dom";
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Reset your password</h2>
      <p className="text-sm text-muted-foreground mb-6">We'll send you a link to reset your password.</p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@company.com"
          />
        </div>
        <button
          type="submit"
          className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Send reset link
        </button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        <Link to="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
