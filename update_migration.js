const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/20260930000000_create_certificate_and_payments.sql', 'utf-8');

content = content.replace(
  /DROP POLICY IF EXISTS "Allow anon read certificate_orders"[\s\S]*?USING \(true\)\s*WITH CHECK \(true\);/,
  `-- Secure certificate_orders: only accessible via Service Role (API routes)
DROP POLICY IF EXISTS "Allow anon read certificate_orders" ON public.certificate_orders;
DROP POLICY IF EXISTS "Allow anon write certificate_orders" ON public.certificate_orders;`
);

content = content.replace(
  /DROP POLICY IF EXISTS "Allow anon write issued_certificates"[\s\S]*?WITH CHECK \(true\);/,
  `-- Secure issued_certificates: only writable via Service Role, but readable publicly for verification
DROP POLICY IF EXISTS "Allow anon write issued_certificates" ON public.issued_certificates;`
);

fs.writeFileSync('supabase/migrations/20260930000000_create_certificate_and_payments.sql', content);
