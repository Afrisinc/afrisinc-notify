import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { identitySchema, type IdentityValues } from "./schemas";
import FormInput from "@/components/auth/FormInput";
import FormPasswordInput from "@/components/auth/FormPasswordInput";
import FormPhoneInput from "@/components/auth/FormPhoneInput";
import FormCountrySelect from "@/components/auth/FormCountrySelect";
import { getCountryByName } from "@/data/countries";
import { useEffect } from "react";

interface StepIdentityProps {
  defaultValues: Partial<IdentityValues>;
  onNext: (values: IdentityValues) => void;
}

const StepIdentity = ({ defaultValues, onNext }: StepIdentityProps) => {

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
    defaultValues,
    mode: "onChange",
  });

  const selectedCountry = useWatch({
    control,
    name: "location",
  });

  useEffect(() => {
    if (selectedCountry) {
      const country = getCountryByName(selectedCountry);
      if (country) {
        setValue("phone", country.dialCode);
      }
    }
  }, [selectedCountry, setValue]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="firstName"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <FormInput
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <FormInput
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <FormCountrySelect
              label="Country (optional)"
              value={field.value}
              onValueChange={field.onChange}
              error={errors.location?.message}
            />
          )}
        />
        <FormPhoneInput
          id="phone"
          label="Phone (optional)"
          placeholder={selectedCountry ? getCountryByName(selectedCountry)?.dialCode : "+1"}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <FormPasswordInput
        id="password"
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <FormPasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button variant="default" type="submit" className="w-full" disabled={!isValid}>
        Continue →
      </Button>
    </form>
  );
};

export default StepIdentity;
