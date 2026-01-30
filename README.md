# brisbane-realestate-leads

## Environment switching (local vs production)

Use these commands to switch backend env files quickly.

### Local development (Postgres on your machine)
```bash
cd backend
npm run env:local
npm run start:dev
```

### Local frontend
```bash
cd frontend
npm install
npm run start
```

### Production (EC2 + RDS)
```bash
cd backend
npm run env:prod
pm2 restart lead-exchange-api --update-env
```

### Production frontend (S3)
```bash
cd frontend
npm install
ng build --configuration production
```

### Notes
- Edit `backend/.env.local` for local DB credentials.
- Edit `backend/.env.production` for your RDS credentials.
