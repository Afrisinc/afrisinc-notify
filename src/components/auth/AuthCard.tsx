interface AuthCardProps {
  children: React.ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-8 shadow-card">
      {children}
    </div>
  );
};

export default AuthCard;
