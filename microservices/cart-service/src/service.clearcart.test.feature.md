Feature: Cart Clearing
  As a user
  I want to clear my cart
  So that I can start fresh

Scenario: Clear cart successfully
  Given a valid user ID "user1"
  When the cart is cleared for the given user ID
  Then the cart should be empty and updated at the correct timestamp

Scenario: Invalid user ID
  Given an invalid user ID "invalid"
  When the cart is attempted to be cleared for the given user ID
  Then an error should be thrown or a default cart should be returned