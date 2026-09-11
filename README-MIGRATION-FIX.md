# Migration fix

The migration `20260911230000_assign_staff_to_government_office` was corrected so it only performs the schema change and no longer depends on demo staff data existing before the seed runs.

After replacing the project:

```powershell
cd server
npm install
npx prisma generate
npx prisma migrate reset
npx prisma migrate status
npx prisma db seed
npm run dev
```

The reset is destructive and is intended for the local prototype database.
