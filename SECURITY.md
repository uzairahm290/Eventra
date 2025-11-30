# Security Implementation - Eventra

## SQL Injection Prevention

### Backend Protection
✅ **Entity Framework Core with LINQ Queries**
- All database queries use parameterized queries automatically
- No raw SQL queries (`FromSqlRaw`, `ExecuteSqlRaw`) are used
- EF Core's `.Where()`, `.FindAsync()`, and `.FirstOrDefaultAsync()` automatically parameterize inputs
- `EF.Functions.Like()` in SearchController uses parameterized queries

### Frontend Protection
✅ **Input Validation**
- Client-side validation for suspicious SQL patterns
- Security utility functions in `/src/utils/security.ts`
- Input validation on all API calls

## Cross-Site Scripting (XSS) Prevention

### Backend
✅ **Security Headers** (Program.cs)
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Browser XSS protection
- `Content-Security-Policy` - Restricts resource loading

### Frontend
✅ **React Auto-Escaping**
- React automatically escapes JSX content
- Custom sanitization functions available in `security.ts`

## Cross-Site Request Forgery (CSRF) Prevention

### Backend
✅ **JWT Authentication**
- Stateless authentication using JWT tokens
- Token required in Authorization header for protected endpoints
- No session cookies vulnerable to CSRF

### Frontend
✅ **CSRF Headers**
- `X-Requested-With: XMLHttpRequest` header on all API requests
- Token-based authentication

## Authentication & Authorization

### Backend
✅ **ASP.NET Core Identity**
- Strong password requirements (8+ chars, uppercase, lowercase, digit, special char)
- JWT tokens with expiration (7 days)
- Role-based authorization (Admin, User)
- `[Authorize]` attributes on protected endpoints
- `[Authorize(Roles = "Admin")]` for admin-only endpoints

### Frontend
✅ **Secure Token Storage**
- JWT tokens stored in localStorage
- Automatic token inclusion in authenticated requests
- Protected routes with role-based access control

## Data Validation

### Backend
✅ **Model Validation**
- Data annotations on DTOs (`[Required]`, `[MaxLength]`, `[EmailAddress]`, etc.)
- Automatic model state validation
- Custom validation error responses

### Frontend
✅ **Input Validation**
- Email format validation
- URL format validation
- Phone number validation
- Input length validation
- Alphanumeric sanitization

## Additional Security Measures

### JSON Security
✅ **JSON Configuration**
- Reference cycle handling to prevent circular references
- Max depth limit (32) to prevent stack overflow attacks

### HTTPS
✅ **Secure Communication**
- HTTPS redirection enabled
- Secure cookie flags (when applicable)

### CORS
✅ **Controlled Access**
- CORS policy restricted to localhost:5173 (development)
- AllowCredentials enabled for authenticated requests

### Rate Limiting
✅ **Frontend Rate Limiting**
- Client-side rate limiter class
- Configurable limits per endpoint
- Prevents abuse and brute force attempts

## Security Best Practices

### DO's ✅
- Always use Entity Framework LINQ queries
- Validate and sanitize all user inputs
- Use `[Authorize]` attributes on protected endpoints
- Implement proper error handling
- Log security-related events
- Keep dependencies updated
- Use environment variables for sensitive data

### DON'Ts ❌
- Never use raw SQL queries without parameterization
- Never store sensitive data in localStorage (tokens are acceptable for web apps)
- Never trust client-side validation alone
- Never expose sensitive information in error messages
- Never commit sensitive configuration files (appsettings.json)
- Never disable HTTPS in production

## Security Checklist for Development

- [ ] All user inputs validated on both client and server
- [ ] All database queries use parameterized queries
- [ ] All endpoints properly authorized
- [ ] Sensitive data never logged
- [ ] Error messages don't expose system information
- [ ] Dependencies checked for vulnerabilities
- [ ] HTTPS enforced in production
- [ ] CORS properly configured for production
- [ ] Rate limiting implemented for production
- [ ] Security headers configured
- [ ] Password policies enforced
- [ ] JWT token expiration reasonable

## Production Recommendations

1. **Environment Variables**
   - Move JWT keys to environment variables
   - Use Azure Key Vault or similar for secrets

2. **Rate Limiting**
   - Implement server-side rate limiting middleware
   - Consider using Redis for distributed rate limiting

3. **Logging & Monitoring**
   - Log all authentication attempts
   - Monitor for suspicious patterns
   - Set up alerts for security events

4. **Database**
   - Use encrypted connections
   - Regular backups
   - Principle of least privilege for DB user

5. **CORS**
   - Update CORS policy for production domain
   - Remove localhost from allowed origins

6. **Security Scanning**
   - Regular dependency vulnerability scans
   - Consider OWASP ZAP or similar tools
   - Penetration testing before production

## Testing Security

### Manual Testing
```bash
# Test SQL injection attempts
curl -X POST http://localhost:5152/api/Auth/Login \
  -H "Content-Type: application/json" \
  -d '{"userMail": "admin@test.com", "password": "' OR '1'='1"}'

# Should return 400 or 401, never succeed
```

### Automated Testing
- Unit tests for validation logic
- Integration tests for authorization
- Security scanning in CI/CD pipeline
