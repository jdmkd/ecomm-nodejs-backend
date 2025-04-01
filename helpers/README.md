# API Response Utility

This folder contains helper functions for standardizing API responses across the application.

## Response Utility

The `responseUtil.js` file provides a standardized way to send responses to clients, ensuring consistency across all API endpoints.

### Available Functions

#### sendSuccess(res, message, data = null, statusCode = 200)
Sends a success response with the provided message, data, and status code.

```javascript
// Example usage
const { sendSuccess } = require('../helpers/responseUtil');
sendSuccess(res, "User created successfully", user, 201);
```

#### sendError(res, message, statusCode = 500)
Sends an error response with the provided message and status code.

```javascript
// Example usage
const { sendError } = require('../helpers/responseUtil');
sendError(res, "An unexpected error occurred", 500);
```

#### sendValidationError(res, message)
Sends a validation error response (status code 400) with the provided message.

```javascript
// Example usage
const { sendValidationError } = require('../helpers/responseUtil');
sendValidationError(res, "Email already in use");
```

#### sendNotFoundError(res, message)
Sends a not found error response (status code 404) with the provided message.

```javascript
// Example usage
const { sendNotFoundError } = require('../helpers/responseUtil');
sendNotFoundError(res, "User not found");
```

## Benefits

- **Consistency**: Ensures all API responses follow the same structure
- **DRY Principle**: Eliminates repeated response code across controllers
- **Maintainability**: Makes it easier to update response format across the entire application
- **Readability**: Makes route handlers cleaner and more focused on business logic 