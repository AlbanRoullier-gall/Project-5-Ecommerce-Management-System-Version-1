--
-- PostgreSQL database dump
--

\restrict nqb5Y0rVVtzXU7doqtEsN83VoY2GG6bto9E18UnLzCJKwYAu4C13sFmCSpmXquK

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
-- Name: credit_note_items; Type: TABLE; Schema: public; Owner: order_user
--

CREATE TABLE public.credit_note_items (
    id integer NOT NULL,
    credit_note_id integer,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price_ht numeric(10,2) NOT NULL,
    unit_price_ttc numeric(10,2) NOT NULL,
    vat_rate numeric(5,2) NOT NULL,
    total_price_ht numeric(10,2) NOT NULL,
    total_price_ttc numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.credit_note_items OWNER TO order_user;

--
-- Name: credit_note_items_id_seq; Type: SEQUENCE; Schema: public; Owner: order_user
--

CREATE SEQUENCE public.credit_note_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.credit_note_items_id_seq OWNER TO order_user;

--
-- Name: credit_note_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: order_user
--

ALTER SEQUENCE public.credit_note_items_id_seq OWNED BY public.credit_note_items.id;


--
-- Name: credit_notes; Type: TABLE; Schema: public; Owner: order_user
--

CREATE TABLE public.credit_notes (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    order_id integer,
    total_amount_ht numeric(10,2) NOT NULL,
    total_amount_ttc numeric(10,2) NOT NULL,
    reason text NOT NULL,
    description text,
    issue_date date NOT NULL,
    payment_method character varying(50) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.credit_notes OWNER TO order_user;

--
-- Name: credit_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: order_user
--

CREATE SEQUENCE public.credit_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.credit_notes_id_seq OWNER TO order_user;

--
-- Name: credit_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: order_user
--

ALTER SEQUENCE public.credit_notes_id_seq OWNED BY public.credit_notes.id;


--
-- Name: order_addresses; Type: TABLE; Schema: public; Owner: order_user
--

CREATE TABLE public.order_addresses (
    id integer NOT NULL,
    order_id integer,
    type character varying(20) NOT NULL,
    address_snapshot jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT order_addresses_type_check CHECK (((type)::text = ANY ((ARRAY['shipping'::character varying, 'billing'::character varying])::text[])))
);


ALTER TABLE public.order_addresses OWNER TO order_user;

--
-- Name: order_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: order_user
--

CREATE SEQUENCE public.order_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_addresses_id_seq OWNER TO order_user;

--
-- Name: order_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: order_user
--

ALTER SEQUENCE public.order_addresses_id_seq OWNED BY public.order_addresses.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: order_user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price_ht numeric(10,2) NOT NULL,
    unit_price_ttc numeric(10,2) NOT NULL,
    vat_rate numeric(5,2) NOT NULL,
    total_price_ht numeric(10,2) NOT NULL,
    total_price_ttc numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.order_items OWNER TO order_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: order_user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO order_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: order_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: order_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    customer_snapshot jsonb NOT NULL,
    total_amount_ht numeric(10,2) NOT NULL,
    total_amount_ttc numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO order_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: order_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO order_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: order_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: credit_note_items id; Type: DEFAULT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_note_items ALTER COLUMN id SET DEFAULT nextval('public.credit_note_items_id_seq'::regclass);


--
-- Name: credit_notes id; Type: DEFAULT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_notes ALTER COLUMN id SET DEFAULT nextval('public.credit_notes_id_seq'::regclass);


--
-- Name: order_addresses id; Type: DEFAULT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_addresses ALTER COLUMN id SET DEFAULT nextval('public.order_addresses_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Data for Name: credit_note_items; Type: TABLE DATA; Schema: public; Owner: order_user
--

COPY public.credit_note_items (id, credit_note_id, product_id, quantity, unit_price_ht, unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: public; Owner: order_user
--

COPY public.credit_notes (id, customer_id, order_id, total_amount_ht, total_amount_ttc, reason, description, issue_date, payment_method, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_addresses; Type: TABLE DATA; Schema: public; Owner: order_user
--

COPY public.order_addresses (id, order_id, type, address_snapshot, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: order_user
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price_ht, unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: order_user
--

COPY public.orders (id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, payment_method, notes, created_at, updated_at) FROM stdin;
\.


--
-- Name: credit_note_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: order_user
--

SELECT pg_catalog.setval('public.credit_note_items_id_seq', 1, false);


--
-- Name: credit_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: order_user
--

SELECT pg_catalog.setval('public.credit_notes_id_seq', 1, false);


--
-- Name: order_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: order_user
--

SELECT pg_catalog.setval('public.order_addresses_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: order_user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: order_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: credit_note_items credit_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_note_items
    ADD CONSTRAINT credit_note_items_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: order_addresses order_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_addresses
    ADD CONSTRAINT order_addresses_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: idx_credit_note_items_credit_note_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_credit_note_items_credit_note_id ON public.credit_note_items USING btree (credit_note_id);


--
-- Name: idx_credit_notes_customer_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_credit_notes_customer_id ON public.credit_notes USING btree (customer_id);


--
-- Name: idx_credit_notes_order_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_credit_notes_order_id ON public.credit_notes USING btree (order_id);


--
-- Name: idx_order_addresses_order_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_order_addresses_order_id ON public.order_addresses USING btree (order_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: order_user
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- Name: credit_note_items credit_note_items_credit_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_note_items
    ADD CONSTRAINT credit_note_items_credit_note_id_fkey FOREIGN KEY (credit_note_id) REFERENCES public.credit_notes(id) ON DELETE CASCADE;


--
-- Name: credit_notes credit_notes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_addresses order_addresses_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_addresses
    ADD CONSTRAINT order_addresses_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: order_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict nqb5Y0rVVtzXU7doqtEsN83VoY2GG6bto9E18UnLzCJKwYAu4C13sFmCSpmXquK

