-- PostgreSQL starter schema. Apply with your migration tool in production.
create type user_role as enum ('USER', 'MODERATOR', 'ADMIN');
create table users (id uuid primary key, username text unique not null, email text unique not null, password_hash text not null, role user_role not null default 'USER', avatar_url text, created_at timestamptz not null default now());
create table sessions (id uuid primary key, user_id uuid not null references users(id) on delete cascade, token_hash text unique not null, expires_at timestamptz not null, created_at timestamptz not null default now());
create table profiles (user_id uuid primary key references users(id) on delete cascade, status text, favorite_games jsonb not null default '[]', updated_at timestamptz not null default now());
create table settings (user_id uuid primary key references users(id) on delete cascade, theme text not null default 'system', wallpaper_id text, dock_position text not null default 'bottom', transparency numeric not null default .8, updated_at timestamptz not null default now());
create table friends (user_id uuid references users(id) on delete cascade, friend_id uuid references users(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, friend_id));
create table friend_requests (id uuid primary key, sender_id uuid not null references users(id), recipient_id uuid not null references users(id), created_at timestamptz not null default now());
create table messages (id uuid primary key, sender_id uuid not null references users(id), recipient_id uuid references users(id), channel text, body text not null, created_at timestamptz not null default now());
create table notifications (id uuid primary key, user_id uuid not null references users(id), type text not null, payload jsonb not null default '{}', read_at timestamptz, created_at timestamptz not null default now());
create table games (id text primary key, name text not null, registry jsonb not null, enabled boolean not null default true);
create table favorites (user_id uuid references users(id) on delete cascade, game_id text references games(id), created_at timestamptz not null default now(), primary key(user_id, game_id));
create table recent_games (user_id uuid references users(id) on delete cascade, game_id text references games(id), played_at timestamptz not null default now(), primary key(user_id, game_id));
create table downloads (id uuid primary key, user_id uuid not null references users(id), game_id text references games(id), state text not null, bytes_total bigint, bytes_done bigint not null default 0, created_at timestamptz not null default now());
create table wallpapers (id uuid primary key, user_id uuid references users(id), name text not null, object_key text not null, visibility text not null default 'private', created_at timestamptz not null default now());
create table themes (id uuid primary key, user_id uuid references users(id), name text not null, definition jsonb not null, visibility text not null default 'private', created_at timestamptz not null default now());
create table community_posts (id uuid primary key, user_id uuid not null references users(id), type text not null, payload jsonb not null, created_at timestamptz not null default now());
create table reports (id uuid primary key, reporter_id uuid not null references users(id), target_type text not null, target_id text not null, reason text not null, status text not null default 'open', created_at timestamptz not null default now());
create table bans (id uuid primary key, user_id uuid not null references users(id), moderator_id uuid not null references users(id), reason text not null, expires_at timestamptz, created_at timestamptz not null default now());
