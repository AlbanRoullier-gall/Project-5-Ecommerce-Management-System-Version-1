--
-- PostgreSQL database dump
--

\restrict F5qlhrPwYW22ug0QwhavNfQZo1DOqYh7T9gJNVfkP3jxWVpPZMLEE4XKxUIcZjr

-- Dumped from database version 15.14 (Debian 15.14-1.pgdg13+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: civilities; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.civilities (
    civility_id integer NOT NULL,
    abbreviation character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.civilities OWNER TO customer_user;

--
-- Name: civilities_civility_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.civilities_civility_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.civilities_civility_id_seq OWNER TO customer_user;

--
-- Name: civilities_civility_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.civilities_civility_id_seq OWNED BY public.civilities.civility_id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.countries (
    country_id integer NOT NULL,
    country_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.countries OWNER TO customer_user;

--
-- Name: countries_country_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.countries_country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.countries_country_id_seq OWNER TO customer_user;

--
-- Name: countries_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.countries_country_id_seq OWNED BY public.countries.country_id;


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.customer_addresses (
    address_id integer NOT NULL,
    customer_id integer,
    address_type character varying(50) NOT NULL,
    address text NOT NULL,
    postal_code character varying(10) NOT NULL,
    city character varying(100) NOT NULL,
    country_id integer,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT customer_addresses_address_type_check CHECK (((address_type)::text = ANY ((ARRAY['shipping'::character varying, 'billing'::character varying])::text[])))
);


ALTER TABLE public.customer_addresses OWNER TO customer_user;

--
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.customer_addresses_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_addresses_address_id_seq OWNER TO customer_user;

--
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.customer_addresses_address_id_seq OWNED BY public.customer_addresses.address_id;


--
-- Name: customer_companies; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.customer_companies (
    company_id integer NOT NULL,
    customer_id integer,
    company_name character varying(255) NOT NULL,
    siret_number character varying(20),
    vat_number character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customer_companies OWNER TO customer_user;

--
-- Name: customer_companies_company_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.customer_companies_company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customer_companies_company_id_seq OWNER TO customer_user;

--
-- Name: customer_companies_company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.customer_companies_company_id_seq OWNED BY public.customer_companies.company_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.customers (
    customer_id integer NOT NULL,
    civility_id integer,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    socio_professional_category_id integer,
    phone_number character varying(20),
    birthday date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO customer_user;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.customers_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_customer_id_seq OWNER TO customer_user;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: socio_professional_categories; Type: TABLE; Schema: public; Owner: customer_user
--

CREATE TABLE public.socio_professional_categories (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.socio_professional_categories OWNER TO customer_user;

--
-- Name: socio_professional_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: customer_user
--

CREATE SEQUENCE public.socio_professional_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.socio_professional_categories_category_id_seq OWNER TO customer_user;

--
-- Name: socio_professional_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: customer_user
--

ALTER SEQUENCE public.socio_professional_categories_category_id_seq OWNED BY public.socio_professional_categories.category_id;


--
-- Name: civilities civility_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.civilities ALTER COLUMN civility_id SET DEFAULT nextval('public.civilities_civility_id_seq'::regclass);


--
-- Name: countries country_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.countries ALTER COLUMN country_id SET DEFAULT nextval('public.countries_country_id_seq'::regclass);


--
-- Name: customer_addresses address_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.customer_addresses_address_id_seq'::regclass);


--
-- Name: customer_companies company_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_companies ALTER COLUMN company_id SET DEFAULT nextval('public.customer_companies_company_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: socio_professional_categories category_id; Type: DEFAULT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.socio_professional_categories ALTER COLUMN category_id SET DEFAULT nextval('public.socio_professional_categories_category_id_seq'::regclass);


--
-- Data for Name: civilities; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.civilities (civility_id, abbreviation, created_at) FROM stdin;
1	Mr	2025-09-18 17:15:07.833759
2	Mme	2025-09-18 17:15:07.833759
3	Mlle	2025-09-18 17:15:07.833759
4	Dr	2025-09-18 17:15:07.833759
5	Prof	2025-09-18 17:15:07.833759
6	Mr	2025-09-20 09:16:52.825391
7	Mme	2025-09-20 09:16:52.825391
8	Mlle	2025-09-20 09:16:52.825391
9	Dr	2025-09-20 09:16:52.825391
10	Prof	2025-09-20 09:16:52.825391
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.countries (country_id, country_name, created_at) FROM stdin;
1	France	2025-09-18 17:15:07.83971
2	Belgique	2025-09-18 17:15:07.83971
3	Suisse	2025-09-18 17:15:07.83971
4	Canada	2025-09-18 17:15:07.83971
5	États-Unis	2025-09-18 17:15:07.83971
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.customer_addresses (address_id, customer_id, address_type, address, postal_code, city, country_id, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_companies; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.customer_companies (company_id, customer_id, company_name, siret_number, vat_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.customers (customer_id, civility_id, first_name, last_name, email, password_hash, socio_professional_category_id, phone_number, birthday, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: socio_professional_categories; Type: TABLE DATA; Schema: public; Owner: customer_user
--

COPY public.socio_professional_categories (category_id, category_name, created_at) FROM stdin;
1	Employé	2025-09-18 17:15:07.842682
2	Cadre	2025-09-18 17:15:07.842682
3	Dirigeant	2025-09-18 17:15:07.842682
4	Artisan	2025-09-18 17:15:07.842682
5	Commerçant	2025-09-18 17:15:07.842682
6	Profession libérale	2025-09-18 17:15:07.842682
7	Retraité	2025-09-18 17:15:07.842682
8	Étudiant	2025-09-18 17:15:07.842682
9	Sans emploi	2025-09-18 17:15:07.842682
\.


--
-- Name: civilities_civility_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.civilities_civility_id_seq', 10, true);


--
-- Name: countries_country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.countries_country_id_seq', 10, true);


--
-- Name: customer_addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.customer_addresses_address_id_seq', 1, false);


--
-- Name: customer_companies_company_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.customer_companies_company_id_seq', 1, false);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.customers_customer_id_seq', 1, false);


--
-- Name: socio_professional_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: customer_user
--

SELECT pg_catalog.setval('public.socio_professional_categories_category_id_seq', 18, true);


--
-- Name: civilities civilities_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.civilities
    ADD CONSTRAINT civilities_pkey PRIMARY KEY (civility_id);


--
-- Name: countries countries_country_name_key; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_country_name_key UNIQUE (country_name);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (country_id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (address_id);


--
-- Name: customer_companies customer_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_companies
    ADD CONSTRAINT customer_companies_pkey PRIMARY KEY (company_id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: socio_professional_categories socio_professional_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.socio_professional_categories
    ADD CONSTRAINT socio_professional_categories_category_name_key UNIQUE (category_name);


--
-- Name: socio_professional_categories socio_professional_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.socio_professional_categories
    ADD CONSTRAINT socio_professional_categories_pkey PRIMARY KEY (category_id);


--
-- Name: idx_customer_addresses_customer_id; Type: INDEX; Schema: public; Owner: customer_user
--

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);


--
-- Name: idx_customer_companies_customer_id; Type: INDEX; Schema: public; Owner: customer_user
--

CREATE INDEX idx_customer_companies_customer_id ON public.customer_companies USING btree (customer_id);


--
-- Name: idx_customers_active; Type: INDEX; Schema: public; Owner: customer_user
--

CREATE INDEX idx_customers_active ON public.customers USING btree (is_active);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: customer_user
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: customer_addresses customer_addresses_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(country_id);


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: customer_companies customer_companies_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customer_companies
    ADD CONSTRAINT customer_companies_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: customers customers_civility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_civility_id_fkey FOREIGN KEY (civility_id) REFERENCES public.civilities(civility_id);


--
-- Name: customers customers_socio_professional_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: customer_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_socio_professional_category_id_fkey FOREIGN KEY (socio_professional_category_id) REFERENCES public.socio_professional_categories(category_id);


--
-- PostgreSQL database dump complete
--

\unrestrict F5qlhrPwYW22ug0QwhavNfQZo1DOqYh7T9gJNVfkP3jxWVpPZMLEE4XKxUIcZjr

