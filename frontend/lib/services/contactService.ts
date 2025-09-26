import {
  ContactEmailRequest,
  ContactEmailResponse,
} from "../../../shared-types";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:13000";

export class ContactService {
  static async sendContactEmail(
    formData: ContactEmailRequest
  ): Promise<ContactEmailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi de l'email");
      }

      const data: ContactEmailResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur ContactService:", error);
      throw error;
    }
  }
}
