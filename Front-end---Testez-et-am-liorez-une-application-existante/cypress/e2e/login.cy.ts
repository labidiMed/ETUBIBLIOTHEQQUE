/// <reference types="cypress" />

// E2E de l'ecran de connexion. Les appels API sont mockes via cy.intercept.
describe('Ecran Connexion (/login)', () => {

  it('affiche le formulaire de connexion', () => {
    cy.visit('/login');
    cy.contains('Authentification');
    cy.get('input[formControlName="login"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
  });

  it('affiche les erreurs de validation si on soumet un formulaire vide', () => {
    cy.visit('/login');
    cy.contains('button', 'Login').click();
    cy.contains('Login is required');
    cy.contains('Password is required');
  });

  it('connexion reussie : recoit un token et redirige vers /students (API mockees)', () => {
    cy.intercept('POST', '/api/login', { statusCode: 200, body: 'jwt-token' }).as('login');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('students');

    cy.visit('/login');
    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('password');
    cy.contains('button', 'Login').click();

    cy.wait('@login');
    // Apres succes, l'app redirige vers l'ecran des etudiants
    cy.url().should('include', '/students');
    cy.contains('Gestion des étudiants');
  });

  it('affiche un message d\'erreur si les identifiants sont invalides', () => {
    cy.intercept('POST', '/api/login', { statusCode: 401, body: 'Invalid credentials' }).as('login');

    cy.visit('/login');
    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('mauvais');
    cy.contains('button', 'Login').click();

    cy.wait('@login');
    cy.contains('Échec de l\'authentification');
    cy.url().should('include', '/login');
  });
});
