import { AddressPublicDTO, AddressCreateDTO, AddressUpdateDTO } from "dto";
import { validateAddress } from "../../services/validationService";
import { useForm } from "../shared/useForm";

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
  const initialValues: Partial<AddressCreateDTO> = {
    address: "",
    postalCode: "",
    city: "",
    countryName: "",
    isDefault: false,
  };

  // Fonction de validation personnalisée qui transforme les données
  const validateAddressData = async (
    formData: Partial<AddressCreateDTO>
  ): Promise<{ isValid: boolean; errors?: Array<{ field: string; message: string }>; error?: string }> => {
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

    return await validateAddress(addressData);
  };

  const { formData, errors, handleChange, handleSubmit } = useForm<
    Partial<AddressCreateDTO>,
    AddressPublicDTO
  >({
    original: address || null,
    initialValues,
    validateFn: validateAddressData,
    transformData: (data, original) => {
      if (original) {
        // Mode édition : retourner seulement les champs modifiés
        return data;
      } else {
        // Mode création : construire AddressCreateDTO complet
        return {
          addressType: "shipping",
          address: data.address || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          countryName: data.countryName,
          isDefault: data.isDefault || false,
        } as AddressCreateDTO;
      }
    },
  });

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
}
