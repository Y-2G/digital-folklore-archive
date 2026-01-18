# Task Completion Checklist

## Before Implementation
1. Check for existing design documents under `docs/design/`
2. If design document exists, follow it precisely
3. If no design document exists, create one first
4. Create or update work plan with checklist format
5. Reference `docs/tasks/tasks-001.md` for master task list

## During Implementation
1. Follow TypeScript strict mode requirements
2. Use path alias `@/*` for imports from `src/`
3. Add comprehensive type definitions
4. Implement error handling
5. Add comments for complex logic

## After Implementation
1. Run `yarn lint` to check for ESLint errors
2. Verify TypeScript compilation passes (`yarn build` or check in editor)
3. Test locally if applicable
4. Update relevant documentation
5. Mark completed items in task checklists (`docs/tasks/tasks-001.md`)
6. Commit changes with descriptive message

## Testing Commands
```bash
yarn lint          # Check for linting errors
yarn build         # Verify TypeScript compilation
yarn dev           # Test in development mode
```

## Security Checklist
- Never commit credentials or API keys
- Use environment variables for sensitive data
- Verify `.env.local` is in `.gitignore`
- Document security considerations