insert into public.storage_orphan_reviews(bucket,path,media_asset_id)
select o.bucket_id,o.name,null from storage.objects o
where o.bucket_id='public-media' and not exists(select 1 from public.media_assets m where m.bucket=o.bucket_id and m.path=o.name)
on conflict(bucket,path) do nothing;
