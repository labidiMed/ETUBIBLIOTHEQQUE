# Tests E2E (Cypress)

Tests de bout en bout des écrans du front-end. **Tous les appels API sont mockés** avec `cy.intercept` : aucun back-end n'est nécessaire.

## Écrans couverts

| Spec | Écran | Cas testés |
|------|-------|------------|
| `e2e/register.cy.ts` | `/register` | affichage, validation des champs requis, création réussie (API mockée) |
| `e2e/login.cy.ts` | `/login` | affichage, validation, connexion réussie → redirection `/students`, identifiants invalides |
| `e2e/students.cy.ts` | `/students` | liste, ajout, modification, suppression (avec confirmation), déconnexion |

## Lancer les tests

1. Démarrer l'application (au choix) :
   ```bash
   npm start          # serveur de dev sur http://localhost:4200
   # ou via Docker : docker compose up -d frontend
   ```
2. Exécuter Cypress :
   ```bash
   npm run cypress:run    # headless (terminal)
   npm run cypress:open   # mode interactif (navigateur)
   ```
   La `baseUrl` est `http://localhost:4200` (voir `cypress.config.ts`).

## Couverture de code E2E

La mesure de couverture de code en E2E nécessite d'**instrumenter** l'application avec Istanbul puis d'utiliser le plugin
[`@cypress/code-coverage`](https://github.com/cypress-io/code-coverage). Avec le builder **esbuild** d'Angular 19,
l'instrumentation se fait via un builder personnalisé (`@angular-builders/custom-esbuild` + un plugin Istanbul) qui sert
une version instrumentée de l'app ; le plugin agrège ensuite la couverture pendant les tests.

> Note : la couverture **de code** au niveau des composants/services est déjà assurée à >80 % par les tests unitaires Jest
> (`npm test`). Les tests E2E ci-dessus couvrent quant à eux **la totalité des écrans** et des parcours utilisateur
> (inscription, connexion + redirection, CRUD étudiants).
