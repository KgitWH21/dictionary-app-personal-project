//registers a new user through the UI and lands on /home
Cypress.Commands.add('registerFreshUser', () => {
    const suffix = Date.now()
    const username = `tester${suffix}`

    cy.visit('/register')
    cy.get('[data-cy=register-username]').type(username)
    cy.get('[data-cy=register-email]').type(`${username}@example.com`)
    cy.get('[data-cy=register-password]').type('Sup3rSecret!pw')
    cy.get('[data-cy=register-password-confirm]').type('Sup3rSecret!pw')
    cy.get('[data-cy=register-submit]').click()

    cy.location('pathname').should('eq', '/home')
    cy.wrap(username).as('username')
})

Cypress.Commands.add('createCollection', (name) => {
    cy.get('[data-cy=collection-name]').type(name)
    cy.get('[data-cy=save-collection]').click()
    cy.get('[data-cy=collection-card]').should('contain', name)
})