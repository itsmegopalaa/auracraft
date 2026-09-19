-- Allow customers to delete their own private custom-cover preview assets.
drop policy if exists
  "Customers can delete own custom cover previews"
  on storage.objects;

create policy
  "Customers can delete own custom cover previews"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'custom-cover-previews'
  and (storage.foldername(name))[1] = auth.uid()::text
);
