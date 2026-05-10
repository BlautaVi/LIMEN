describe('Авторизація LIMEN', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('повинен показувати помилку при порожніх полях', () => {
    cy.contains('Увійти').click();
    
    cy.contains('Введіть Email').should('be.visible');
  });

  it('повинен успішно логінитись з правильними даними', () => {
    cy.get('input[placeholder="Ваш Email"]').type('testuser@gmail.com');
    cy.get('input[placeholder="Пароль"]').type('Password123$'); 

    cy.contains('Увійти').click();

    cy.url().should('include', '/dashboard');
    
    cy.contains('Стрічка спільноти').should('be.visible');
  });
});