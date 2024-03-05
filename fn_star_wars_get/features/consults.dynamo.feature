Feature: ConsultsDynamoDB Feature

Scenario: Get total number of items
  Given I have a ConsultsDynamoDB instance
  When I call the getTotalNumberItems method
  Then I should receive the total number of items
