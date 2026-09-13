-- Jalankan seluruh isi file ini di Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Ini membuat satu tabel penyimpanan sederhana (key/value) yang menggantikan
-- window.storage bawaan Claude.ai, plus aturan akses supaya hanya orang yang
-- sudah login yang bisa baca/tulis datanya.

create table if not exists kv_store (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table kv_store enable row level security;

-- Hapus dulu kalau sudah pernah dibuat, biar bisa dijalankan ulang tanpa error.
drop policy if exists "authenticated can read kv_store" on kv_store;
drop policy if exists "authenticated can insert kv_store" on kv_store;
drop policy if exists "authenticated can update kv_store" on kv_store;
drop policy if exists "authenticated can delete kv_store" on kv_store;

create policy "authenticated can read kv_store"
  on kv_store for select
  to authenticated
  using (true);

create policy "authenticated can insert kv_store"
  on kv_store for insert
  to authenticated
  with check (true);

create policy "authenticated can update kv_store"
  on kv_store for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete kv_store"
  on kv_store for delete
  to authenticated
  using (true);

-- Aktifkan update real-time: supaya semua orang yang sedang membuka cluster
-- yang sama langsung tahu begitu ada perubahan disimpan orang lain.
-- Dibungkus pengecekan supaya aman dijalankan ulang tanpa error.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kv_store'
  ) then
    alter publication supabase_realtime add table kv_store;
  end if;
end $$;
