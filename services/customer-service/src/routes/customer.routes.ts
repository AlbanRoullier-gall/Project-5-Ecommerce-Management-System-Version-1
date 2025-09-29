/**
 * Routes de gestion des clients
 * Configuration centralisée des routes de gestion des clients pour le Service Registry
 *
 * Architecture : Route definition pattern
 * - Routes centralisées et documentées
 * - Séparation de la définition des routes et de la logique métier
 * - Compatible avec Service Registry
 */

/**
 * RouteDefinition
 * Interface pour définir une route de manière structurée
 */
export interface RouteDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: string; // Format: "ControllerName.methodName"
  middleware: string[]; // Noms des middlewares à appliquer
  description: string;
  authRequired: boolean;
  serviceName: string; // Nom du service pour le Service Registry
  version: string; // Version de l'API
}

/**
 * Routes de gestion des clients
 * Configuration centralisée des routes de gestion des clients
 */
export const customerRoutes: RouteDefinition[] = [
  {
    method: "GET",
    path: "/api/customers/:id",
    handler: "CustomerController.getCustomerById",
    middleware: [],
    description: "Récupération d'un client par ID",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "POST",
    path: "/api/customers",
    handler: "CustomerController.createCustomer",
    middleware: [
      "validateRequest",
      "customerCreateSchema",
    ],
    description: "Création d'un nouveau client",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/customers/:id",
    handler: "CustomerController.updateCustomer",
    middleware: [
      "validateRequest",
      "customerUpdateSchema",
    ],
    description: "Mise à jour d'un client",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "DELETE",
    path: "/api/customers/:id",
    handler: "CustomerController.deleteCustomer",
    middleware: [],
    description: "Suppression d'un client",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "GET",
    path: "/api/customers",
    handler: "CustomerController.listCustomers",
    middleware: [],
    description: "Liste des clients avec pagination",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "GET",
    path: "/api/customers/profile",
    handler: "CustomerController.getProfile",
    middleware: [],
    description: "Récupération du profil du client connecté",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/customers/profile",
    handler: "CustomerController.updateProfile",
    middleware: [
      "validateRequest",
      "customerUpdateSchema",
    ],
    description: "Mise à jour du profil du client connecté",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
];

/**
 * Routes d'adresses
 * Configuration centralisée des routes d'adresses
 */
export const addressRoutes: RouteDefinition[] = [
  {
    method: "GET",
    path: "/api/customers/:customerId/addresses",
    handler: "AddressController.getAddresses",
    middleware: [],
    description: "Récupération des adresses d'un client",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "POST",
    path: "/api/customers/:customerId/addresses",
    handler: "AddressController.createAddress",
    middleware: [ "validateRequest", "addressCreateSchema"],
    description: "Création d'une nouvelle adresse",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/customers/:customerId/addresses/:id",
    handler: "AddressController.updateAddress",
    middleware: [ "validateRequest", "addressUpdateSchema"],
    description: "Mise à jour d'une adresse",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "DELETE",
    path: "/api/customers/:customerId/addresses/:id",
    handler: "AddressController.deleteAddress",
    middleware: [],
    description: "Suppression d'une adresse",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
];

/**
 * Routes d'entreprises
 * Configuration centralisée des routes d'entreprises
 */
export const companyRoutes: RouteDefinition[] = [
  {
    method: "GET",
    path: "/api/customers/:customerId/companies",
    handler: "CompanyController.getCompanies",
    middleware: [],
    description: "Récupération des entreprises d'un client",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "POST",
    path: "/api/customers/:customerId/companies",
    handler: "CompanyController.createCompany",
    middleware: [ "validateRequest", "companyCreateSchema"],
    description: "Création d'une nouvelle entreprise",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "PUT",
    path: "/api/customers/:customerId/companies/:id",
    handler: "CompanyController.updateCompany",
    middleware: [ "validateRequest", "companyUpdateSchema"],
    description: "Mise à jour d'une entreprise",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
  {
    method: "DELETE",
    path: "/api/customers/:customerId/companies/:id",
    handler: "CompanyController.deleteCompany",
    middleware: [],
    description: "Suppression d'une entreprise",
    authRequired: true,
    serviceName: "customer-service",
    version: "v1",
  },
];

/**
 * Retourne toutes les routes de clients
 */
export function getCustomerRoutes(): RouteDefinition[] {
  return customerRoutes;
}

/**
 * Retourne toutes les routes d'adresses
 */
export function getAddressRoutes(): RouteDefinition[] {
  return addressRoutes;
}

/**
 * Retourne toutes les routes d'entreprises
 */
export function getCompanyRoutes(): RouteDefinition[] {
  return companyRoutes;
}

/**
 * Retourne toutes les routes publiques (sans authentification requise)
 */
export function getPublicRoutes(): RouteDefinition[] {
  return [];
}

/**
 * Retourne toutes les routes protégées (authentification requise)
 */
export function getProtectedRoutes(): RouteDefinition[] {
  return [...customerRoutes, ...addressRoutes, ...companyRoutes];
}
