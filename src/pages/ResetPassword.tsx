import { Link } from "react-router-dom";
import { useState } from "react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Set new password</h2>
      <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1.5">New password</label>
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>
        <Link
          to="/login"
          className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          Update password
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;
