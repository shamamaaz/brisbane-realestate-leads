# brisbane-realestate-leads

## Environment switching (local vs production)

### Local development (Postgres on your machine)
```bash
cd backend
NODE_ENV=local npm run start:dev
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
    NODE_ENV=production pm2 restart lead-exchange-api --update-env
```

### Production frontend (S3)
```bash
cd frontend
npm install
ng build --configuration production
aws s3 sync dist/frontend s3://lead-exchange-frontend --delete
```

### Notes
- Edit `backend/.env.local` for local DB credentials.
- Edit `backend/.env.production` for your RDS credentials.
- Set `GEOAPIFY_API_KEY` in both env files for address lookup.

## Production deployment (step by step)

### 1) Backend on EC2 (Amazon Linux)
```bash
# SSH into EC2
ssh -i ~/Downloads/LeadExchange.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Install Node + PM2 (once)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
sudo npm install -g pm2

# Clone and install
git clone YOUR_REPO_URL
cd brisbane-realestate-leads/backend
npm install

# Configure env for RDS
# edit backend/.env.production and set DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE

# Build and start
npm run build
NODE_ENV=production pm2 start dist/main.js --name lead-exchange-api
pm2 save
```

### 2) Frontend on S3
```bash
cd frontend
npm install
npm run build

# Upload to S3 (replace bucket name)
aws s3 sync dist/lead-exchange-frontend s3://YOUR_BUCKET_NAME --delete
```

### 3) Update frontend API URL
Edit `frontend/src/environments/environment.prod.ts` and set:
```
apiUrl: "http://YOUR_EC2_PUBLIC_IP:3000"
```

Rebuild and re-upload to S3 after changes:
```bash
cd frontend
npm run build
aws s3 sync dist/lead-exchange-frontend s3://YOUR_BUCKET_NAME --delete
```

### 4) RDS security group
Allow EC2 to access RDS on port 5432:
- Add inbound rule to RDS security group:
  - Type: PostgreSQL
  - Port: 5432
  - Source: your EC2 security group OR EC2 private IP /32



ssh -i ~/Downloads/LeadExchange.pem ec2-user@16.176.136.194
    cd ~/brisbane-realestate-leads/backend
npm install
npm run build
NODE_ENV=production pm2 restart lead-exchange-api --update-env


ssh -i ~/Downloads/LeadExchange.pem ec2-user@16.176.136.194

pm2 list
pm2 show lead-exchange-api

pwd
ls -la
ls -la ~/brisbane-realestate-leads/backend/dist

# confirm the route exists in compiled JS
rg "AddressController" ~/brisbane-realestate-leads/backend/dist -n
rg "api/address" ~/brisbane-realestate-leads/backend/dist -n

# test locally on EC2
curl -i "http://localhost:3000/api/address/search?q=moorooka"
