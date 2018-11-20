Feature: Banking Kata

Scenario: Account

  Given I have opened an account
  And I have deposited 500 EUR on 2015-12-24
  And I have withdrawn 100 EUR on 2016-08-23 
  When I view my statement
  Then the statement should read:
  """
  24.12.2015   +500      500
  23.8.2016    -100      400
  """
