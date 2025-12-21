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
    countryName: "Belgique",
    isDefault: false,
  };

  // Fonction de validation personnalisée qui transforme les données
  const validateAddressData = async (
    formData: Partial<AddressCreateDTO>
  ): Promise<{
    isValid: boolean;
    errors?: Array<{ field: string; message: string }>;
    error?: string;
  }> => {
    // S'assurer que "Belgique" est toujours défini pour la validation
    const countryName = formData.countryName || "Belgique";
    const addressData = {
      shipping: {
        address: formData.address || "",
        postalCode: formData.postalCode || "",
        city: formData.city || "",
        countryName: countryName,
      },
      billing: {
        address: formData.address || "",
        postalCode: formData.postalCode || "",
        city: formData.city || "",
        countryName: countryName,
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
    ignoreFields: ["addressId", "customerId"], // Exclure ces champs de la comparaison pour les updates
    transformData: (data, original) => {
      if (original) {
        // Mode édition : construire AddressUpdateDTO avec seulement les champs autorisés
        // Exclure addressId, customerId et autres champs non modifiables
        const dataWithAny = data as any;
        const result: AddressUpdateDTO = {};
        if (
          "addressType" in dataWithAny &&
          dataWithAny.addressType !== undefined
        ) {
          result.addressType = dataWithAny.addressType;
        }
        if ("address" in dataWithAny && dataWithAny.address !== undefined) {
          result.address = dataWithAny.address;
        }
        if (
          "postalCode" in dataWithAny &&
          dataWithAny.postalCode !== undefined
        ) {
          result.postalCode = dataWithAny.postalCode;
        }
        if ("city" in dataWithAny && dataWithAny.city !== undefined) {
          result.city = dataWithAny.city;
        }
        if (
          "countryName" in dataWithAny &&
          dataWithAny.countryName !== undefined
        ) {
          result.countryName = dataWithAny.countryName;
        }
        if ("isDefault" in dataWithAny && dataWithAny.isDefault !== undefined) {
          result.isDefault = dataWithAny.isDefault;
        }
        return result;
      } else {
        // Mode création : construire AddressCreateDTO complet
        // S'assurer que "Belgique" est toujours défini pour les nouvelles adresses
        return {
          addressType: "shipping",
          address: data.address || "",
          postalCode: data.postalCode || "",
          city: data.city || "",
          countryName: data.countryName || "Belgique",
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
