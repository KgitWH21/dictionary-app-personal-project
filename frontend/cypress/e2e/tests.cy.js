describe('Authentication', () => {
    beforeEach(() => {
        cy.clearCookies()
    })

    it('sends an anonymous visitor from /home to the login page', () => {
        cy.visit('/home')
        cy.location('pathname').should('eq', '/')
        cy.get('[data-cy=login-submit]').should('exist')
    })

    it('registers a new user and lands on the collections page', () => {
        cy.registerFreshUser()
        cy.get('@username').then((username) => {
            cy.get('[data-cy=current-user]').should('contain', username)
        })
    })
  })