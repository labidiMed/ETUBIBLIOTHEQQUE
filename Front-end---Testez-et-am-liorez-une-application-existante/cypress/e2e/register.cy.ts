/// <reference types="cypress" />

// E2E de l'ecran d'inscription (le plus simple). Les appels API sont mockes via cy.intercept.
describe('Ecran Inscription (/register)', () => {

  it('affiche le formulaire d\'inscription', () => {
    cy.visit('/register');
    cy.contains('Registration Form');
    cy.get('input[formControlName="firstName"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
  });

  it('affiche les erreurs de validation si on soumet un formulaire vide', () => {
    cy.visit('/register');
    cy.contains('button', 'Register').click();
    cy.contains('First Name is required');
    cy.contains('Login is required');
  });

  it('cree un compte avec succes (API mockee) et affiche le message de succes', () => {
    // On mocke l'appel d'inscription et on espionne window.alert
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');
    cy.visit('/register', {
      onBeforeLoad(win) {
        cy.stub(win, 'alert').as('alert');
      }
    });

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="login"]').type('jdoe');
    cy.get('input[formControlName="password"]').type('password');
    cy.contains('button', 'Register').click();

    // L'appel part avec le bon corps, et l'alerte de succes est declenchee
    cy.wait('@register').its('request.body').should('deep.include', {
      firstName: 'John', lastName: 'Doe', login: 'jdoe', password: 'password'
    });
    cy.get('@alert').should('have.been.calledWith', 'SUCCESS!! :-)');
  });
});
