import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createNotificationHandler } from './handler.js'
const env={CRON_SECRET:Deno.env.get('CRON_SECRET')??'',ONESIGNAL_APP_ID:Deno.env.get('ONESIGNAL_APP_ID')??'',ONESIGNAL_REST_API_KEY:Deno.env.get('ONESIGNAL_REST_API_KEY')??''}
const db=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'')
const repository={async candidates(){const{data}=await db.from('notification_deliveries').select('id,user_id,category,source_id,idempotency_key').eq('status','pending').limit(100);return(data??[]).map(row=>({...row,userId:row.user_id,title:'DayFlow',body:'You have a timely update waiting.',url:'/day',idempotencyKey:row.idempotency_key}))},async markSent(c,id){await db.from('notification_deliveries').update({status:'sent',onesignal_message_id:id,sent_at:new Date().toISOString()}).eq('id',c.id)},async markFailed(c,error){await db.from('notification_deliveries').update({status:'failed',last_error:error,attempted_at:new Date().toISOString()}).eq('id',c.id)}}
Deno.serve(createNotificationHandler({env,repository}))
