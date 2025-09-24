// ========================================
// CONFIGURATION DE DÉVELOPPEMENT TEMPORAIRE
// ========================================
// Ce fichier configure le back office pour le développement
// SANS Docker pour faciliter le débogage
//
// ATTENTION: Ceci est temporaire pour le développement uniquement
// ========================================

module.exports = {
  // URL de l'API Gateway (accessible depuis le navigateur)
  apiUrl: "http://localhost:13000",

  // Configuration pour le développement
  development: true,

  // Port du back office en développement
  port: 3001,
};
