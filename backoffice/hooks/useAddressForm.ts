import { useState, useEffect, useCallback } from "react";
import { AddressPublicDTO, AddressCreateDTO, AddressUpdateDTO } from "../dto";
import { validateAddress } from "../services/validationService";

interface UseAddressFormProps {
  address: AddressPublicDTO | null;
}

interface UseAddressFormReturn {
  formData: Partial<AddressCreateDTO>;
  errors: Record<string, string>;

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (
    onSubmit: (data: AddressCreateDTO | AddressUpdateDTO) => void
  ) => Promise<void>;
}

export function useAddressForm({
  address,
}: UseAddressFormProps): UseAddressFormReturn {
  const [formData, setFormData] = useState<Partial<AddressCreateDTO>>({
    address: "",
    postalCode: "",
    city: "",
    countryName: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (address) {
      setFormData({
        address: address.address,
        postalCode: address.postalCode,
        city: address.city,
        countryName: address.countryName,
        isDefault: address.isDefault,
      });
    } else {
      setFormData({
        address: "",
        postalCode: "",
        city: "",
        countryName: "",
        isDefault: false,
      });
    }
  }, [address]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
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
      const addressData = {
        shipping: {
          address: formData.address || "",
          postalCode: formData.postalCode || "",
          city: formData.city || "",
          ...(formData.countryName && { countryName: formData.countryName }),
        },
        billing: {
          address: formData.address || "",
          postalCode: formData.postalCode || "",
          city: formData.city || "",
          ...(formData.countryName && { countryName: formData.countryName }),
        },
        useSameBillingAddress: true,
      };

      const result = await validateAddress(addressData);

      if (!result.isValid) {
        const newErrors: Record<string, string> = {};
        if (result.error) {
          if (
            result.error.includes("adresse") ||
            result.error.includes("address")
          ) {
            newErrors.address = result.error;
          } else if (
            result.error.includes("code postal") ||
            result.error.includes("postalCode")
          ) {
            newErrors.postalCode = result.error;
          } else if (
            result.error.includes("ville") ||
            result.error.includes("city")
          ) {
            newErrors.city = result.error;
          } else {
            newErrors._general = result.error;
          }
        }
        if (result.errors) {
          result.errors.forEach((error) => {
            newErrors[error.field] = error.message;
          });
        }
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
    async (onSubmit: (data: AddressCreateDTO | AddressUpdateDTO) => void) => {
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      if (address) {
        const updateData: AddressUpdateDTO = {};
        if (formData.address !== address.address) {
          updateData.address = formData.address;
        }
        if (formData.postalCode !== address.postalCode) {
          updateData.postalCode = formData.postalCode;
        }
        if (formData.city !== address.city) {
          updateData.city = formData.city;
        }
        if (formData.isDefault !== address.isDefault) {
          updateData.isDefault = formData.isDefault;
        }
        onSubmit(updateData);
      } else {
        const createData: AddressCreateDTO = {
          addressType: "shipping",
          address: formData.address || "",
          postalCode: formData.postalCode || "",
          city: formData.city || "",
          countryName: formData.countryName,
          isDefault: formData.isDefault || false,
        };
        onSubmit(createData);
      }
    },
    [address, formData, validate]
  );

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
}
