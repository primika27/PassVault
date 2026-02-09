# Security Overview
This project follows a layered architecture with a clear frontend/backend trust boundary.

### Password Strength Evaluation
The system uses zxcvbn to detect weak passwords based on real-world attack patterns rather than arbitrary complexity rules.
