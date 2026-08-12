create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
select cron.schedule('dayflow-process-notifications','*/5 * * * *',$$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='project_url')||'/functions/v1/process-notifications',headers:=jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'Content-Type','application/json'),body:='{}'::jsonb);$$);
