# Language localisation for response messages

## Success Responses
Response format: 
```javascript
{
message: "user_create_success",  
variables: {name: "John Doe", email: "johndoe@gmail.com"},
data: {...user}
}
```

| Name/Key        | Description           | Variables  |
| :-------------: |:-----------:| :-----:|
| api_greeting     | Welcome to bookry APIs | - |
| user_create_success     | New user is created successfully | - |
| greet_user | Welcome `${name}` | name |
| verify_account | `${name}`, Please verify your account | name |
| verified | You’ve been verified Successfully| - |
| email_verified | Email verified successfully | - |
| verify_token_sent | Verification code sent succesfully | - |
| reset_token_sent | Password reset code has been sent | - |
| password_reset_success | Password changed succesfully' | - |
| database_connected | Database connected successfully | - |
|  |  | - |


## Error Responses
Response format: 
```javascript
{
message: "user_not_found_exception",  
variables: {},
data: {...user}
}
```

| Name/Key        | Description           | Variables  |
| :-------------: |:-----------:| :-----:|
| not_found_exception | Invalid Url | - |
| user_not_found_exception | User not found | - |
| validation_exception | Invalid Request Body | - |
| invalid_credentials | Authentication failed, invalid Email or Password | - |
| full_name_empty | Please provide your full name | - |
| email_invalid | Please provide a valid email address | - |
| email_inuse | A user with this email already exist | - |
| password_invalid | Please provide a valid password and try again | - |
| password_empty | Please provide your password | - |
| password_length | Password must have a minimum of 8 characters  | - |
| password_with_number | Password must contain a number | - |
| password_easy | Password too easy to guess, use something stronger | - |
| server_error | Something went wrong, try again later | - |
| verify_email | Please verify your email address | - |
| access_failed | Unauthorised access | - |
| token_invalid | Invalid token provided | - |
|  |  | - |


