import { forwardRef } from "react";

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, id, labelClassName = "text-sm text-foreground", containerClassName = "flex items-center gap-2", ...props }, ref) => {
    return (
      <label className={`${containerClassName} cursor-pointer`}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className="rounded"
          {...props}
        />
        {label && <span className={labelClassName}>{label}</span>}
      </label>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export default FormCheckbox;
