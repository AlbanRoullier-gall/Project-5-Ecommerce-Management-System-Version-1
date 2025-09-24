--
-- PostgreSQL database dump
--

\restrict 2buUMbQGIzmrZF54dzQYbqUfzDoygemZOGNF5C8AyPbRDKqtx5Ub1lGoX0oFVqN

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
-- Name: website_page_versions; Type: TABLE; Schema: public; Owner: content_user
--

CREATE TABLE public.website_page_versions (
    version_id integer NOT NULL,
    parent_page_id integer,
    markdown_content text NOT NULL,
    html_content text NOT NULL,
    version integer NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT now()
);


ALTER TABLE public.website_page_versions OWNER TO content_user;

--
-- Name: website_page_versions_version_id_seq; Type: SEQUENCE; Schema: public; Owner: content_user
--

CREATE SEQUENCE public.website_page_versions_version_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.website_page_versions_version_id_seq OWNER TO content_user;

--
-- Name: website_page_versions_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: content_user
--

ALTER SEQUENCE public.website_page_versions_version_id_seq OWNED BY public.website_page_versions.version_id;


--
-- Name: website_pages; Type: TABLE; Schema: public; Owner: content_user
--

CREATE TABLE public.website_pages (
    page_id integer NOT NULL,
    page_slug character varying(100) NOT NULL,
    page_title character varying(255) NOT NULL,
    markdown_content text NOT NULL,
    html_content text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    creation_timestamp timestamp without time zone DEFAULT now(),
    last_update_timestamp timestamp without time zone DEFAULT now()
);


ALTER TABLE public.website_pages OWNER TO content_user;

--
-- Name: website_pages_page_id_seq; Type: SEQUENCE; Schema: public; Owner: content_user
--

CREATE SEQUENCE public.website_pages_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.website_pages_page_id_seq OWNER TO content_user;

--
-- Name: website_pages_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: content_user
--

ALTER SEQUENCE public.website_pages_page_id_seq OWNED BY public.website_pages.page_id;


--
-- Name: website_page_versions version_id; Type: DEFAULT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_page_versions ALTER COLUMN version_id SET DEFAULT nextval('public.website_page_versions_version_id_seq'::regclass);


--
-- Name: website_pages page_id; Type: DEFAULT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_pages ALTER COLUMN page_id SET DEFAULT nextval('public.website_pages_page_id_seq'::regclass);


--
-- Data for Name: website_page_versions; Type: TABLE DATA; Schema: public; Owner: content_user
--

COPY public.website_page_versions (version_id, parent_page_id, markdown_content, html_content, version, creation_timestamp) FROM stdin;
\.


--
-- Data for Name: website_pages; Type: TABLE DATA; Schema: public; Owner: content_user
--

COPY public.website_pages (page_id, page_slug, page_title, markdown_content, html_content, version, creation_timestamp, last_update_timestamp) FROM stdin;
\.


--
-- Name: website_page_versions_version_id_seq; Type: SEQUENCE SET; Schema: public; Owner: content_user
--

SELECT pg_catalog.setval('public.website_page_versions_version_id_seq', 1, false);


--
-- Name: website_pages_page_id_seq; Type: SEQUENCE SET; Schema: public; Owner: content_user
--

SELECT pg_catalog.setval('public.website_pages_page_id_seq', 1, false);


--
-- Name: website_page_versions website_page_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_page_versions
    ADD CONSTRAINT website_page_versions_pkey PRIMARY KEY (version_id);


--
-- Name: website_pages website_pages_page_slug_key; Type: CONSTRAINT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_pages
    ADD CONSTRAINT website_pages_page_slug_key UNIQUE (page_slug);


--
-- Name: website_pages website_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_pages
    ADD CONSTRAINT website_pages_pkey PRIMARY KEY (page_id);


--
-- Name: idx_website_page_versions_parent; Type: INDEX; Schema: public; Owner: content_user
--

CREATE INDEX idx_website_page_versions_parent ON public.website_page_versions USING btree (parent_page_id);


--
-- Name: idx_website_page_versions_version; Type: INDEX; Schema: public; Owner: content_user
--

CREATE INDEX idx_website_page_versions_version ON public.website_page_versions USING btree (version);


--
-- Name: idx_website_pages_slug; Type: INDEX; Schema: public; Owner: content_user
--

CREATE INDEX idx_website_pages_slug ON public.website_pages USING btree (page_slug);


--
-- Name: idx_website_pages_updated; Type: INDEX; Schema: public; Owner: content_user
--

CREATE INDEX idx_website_pages_updated ON public.website_pages USING btree (last_update_timestamp);


--
-- Name: website_page_versions website_page_versions_parent_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: content_user
--

ALTER TABLE ONLY public.website_page_versions
    ADD CONSTRAINT website_page_versions_parent_page_id_fkey FOREIGN KEY (parent_page_id) REFERENCES public.website_pages(page_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2buUMbQGIzmrZF54dzQYbqUfzDoygemZOGNF5C8AyPbRDKqtx5Ub1lGoX0oFVqN

