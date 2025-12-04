import {
  CustomerPublicDTO,
  CustomerCreateDTO,
  CustomerUpdateDTO,
} from "../../dto";
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
        // Mode édition : le hook useForm gère déjà la comparaison
        // On transforme juste phoneNumber pour gérer les chaînes vides
        const updateData = data as Partial<CustomerCreateDTO>;
        if (updateData.phoneNumber === "") {
          updateData.phoneNumber = undefined;
        }
        return updateData;
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
