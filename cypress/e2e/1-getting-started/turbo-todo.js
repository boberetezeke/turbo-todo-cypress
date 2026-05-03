/// <reference types="cypress" />

describe("turbo-todo app", () => {
  const turboTodoUrl = "http://localhost:3000"
  const railsAppPath = "../turbo-todo"

  const visitAsNewUser = () => {
    // Reset app data so each test has a clean starting state.
    cy.exec(`bash -lc 'source "$HOME/.rvm/scripts/rvm" && cd ${railsAppPath} && rvm use ruby-3.4.5@turbo-todo >/dev/null && bin/rails runner "Todo.delete_all"'`)

    // Simulate a fresh browser user/session before each visit.
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.visit(turboTodoUrl)
  }

  beforeEach(() => {
    visitAsNewUser()
  })

  it("starts with no todos", () => {
    cy.get("#todos .todo-item").should("have.length", 0)
  })

  it("adds a todo and shows it", () => {
    const newTodo = "Feed the cat"

    cy.get('input[name="todo[title]"]').type(newTodo)
    cy.get("input.todo-submit-button").click()

    cy.get("#todos .todo-item")
      .should("have.length", 1)
      .first()
      .should("contain.text", newTodo)
  })

  it("adds two todos and drags first item to last", () => {
    const newTodo1 = "Feed the cat"
    const newTodo2 = "Feed the dog"

    cy.get('input[name="todo[title]"]').type(newTodo1)
    cy.get("input.todo-submit-button").click()

    cy.get('input[name="todo[title]"]').type(newTodo2)
    cy.get("input.todo-submit-button").click()

    cy.get("#todos .todo-item").should("have.length", 2)
    cy.get("#todos .todo-item").eq(0).should("contain.text", newTodo1)
    cy.get("#todos .todo-item").eq(1).should("contain.text", newTodo2)

    cy.window().then((win) => {
      const dataTransfer = new win.DataTransfer()

      cy.get("#todos .todo-item").first()
        .trigger("dragstart", { dataTransfer, force: true })

      cy.get("#todos .todo-item").last().then(($last) => {
        const rect = $last[0].getBoundingClientRect()
        const clientX = rect.left + 10
        const clientY = rect.bottom + 10

        cy.wrap(win).trigger("dragover", {
          dataTransfer,
          clientX,
          clientY,
          bubbles: true,
          cancelable: true,
          eventConstructor: "DragEvent",
          force: true
        })

        cy.wrap(win).trigger("drop", {
          dataTransfer,
          clientX,
          clientY,
          bubbles: true,
          cancelable: true,
          eventConstructor: "DragEvent",
          force: true
        })
      })
    })

    cy.get("#todos .todo-item").should("have.length", 2)
    cy.get("#todos .todo-item").eq(0).should("contain.text", newTodo2)
    cy.get("#todos .todo-item").eq(1).should("contain.text", newTodo1)
  })

})

