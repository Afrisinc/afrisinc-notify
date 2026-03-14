interface SignupStepperProps {
  currentStep: number;
  totalSteps: number;
}

const labels = ["Identity", "Account Type", "Details"];

const SignupStepper = ({ currentStep, totalSteps }: SignupStepperProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`mt-1 text-xs ${
              i <= currentStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {labels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div className={`h-px w-8 mb-5 ${
              i < currentStep ? "bg-primary" : "bg-border"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default SignupStepper;
