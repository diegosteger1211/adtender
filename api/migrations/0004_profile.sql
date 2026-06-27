-- User profile fields
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;

-- Tenant/organisation profile fields
ALTER TABLE tenants ADD COLUMN address TEXT;
ALTER TABLE tenants ADD COLUMN city TEXT;
ALTER TABLE tenants ADD COLUMN postal_code TEXT;
ALTER TABLE tenants ADD COLUMN country TEXT;
ALTER TABLE tenants ADD COLUMN org_phone TEXT;
ALTER TABLE tenants ADD COLUMN org_email TEXT;
