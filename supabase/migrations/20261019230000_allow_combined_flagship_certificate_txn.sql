-- Shortlisted hackathon members may buy the Flagship Pass and the certificate in one
-- Easebuzz payment (Rs 598), so one transaction ID can appear in both tables. This is
-- allowed only when the pass is flagship_offline and both rows belong to the same email;
-- every other reuse across the two tables is still rejected. Mirrors isCombinedFlagshipTxn
-- in lib/payments.ts.

CREATE OR REPLACE FUNCTION public.reject_cross_claimed_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'festival_pass_claims' THEN
    IF EXISTS (
      SELECT 1 FROM public.certificate_payment_submissions c
      WHERE upper(c.transaction_reference) = upper(NEW.transaction_reference)
        AND NOT (
          NEW.pass_tier = 'flagship_offline'
          AND lower(trim(c.user_email)) = lower(trim(NEW.user_email))
        )
    ) THEN
      RAISE EXCEPTION 'transaction_reference already claimed for a certificate'
        USING ERRCODE = '23505';
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.festival_pass_claims p
      WHERE upper(p.transaction_reference) = upper(NEW.transaction_reference)
        AND NOT (
          p.pass_tier = 'flagship_offline'
          AND lower(trim(p.user_email)) = lower(trim(NEW.user_email))
        )
    ) THEN
      RAISE EXCEPTION 'transaction_reference already claimed for an offline pass'
        USING ERRCODE = '23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
