create table if not exists public.school_classes(id text primary key,name text not null,grade text not null);
insert into public.school_classes(id,name,grade) values
('101','دهم ریاضی ۱','دهم'),
('102','دهم ریاضی ۲','دهم'),
('103','دهم تجربی ۱','دهم'),
('104','دهم تجربی ۲','دهم'),
('105','دهم تجربی ۳','دهم'),
('106','دهم تجربی ۴','دهم'),
('107','دهم ادبیات','دهم'),
('111','یازدهم ریاضی ۱','یازدهم'),
('112','یازدهم ریاضی ۲','یازدهم'),
('113','یازدهم تجربی ۱','یازدهم'),
('114','یازدهم تجربی ۲','یازدهم'),
('115','یازدهم تجربی ۳','یازدهم'),
('116','یازدهم تجربی ۴','یازدهم'),
('117','یازدهم ادبیات','یازدهم'),
('121','دوازدهم ریاضی ۱','دوازدهم'),
('122','دوازدهم ریاضی ۲','دوازدهم'),
('123','دوازدهم تجربی ۱','دوازدهم'),
('124','دوازدهم تجربی ۲','دوازدهم'),
('125','دوازدهم تجربی ۳','دوازدهم'),
('126','دوازدهم ادبیات','دوازدهم')
on conflict(id) do update set name=excluded.name,grade=excluded.grade;
create table if not exists public.app_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.exams(
 id bigint generated always as identity primary key,
 class_id text not null references public.school_classes(id),
 exam_date date not null, subject text not null check(length(trim(subject))>0),
 exam_time time not null, description text,
 created_at timestamptz not null default now(),
 constraint one_exam_per_class_per_day unique(class_id,exam_date)
);
alter table public.school_classes enable row level security;
alter table public.app_admins enable row level security;
alter table public.exams enable row level security;
create policy "public reads classes" on public.school_classes for select using(true);
create policy "public reads exams" on public.exams for select using(true);
create policy "admin reads own row" on public.app_admins for select to authenticated using(user_id=auth.uid());
create policy "admins insert exams" on public.exams for insert to authenticated with check(exists(select 1 from public.app_admins where user_id=auth.uid()));
create policy "admins update exams" on public.exams for update to authenticated using(exists(select 1 from public.app_admins where user_id=auth.uid())) with check(exists(select 1 from public.app_admins where user_id=auth.uid()));
create policy "admins delete exams" on public.exams for delete to authenticated using(exists(select 1 from public.app_admins where user_id=auth.uid()));
grant select on public.school_classes,public.exams to anon,authenticated;
grant select on public.app_admins to authenticated;
grant insert,update,delete on public.exams to authenticated;
grant usage,select on sequence public.exams_id_seq to authenticated;
-- پس از ساخت کاربر مسئول در Authentication، UUID او را اینجا قرار دهید:
-- insert into public.app_admins(user_id) values ('UUID-USER');
