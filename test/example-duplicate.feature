Feature: Example feature
  As a user of cucumber.js
  I want to have documentation on cucumber
  In order to concentrate on building awesome applications

  Scenario: Reading documentation
    Given I am on the cuke-tap repo page
    When I go to the README file
    Then I should see "Usage" as the page title
