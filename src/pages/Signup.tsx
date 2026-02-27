import { Link } from "react-router-dom";
import { useState } from "react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Create your account</h2>
      <p className="text-sm text-muted-foreground mb-6">Start sending notifications in minutes.</p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1.5">Company / Project name</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Acme Inc."
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full h-10 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
              !passwordsMatch ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
            placeholder="••••••••"
          />
          {!passwordsMatch && (
            <p className="text-xs text-destructive mt-1">Passwords do not match.</p>
          )}
        </div>
        <Link
          to="/onboarding/welcome"
          className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          Create account
        </Link>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
