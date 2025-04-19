import {isDemo} from "../support/commands/utils"

describe("App Navigation without errors", () => {
    let app_id
    before(() => {
        cy.createVariant()
        cy.get("@app_id").then((appId) => {
            app_id = appId
        })
    })

    beforeEach(() => {
        cy.visit(`/apps/${app_id}/playground`)
        cy.contains(/modify parameters/i)
    })

    it("should navigate successfully to Playground", () => {
        cy.location("pathname").should("include", "/playground")
        cy.get('[data-cy="playground-header"]').within(() => {
            cy.get("h2").should("contain.text", "1. Modify Parameters")
            cy.get("button").should("have.length", 4)
        })
    })

    it("should navigate successfully to Testsets", () => {
        cy.clickLinkAndWait('[data-cy="app-testsets-link"]')
        cy.location("pathname").should("include", "/testsets")
        cy.get('[data-cy="app-testset-list"]').should("exist")
    })

    it("should navigate successfully to Evaluations page", () => {
        cy.clickLinkAndWait('[data-cy="app-evaluations-link"]')
        cy.url().should("include", "/evaluations")
        cy.contains(/evaluations/i)

        cy.get(".ant-tabs-tab").eq(1).click()
        cy.url().should("include", "/evaluations?selectedEvaluation=human_annotation")

        cy.get(".ant-tabs-tab").eq(2).click()
        cy.url().should("include", "/evaluations?selectedEvaluation=human_ab_testing")

        cy.get(".ant-tabs-tab").eq(0).click()
        cy.url().should("include", "/evaluations?selectedEvaluation=auto_evaluation")
    })

    if (isDemo()) {
        it("should navigate successfully to Endpoints", () => {
            cy.clickLinkAndWait('[data-cy="app-deployment-link"]')
            cy.clickLinkAndWait('[data-cy="app-endpoints-link"]')
            cy.location("pathname").should("include", "/endpoints")
            cy.get('[data-cy="endpoints"]').within(() => {
                cy.contains("API endpoint")
            })
        })
    }

    it("should navigate successfully to Settings", () => {
        cy.clickLinkAndWait('[data-cy="settings-link"]')
        cy.location("pathname").should("include", "/settings")
        cy.get('[data-cy="secrets"]').within(() => {
            cy.contains("Model Hub")
        })
    })

    after(() => {
        cy.cleanupVariantAndTestset()
    })
})
