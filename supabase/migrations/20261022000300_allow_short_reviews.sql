begin;

alter table public.reviews drop constraint reviews_body_check;
alter table public.reviews add constraint reviews_body_check
    check (char_length(btrim(body)) between 1 and 2000);

commit;
