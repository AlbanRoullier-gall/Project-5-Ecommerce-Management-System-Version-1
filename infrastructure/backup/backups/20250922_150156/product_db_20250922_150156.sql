--
-- PostgreSQL database dump
--

\restrict uypktHbN7faLoX7MldwYxeHkdkcyWihHIhNbrW4cSO8f5cyKuvttNNnqaPOlNqI

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
-- Name: categories; Type: TABLE; Schema: public; Owner: product_user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO product_user;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: product_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO product_user;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: product_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: product_image_variants; Type: TABLE; Schema: public; Owner: product_user
--

CREATE TABLE public.product_image_variants (
    id integer NOT NULL,
    image_id integer,
    variant_type character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    width integer,
    height integer,
    file_size integer,
    quality integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.product_image_variants OWNER TO product_user;

--
-- Name: product_image_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: product_user
--

CREATE SEQUENCE public.product_image_variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_image_variants_id_seq OWNER TO product_user;

--
-- Name: product_image_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: product_user
--

ALTER SEQUENCE public.product_image_variants_id_seq OWNED BY public.product_image_variants.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: product_user
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer,
    filename character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(50) NOT NULL,
    width integer,
    height integer,
    alt_text character varying(255),
    description text,
    is_active boolean DEFAULT true,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.product_images OWNER TO product_user;

--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: product_user
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_images_id_seq OWNER TO product_user;

--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: product_user
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: product_user
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    vat_rate numeric(5,2) DEFAULT 20.00 NOT NULL,
    category_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO product_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: product_user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO product_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: product_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: product_image_variants id; Type: DEFAULT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_image_variants ALTER COLUMN id SET DEFAULT nextval('public.product_image_variants_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: product_user
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
1	Électronique	Appareils électroniques et gadgets	2025-09-18 17:14:08.893156	2025-09-18 17:14:08.893156
2	Vêtements	Mode et accessoires	2025-09-18 17:14:08.893156	2025-09-18 17:14:08.893156
3	Maison & Jardin	Décoration et aménagement	2025-09-18 17:14:08.893156	2025-09-18 17:14:08.893156
4	Sports & Loisirs	Équipements sportifs et loisirs	2025-09-18 17:14:08.893156	2025-09-18 17:14:08.893156
5	Livres	Livres et publications	2025-09-18 17:14:08.893156	2025-09-18 17:14:08.893156
6	Électronique	Appareils électroniques et gadgets	2025-09-20 09:16:54.438997	2025-09-20 09:16:54.438997
7	Vêtements	Mode et accessoires	2025-09-20 09:16:54.438997	2025-09-20 09:16:54.438997
8	Maison & Jardin	Décoration et aménagement	2025-09-20 09:16:54.438997	2025-09-20 09:16:54.438997
9	Sports & Loisirs	Équipements sportifs et loisirs	2025-09-20 09:16:54.438997	2025-09-20 09:16:54.438997
10	Livres	Livres et publications	2025-09-20 09:16:54.438997	2025-09-20 09:16:54.438997
\.


--
-- Data for Name: product_image_variants; Type: TABLE DATA; Schema: public; Owner: product_user
--

COPY public.product_image_variants (id, image_id, variant_type, file_path, width, height, file_size, quality, created_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: product_user
--

COPY public.product_images (id, product_id, filename, file_path, file_size, mime_type, width, height, alt_text, description, is_active, order_index, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: product_user
--

COPY public.products (id, name, description, price, vat_rate, category_id, is_active, created_at, updated_at) FROM stdin;
1	Savon	Savon haute qualité	30.00	20.01	3	t	2025-09-20 09:31:10.472705	2025-09-20 09:31:10.472705
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: product_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 10, true);


--
-- Name: product_image_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: product_user
--

SELECT pg_catalog.setval('public.product_image_variants_id_seq', 1, false);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: product_user
--

SELECT pg_catalog.setval('public.product_images_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: product_user
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: product_image_variants product_image_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_image_variants
    ADD CONSTRAINT product_image_variants_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: idx_product_image_variants_image_id; Type: INDEX; Schema: public; Owner: product_user
--

CREATE INDEX idx_product_image_variants_image_id ON public.product_image_variants USING btree (image_id);


--
-- Name: idx_product_images_active; Type: INDEX; Schema: public; Owner: product_user
--

CREATE INDEX idx_product_images_active ON public.product_images USING btree (is_active);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: product_user
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: product_user
--

CREATE INDEX idx_products_active ON public.products USING btree (is_active);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: product_user
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: product_image_variants product_image_variants_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_image_variants
    ADD CONSTRAINT product_image_variants_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.product_images(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: product_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict uypktHbN7faLoX7MldwYxeHkdkcyWihHIhNbrW4cSO8f5cyKuvttNNnqaPOlNqI

