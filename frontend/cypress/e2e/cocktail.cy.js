/**
 * Frontend E2E tests — Cypress intercepts all API calls so the backend
 * does not need to be running. Start the dev server first: `npm run serve`
 */

const API = 'http://localhost:3000';

const cocktailList = [
  { id: 1, title: 'Mojito', description: 'A refreshing mint cocktail', price: 8.5 },
  { id: 2, title: 'Piña Colada', description: 'A tropical coconut delight', price: 10.0 },
];

// ─── Cocktail List ────────────────────────────────────────────────────────────

describe('Cocktail List page', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API}/cocktail*`, { body: cocktailList }).as('getCocktail');
    cy.visit('/');
    cy.wait('@getCocktail');
  });

  it('should display the page heading', () => {
    cy.get('h1').should('contain', 'Cocktails');
  });

  it('should render one card per cocktail', () => {
    cy.get('.cocktail-card').should('have.length', 2);
  });

  it('should display the title and price for each cocktail', () => {
    cy.get('.cocktail-title').first().should('contain', 'Mojito');
    cy.get('.cocktail-price').first().should('contain', '8.5');
  });

  it('should show "No cocktails found" when the API returns an empty list', () => {
    cy.intercept('GET', `${API}/cocktail*`, { body: [] }).as('empty');
    cy.visit('/');
    cy.wait('@empty');
    cy.contains('No cocktails found').should('be.visible');
  });

  it('should filter results when a search term is typed', () => {
    cy.intercept('GET', `${API}/cocktail?search=mojito`, { body: [cocktailList[0]] }).as('search');
    cy.get('input#search').type('mojito');
    cy.wait('@search');
    cy.get('.cocktail-card').should('have.length', 1);
    cy.get('.cocktail-title').should('contain', 'Mojito');
  });

  it('should navigate to the detail page when a cocktail card is clicked', () => {
    cy.intercept('GET', `${API}/cocktail/1`, { body: cocktailList[0] }).as('getOne');
    cy.get('.cocktail-card').first().click();
    cy.url().should('include', '/cocktail/1');
  });
});

// ─── Cocktail Details ─────────────────────────────────────────────────────────

describe('Cocktail Details page', () => {
  it('should display the cocktail title, description, and price', () => {
    cy.intercept('GET', `${API}/cocktail/1`, { body: cocktailList[0] }).as('getOne');
    cy.visit('/cocktail/1');
    cy.wait('@getOne');

    cy.get('h1').should('contain', 'Mojito');
    cy.get('.description').should('contain', 'refreshing mint cocktail');
    cy.get('.price-badge').should('contain', '8.5');
  });

  it('should show an error toast and the not-found view when the cocktail is not found', () => {
    cy.intercept('GET', `${API}/cocktail/999`, {
      statusCode: 404,
      body: { detail: 'Cocktail with id 999 not found' },
    }).as('notFound');

    cy.visit('/cocktail/999');
    cy.wait('@notFound');

    cy.get('.toast.error').should('contain', 'Cocktail with id 999 not found');
    cy.get('.not-found').should('be.visible');
  });

  it('should navigate back to the list when the back link is clicked', () => {
    cy.intercept('GET', `${API}/cocktail/1`, { body: cocktailList[0] }).as('getOne');
    cy.intercept('GET', `${API}/cocktail*`, { body: cocktailList }).as('getAll');
    cy.visit('/cocktail/1');
    cy.wait('@getOne');

    cy.get('.back-link').click();
    cy.url().should('match', /\/$|#\/$/);
  });
});

// ─── New Cocktail form ────────────────────────────────────────────────────────

describe('New Cocktail page', () => {
  beforeEach(() => {
    cy.visit('/new');
  });

  it('should render the form with title, price, and description fields', () => {
    cy.get('#title').should('exist');
    cy.get('#price').should('exist');
    cy.get('#description').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show a success toast and reset the form after a successful submission', () => {
    cy.intercept('POST', `${API}/cocktail`, { statusCode: 201, body: true }).as('create');

    cy.get('#title').type('Daiquiri');
    cy.get('#price').type('9.0');
    cy.get('#description').type('Rum and fresh lime juice');
    cy.get('button[type="submit"]').click();

    cy.wait('@create');

    cy.get('.toast.success').should('contain', 'Cocktail created successfully');
    cy.get('#title').should('have.value', '');
    cy.get('#description').should('have.value', '');
  });

  it('should show an error toast when the title already exists', () => {
    cy.intercept('POST', `${API}/cocktail`, {
      statusCode: 409,
      body: { detail: 'A cocktail with title "Daiquiri" already exists' },
    }).as('conflict');

    cy.get('#title').type('Daiquiri');
    cy.get('#price').type('9.0');
    cy.get('#description').type('Duplicate');
    cy.get('button[type="submit"]').click();

    cy.wait('@conflict');

    cy.get('.toast.error').should('contain', 'already exists');
  });

  it('should navigate back to the list when the back link is clicked', () => {
    cy.intercept('GET', `${API}/cocktail*`, { body: cocktailList }).as('getAll');
    cy.get('.back-link').click();
    cy.url().should('match', /\/$|#\/$/);
  });
});
