/// <reference types="cypress" />

// E2E de l'ecran de gestion des etudiants (CRUD). Ecran protege : on injecte un token
// dans le localStorage pour passer la garde de route. Tous les appels API sont mockes.
describe('Ecran Gestion des etudiants (/students)', () => {

  const marie = { id: 1, firstName: 'Marie', lastName: 'Curie', email: 'marie@biblio.fr' };

  beforeEach(() => {
    // Liste initiale renvoyee au chargement
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [marie] }).as('list');
    cy.visit('/students', {
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'jwt-token'); // authentifie l'utilisateur
      }
    });
    cy.wait('@list');
  });

  it('affiche la liste des etudiants', () => {
    cy.contains('Gestion des étudiants');
    cy.contains('td', 'Marie');
    cy.contains('td', 'marie@biblio.fr');
  });

  it('ajoute un etudiant (API mockee)', () => {
    const louis = { id: 2, firstName: 'Louis', lastName: 'Pasteur', email: 'louis@biblio.fr' };
    cy.intercept('POST', '/api/students', { statusCode: 201, body: louis }).as('create');
    // Apres creation, le composant recharge la liste
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [marie, louis] }).as('reload');

    cy.get('input[formControlName="firstName"]').type('Louis');
    cy.get('input[formControlName="lastName"]').type('Pasteur');
    cy.get('input[formControlName="email"]').type('louis@biblio.fr');
    cy.contains('button', 'Ajouter').click();

    cy.wait('@create').its('request.body').should('deep.include', { firstName: 'Louis', email: 'louis@biblio.fr' });
    cy.contains('td', 'Louis');
  });

  it('modifie un etudiant (API mockee)', () => {
    const updated = { id: 1, firstName: 'Marie', lastName: 'Sklodowska', email: 'marie@biblio.fr' };
    cy.intercept('PUT', '/api/students/1', { statusCode: 200, body: updated }).as('update');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [updated] }).as('reload');

    cy.contains('tr', 'Marie').contains('button', 'Modifier').click();
    cy.get('input[formControlName="lastName"]').clear().type('Sklodowska');
    cy.contains('button', 'Mettre à jour').click();

    cy.wait('@update');
    cy.contains('td', 'Sklodowska');
  });

  it('supprime un etudiant apres confirmation (API mockee)', () => {
    cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('delete');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('reload');
    cy.on('window:confirm', () => true); // confirme la boite de dialogue

    cy.contains('tr', 'Marie').contains('button', 'Supprimer').click();

    cy.wait('@delete');
    cy.contains('Aucun étudiant pour le moment');
  });

  it('deconnexion : redirige vers /login', () => {
    cy.contains('button', 'Déconnexion').click();
    cy.url().should('include', '/login');
  });
});
