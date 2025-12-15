/**
 * Mapper de Réponse - Service PDF Export
 * Mapper pour créer les réponses standardisées
 */
export declare class ResponseMapper {
    /**
     * Réponse de santé du service
     */
    static healthSuccess(): {
        status: string;
        timestamp: string;
        service: string;
    };
    /**
     * Réponse d'erreur générique
     */
    static error(message: string, status?: number): {
        error: string;
        timestamp: string;
        status: number;
    };
    /**
     * Réponse d'erreur de validation
     */
    static validationError(message: string): {
        error: string;
        message: string;
        timestamp: string;
        status: number;
    };
    /**
     * Réponse d'erreur d'export
     */
    static exportError(message: string): {
        error: string;
        message: string;
        timestamp: string;
        status: number;
    };
    /**
     * Réponse d'erreur de ressource non trouvée
     */
    static notFoundError(resource: string): {
        error: string;
        message: string;
        timestamp: string;
        status: number;
    };
    /**
     * Réponse d'erreur interne du serveur
     */
    static internalServerError(): {
        error: string;
        message: string;
        timestamp: string;
        status: number;
    };
    /**
     * Réponse d'erreur de santé du service
     */
    static healthError(): {
        status: string;
        timestamp: string;
        service: string;
        error: string;
    };
}
//# sourceMappingURL=ResponseMapper.d.ts.map