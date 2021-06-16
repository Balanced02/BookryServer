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
| user_create_success     | New user is created successfully | - |
| greet_user | Welcome `${name}` | name |
| verify_account | `${name}`, Please verify your account | name |
| verified | You’ve verified your account | - |
| email_verified | Email verified successfully | - |
| reset_token_sent | Password reset code has been sent | - |
|  |  |  |


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
| password_empty | Please provide your password | - |
| password_size | Password must have a minimum of 8 characters  | - |
| password_with_number | Password must contain a number | - |
| password_easy | Password too easy to guess, use something stronger | - |
| server_error | Server Error | - |
| auth_failed | Unauthorised access | - |
| token_invalid | Wrong code provided | - |
|  |  | - |


