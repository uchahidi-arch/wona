-- WONA — SONELEC Dashboard
-- Schema Supabase

create table sites (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  slug text unique not null,
  localisation text,
  actif boolean default true,
  created_at timestamptz default now()
);

create table groupes (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  nom text not null,
  etat text default 'STOPPED' check (etat in ('RUNNING', 'STOPPED', 'ALARM')),
  puissance_installee numeric default 0,
  created_at timestamptz default now()
);

create table releves (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid references groupes(id) on delete cascade,
  timestamp timestamptz default now(),
  -- Electrique
  tension_l1 numeric, tension_l2 numeric, tension_l3 numeric,
  courant_l1 numeric, courant_l2 numeric, courant_l3 numeric,
  frequence numeric,
  puissance_active numeric,
  puissance_reactive numeric,
  puissance_apparente numeric,
  facteur_puissance numeric,
  -- Mecanique
  temp_eau numeric,
  pression_huile numeric,
  niveau_gazoil numeric,
  heures_marche numeric,
  vitesse_rotation numeric,
  batterie_v numeric,
  created_at timestamptz default now()
);

create table seuils (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid references groupes(id) on delete cascade,
  parametre text not null,
  min_normal numeric,
  max_normal numeric,
  min_critique numeric,
  max_critique numeric
);

create table alertes (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid references groupes(id) on delete cascade,
  parametre text not null,
  valeur numeric,
  seuil numeric,
  niveau text check (niveau in ('attention', 'critique')),
  acquittee boolean default false,
  timestamp timestamptz default now()
);

create table utilisateurs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text unique,
  role text default 'agent' check (role in ('agent', 'superviseur', 'admin')),
  created_at timestamptz default now()
);

-- Données de test
insert into sites (nom, slug, localisation) values
  ('Voidjou', 'voidjou', 'Ngazidja Nord'),
  ('Itsambouni', 'itsambouni', 'Ngazidja Centre'),
  ('Fomboni', 'fomboni', 'Mwali'),
  ('Trenani', 'trenani', 'Ngazidja Sud');

-- Groupes Voidjou
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT1', 'RUNNING', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT2', 'RUNNING', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT3', 'STOPPED', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT4', 'ALARM', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT5', 'RUNNING', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT6', 'RUNNING', 2000 from sites where slug = 'voidjou';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-VT7', 'STOPPED', 2000 from sites where slug = 'voidjou';

-- Groupes autres sites
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-IT1', 'RUNNING', 1500 from sites where slug = 'itsambouni';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-IT2', 'ALARM', 1500 from sites where slug = 'itsambouni';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-FB1', 'RUNNING', 1000 from sites where slug = 'fomboni';
insert into groupes (site_id, nom, etat, puissance_installee)
select id, '25-TR1', 'STOPPED', 800 from sites where slug = 'trenani';
