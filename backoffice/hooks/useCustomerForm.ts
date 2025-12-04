import { useState, useEffect, useCallback } from "react";
import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
} from "../dto";
import { validateCustomer } from "../services/validationService";

interface UseCustomerFormProps {
  customer: CustomerPublicDTO | null;
}

interface UseCustomerFormReturn {
  formData: CustomerCreateDTO;
  errors: Record<string, string>;

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (
    onSubmit: (data: CustomerCreateDTO | CustomerUpdateDTO) => void
  ) => Promise<void>;
}

export function useCustomerForm({
  customer,
}: UseCustomerFormProps): UseCustomerFormReturn {
  const [formData, setFormData] = useState<CustomerCreateDTO>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phoneNumber: customer.phoneNumber || "",
      });
    }
  }, [customer]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await validateCustomer(formData);

      if (!result.isValid && result.errors) {
        const newErrors: Record<string, string> = {};
        result.errors.forEach((error) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setErrors({ _general: "Erreur lors de la validation" });
      return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(
    async (onSubmit: (data: CustomerCreateDTO | CustomerUpdateDTO) => void) => {
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      if (customer) {
        const updateData: CustomerUpdateDTO = {};
        if (formData.firstName !== customer.firstName) {
          updateData.firstName = formData.firstName;
        }
        if (formData.lastName !== customer.lastName) {
          updateData.lastName = formData.lastName;
        }
        if (formData.email !== customer.email) {
          updateData.email = formData.email;
        }
        if (formData.phoneNumber !== customer.phoneNumber) {
          updateData.phoneNumber = formData.phoneNumber || undefined;
        }
        onSubmit(updateData);
      } else {
        onSubmit({
          ...formData,
          phoneNumber: formData.phoneNumber || undefined,
        });
      }
    },
    [customer, formData, validate]
  );

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
}
