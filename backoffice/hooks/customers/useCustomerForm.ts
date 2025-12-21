import { CustomerPublicDTO, CustomerCreateDTO, CustomerUpdateDTO } from "dto";
import { validateCustomer } from "../../services/validationService";
import { useForm } from "../shared/useForm";

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
  const initialValues: CustomerCreateDTO = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  };

  const { formData, errors, handleChange, handleSubmit } = useForm<
    CustomerCreateDTO,
    CustomerPublicDTO
  >({
    original: customer || null,
    initialValues,
    validateFn: validateCustomer,
    transformData: (data, original) => {
      if (original) {
        // Mode édition : exclure explicitement customerId et autres champs non modifiables
        // data peut contenir customerId car formData est initialisé avec original
        const dataWithAny = data as any;

        // Créer un objet CustomerUpdateDTO avec uniquement les champs autorisés
        const result: CustomerUpdateDTO = {};

        // Inclure uniquement les champs qui existent dans CustomerUpdateDTO
        if ("firstName" in dataWithAny && dataWithAny.firstName !== undefined) {
          result.firstName = dataWithAny.firstName;
        }
        if ("lastName" in dataWithAny && dataWithAny.lastName !== undefined) {
          result.lastName = dataWithAny.lastName;
        }
        if ("email" in dataWithAny && dataWithAny.email !== undefined) {
          result.email = dataWithAny.email;
        }
        if (
          "phoneNumber" in dataWithAny &&
          dataWithAny.phoneNumber !== undefined
        ) {
          result.phoneNumber =
            dataWithAny.phoneNumber === ""
              ? undefined
              : dataWithAny.phoneNumber;
        }

        // customerId est explicitement exclu - ne jamais l'inclure

        return result;
      } else {
        // Mode création : transformer phoneNumber vide en undefined
        return {
          ...data,
          phoneNumber: data.phoneNumber || undefined,
        };
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
