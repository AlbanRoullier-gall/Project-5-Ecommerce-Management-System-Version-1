/**
 * Hook pour finaliser un paiement après retour de Stripe
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { finalizePayment } from "../services/paymentService";

interface UsePaymentFinalizationResult {
  isProcessing: boolean;
  error: string | null;
}

/**
 * Hook pour finaliser automatiquement un paiement après retour de Stripe
 */
export function usePaymentFinalization(
  onSuccess?: () => void
): UsePaymentFinalizationResult {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFinalized = useRef(false);

  useEffect(() => {
    // Attendre que le router soit prêt
    if (!router.isReady) {
      return;
    }

    // Stripe ajoute session_id dans les query params
    const sessionId =
      (router.query.session_id as string) || (router.query.csid as string);

    // Éviter les appels multiples
    if (!sessionId || isProcessing || hasFinalized.current) {
      return;
    }

    setIsProcessing(true);
    hasFinalized.current = true;
    setError(null);

    const finalize = async () => {
      try {
        await finalizePayment(sessionId);
        if (onSuccess) {
          onSuccess();
        }
      } catch (e) {
        logger.error("Failed to finalize payment", e, { sessionId });
        setError(
          e instanceof Error ? e.message : "Erreur lors de la finalisation"
        );
        // Réinitialiser hasFinalized en cas d'erreur pour permettre un retry
        hasFinalized.current = false;
      } finally {
        setIsProcessing(false);
      }
    };

    finalize();
  }, [
    router.isReady,
    router.query.session_id,
    router.query.csid,
    isProcessing,
    onSuccess,
  ]);

  return {
    isProcessing,
    error,
  };
}

