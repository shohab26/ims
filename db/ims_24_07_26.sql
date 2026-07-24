--
-- PostgreSQL database dump
--

\restrict eSnStznGNDLUQthzIeMZX7yZ74KWWDqcgUyNCG2phSsX9lA7n5FBfwRB7jiz7nM

-- Dumped from database version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO ims;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO ims;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO ims;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO ims;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO ims;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO ims;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO ims;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: ims
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO ims;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO ims;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO ims;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO ims;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO ims;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO ims;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO ims;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO ims;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO ims;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: ims
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO ims;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: ims
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO ims;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: ims
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO ims;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: ims
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO ims;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: ims
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO ims;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: ims
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO ims;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: ims
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO ims;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: ims
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO ims;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: ims
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO ims;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: ims
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO ims;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: ims
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO ims;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO ims;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: ims
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO ims;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: ims
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO ims;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: ims
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO ims;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO ims;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: ims
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO ims;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: ims
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: ims
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO ims;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: ims
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO ims;

--
-- Name: audit_log_trigger(); Type: FUNCTION; Schema: public; Owner: ims
--

CREATE FUNCTION public.audit_log_trigger() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_user_id   INTEGER;
    v_ip        TEXT;
    v_action    VARCHAR(20);
    v_entity_id INTEGER;
    v_old_data  JSONB;
    v_new_data  JSONB;
BEGIN
    -- Read optional session variables set by the application
    BEGIN
        v_user_id := current_setting('app.user_id', true)::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    BEGIN
        v_ip := current_setting('app.ip', true);
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        v_action     := 'CREATE';
        v_entity_id  := NEW.id;
        v_old_data   := NULL;
        v_new_data   := to_jsonb(NEW);

    ELSIF TG_OP = 'UPDATE' THEN
        -- Skip pure soft-delete status flips that only touch is_deleted / deleted_at / deleted_by
        -- to avoid double-logging — they are already captured as DELETE intent by the app.
        -- Remove the IF block below if you want to log soft-deletes as UPDATE too.
        v_action     := 'UPDATE';
        v_entity_id  := NEW.id;
        v_old_data   := to_jsonb(OLD);
        v_new_data   := to_jsonb(NEW);

    ELSIF TG_OP = 'DELETE' THEN
        v_action     := 'DELETE';
        v_entity_id  := OLD.id;
        v_old_data   := to_jsonb(OLD);
        v_new_data   := NULL;
    END IF;

    INSERT INTO activity_logs
        (user_id, action, entity_type, entity_id, old_data, new_data, ip, created_at)
    VALUES
        (v_user_id, v_action, TG_TABLE_NAME, v_entity_id, v_old_data, v_new_data, v_ip, NOW());

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.audit_log_trigger() OWNER TO ims;

--
-- Name: next_invoice_number(integer); Type: FUNCTION; Schema: public; Owner: ims
--

CREATE FUNCTION public.next_invoice_number(p_year integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_seq INTEGER;
BEGIN
    INSERT INTO invoice_sequences(year, last_seq)
    VALUES (p_year, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_seq = invoice_sequences.last_seq + 1
    RETURNING last_seq INTO v_seq;

    RETURN 'INV-' || p_year::TEXT || '-' || LPAD(v_seq::TEXT, 6, '0');
END;
$$;


ALTER FUNCTION public.next_invoice_number(p_year integer) OWNER TO ims;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: ims
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO ims;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: ims
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO ims;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO ims;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO ims;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO ims;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO ims;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO ims;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO ims;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO ims;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO ims;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO ims;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO ims;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO ims;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO ims;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO ims;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: ims
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO ims;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO ims;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO ims;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO ims;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO ims;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO ims;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO ims;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO ims;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO ims;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO ims;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO ims;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO ims;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO ims;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO ims;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO ims;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO ims;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO ims;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: ims
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO ims;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO ims;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO ims;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO ims;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO ims;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO ims;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO ims;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO ims;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO ims;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO ims;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO ims;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO ims;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO ims;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO ims;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO ims;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: ims
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO ims;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: ims
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO ims;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO ims;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO ims;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO ims;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO ims;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO ims;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO ims;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO ims;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: ims
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO ims;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(20) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer,
    old_data jsonb,
    new_data jsonb,
    ip character varying(45),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO ims;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO ims;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: book; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.book (
    id integer NOT NULL,
    name character varying(255),
    price numeric(10,2),
    dept_id integer
);


ALTER TABLE public.book OWNER TO ims;

--
-- Name: book_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_id_seq OWNER TO ims;

--
-- Name: book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.book_id_seq OWNED BY public.book.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    cname character varying(255),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.categories OWNER TO ims;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO ims;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    address text,
    phone character varying(50),
    customer_name character varying(255),
    email character varying(255),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.customers OWNER TO ims;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO ims;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: delivery_details; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.delivery_details (
    id integer NOT NULL,
    quantity numeric(10,2),
    productid integer,
    customerid integer,
    deliverydate date,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    statusid integer,
    createdate timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer,
    shipment_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    tracking_number character varying(100),
    shipping_address text,
    carrier character varying(100),
    status_changed_by integer,
    status_changed_at timestamp with time zone,
    warehouseid integer DEFAULT 1 NOT NULL,
    CONSTRAINT delivery_details_shipment_status_check CHECK (((shipment_status)::text = ANY ((ARRAY['pending'::character varying, 'packed'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'returned'::character varying])::text[])))
);


ALTER TABLE public.delivery_details OWNER TO ims;

--
-- Name: delivery_details_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.delivery_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.delivery_details_id_seq OWNER TO ims;

--
-- Name: delivery_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.delivery_details_id_seq OWNED BY public.delivery_details.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.invoice_items (
    id integer NOT NULL,
    invoiceid integer NOT NULL,
    productid integer NOT NULL,
    description character varying(255),
    quantity numeric(10,2) DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer
);


ALTER TABLE public.invoice_items OWNER TO ims;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.invoice_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_id_seq OWNER TO ims;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoice_sequences; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.invoice_sequences (
    year integer NOT NULL,
    last_seq integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.invoice_sequences OWNER TO ims;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    invoice_number character varying(50) NOT NULL,
    customerid integer NOT NULL,
    issue_date date DEFAULT CURRENT_DATE NOT NULL,
    due_date date,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    tax_percent numeric(5,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    createdate timestamp without time zone DEFAULT now(),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.invoices OWNER TO ims;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO ims;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    module_name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL
);


ALTER TABLE public.modules OWNER TO ims;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO ims;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: order_details; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.order_details (
    id integer NOT NULL,
    quantity numeric(10,2),
    productid integer,
    unit_price numeric(10,2),
    statusid integer,
    total_price numeric(10,2),
    vendorid integer,
    createdate timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer,
    po_status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    status_changed_by integer,
    status_changed_at timestamp with time zone,
    warehouseid integer DEFAULT 1 NOT NULL,
    CONSTRAINT order_details_po_status_check CHECK (((po_status)::text = ANY ((ARRAY['draft'::character varying, 'sent'::character varying, 'partial'::character varying, 'received'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.order_details OWNER TO ims;

--
-- Name: order_details_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.order_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_details_id_seq OWNER TO ims;

--
-- Name: order_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.order_details_id_seq OWNED BY public.order_details.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    invoice_id integer NOT NULL,
    amount numeric NOT NULL,
    method character varying(50),
    transaction_id character varying(100),
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by integer,
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.payments OWNER TO ims;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO ims;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.products (
    id integer NOT NULL,
    pcode character varying(100),
    pname character varying(255),
    pcate integer,
    price numeric(10,2),
    createdate timestamp without time zone,
    updated_at timestamp with time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_by integer,
    reorder_level integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO ims;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO ims;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: returns; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.returns (
    id integer NOT NULL,
    delivery_id integer NOT NULL,
    productid integer NOT NULL,
    qty numeric NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'requested'::character varying NOT NULL,
    createdate timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_by integer,
    updated_by integer,
    updated_at timestamp with time zone,
    status_changed_by integer,
    status_changed_at timestamp with time zone,
    CONSTRAINT returns_qty_check CHECK ((qty > (0)::numeric)),
    CONSTRAINT returns_status_check CHECK (((status)::text = ANY ((ARRAY['requested'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.returns OWNER TO ims;

--
-- Name: returns_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.returns_id_seq OWNER TO ims;

--
-- Name: returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.returns_id_seq OWNED BY public.returns.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer,
    module_id integer,
    can_view boolean DEFAULT false,
    can_create boolean DEFAULT false,
    can_update boolean DEFAULT false,
    can_delete boolean DEFAULT false
);


ALTER TABLE public.role_permissions OWNER TO ims;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO ims;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO ims;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO ims;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: status; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.status (
    id integer NOT NULL,
    status character varying(100),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.status OWNER TO ims;

--
-- Name: status_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_id_seq OWNER TO ims;

--
-- Name: status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.status_id_seq OWNED BY public.status.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    productid integer,
    warehouseid integer,
    change numeric NOT NULL,
    reason character varying(20) DEFAULT 'adjustment'::character varying NOT NULL,
    ref_type character varying(30),
    ref_id integer,
    created_by integer,
    createdate timestamp with time zone DEFAULT now()
);


ALTER TABLE public.stock_movements OWNER TO ims;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO ims;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.stock_transfers (
    id integer NOT NULL,
    from_warehouse integer NOT NULL,
    to_warehouse integer NOT NULL,
    productid integer NOT NULL,
    qty numeric NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    createdate timestamp with time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_by integer,
    updated_by integer,
    updated_at timestamp with time zone,
    status_changed_by integer,
    status_changed_at timestamp with time zone,
    CONSTRAINT chk_transfer_diff_warehouse CHECK ((from_warehouse <> to_warehouse)),
    CONSTRAINT stock_transfers_qty_check CHECK ((qty > (0)::numeric)),
    CONSTRAINT stock_transfers_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.stock_transfers OWNER TO ims;

--
-- Name: stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.stock_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_transfers_id_seq OWNER TO ims;

--
-- Name: stock_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.stock_transfers_id_seq OWNED BY public.stock_transfers.id;


--
-- Name: stocks; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.stocks (
    id integer NOT NULL,
    quantity numeric(10,2),
    productid integer,
    warehouseid integer,
    updatedate timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.stocks OWNER TO ims;

--
-- Name: stocks_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.stocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stocks_id_seq OWNER TO ims;

--
-- Name: stocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.stocks_id_seq OWNED BY public.stocks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    must_change_password boolean DEFAULT false,
    password_change_otp_hash text,
    password_change_otp_expires_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO ims;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ims;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    address text,
    cell character varying(50),
    contact_person character varying(255),
    company character varying(255),
    email character varying(255),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.vendors OWNER TO ims;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO ims;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: ims
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    wname character varying(255),
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now(),
    created_by integer,
    updated_at timestamp with time zone,
    updated_by integer
);


ALTER TABLE public.warehouses OWNER TO ims;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: ims
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO ims;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ims
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: ims
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO ims;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: ims
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO ims;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: ims
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO ims;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: ims
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO ims;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: ims
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO ims;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO ims;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO ims;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO ims;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: ims
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO ims;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO ims;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: ims
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO ims;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: book id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.book ALTER COLUMN id SET DEFAULT nextval('public.book_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: delivery_details id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details ALTER COLUMN id SET DEFAULT nextval('public.delivery_details_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: order_details id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details ALTER COLUMN id SET DEFAULT nextval('public.order_details_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: returns id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns ALTER COLUMN id SET DEFAULT nextval('public.returns_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: status id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.status ALTER COLUMN id SET DEFAULT nextval('public.status_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: stock_transfers id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers ALTER COLUMN id SET DEFAULT nextval('public.stock_transfers_id_seq'::regclass);


--
-- Name: stocks id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stocks ALTER COLUMN id SET DEFAULT nextval('public.stocks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: ims
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, old_data, new_data, ip, created_at) FROM stdin;
1	\N	UPDATE	products	58	{"id": 58, "pcate": 1, "pcode": "PRD-054", "pname": "Electric Oven", "price": 3.00, "createdate": "2026-07-11T03:29:00.443", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	{"id": 58, "pcate": 1, "pcode": "PRD-054", "pname": "Electric Oven", "price": 3.00, "createdate": "2026-07-11T03:29:00.443", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	\N	2026-07-11 15:29:27.06612+06
2	\N	UPDATE	products	58	{"id": 58, "pcate": 1, "pcode": "PRD-054", "pname": "Electric Oven", "price": 3.00, "createdate": "2026-07-11T03:29:00.443", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	{"id": 58, "pcate": 1, "pcode": "PRD-054", "pname": "Electric Oven", "price": 2.00, "createdate": "2026-07-11T03:29:00.443", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	\N	2026-07-11 15:29:55.807338+06
3	\N	CREATE	products	59	\N	{"id": 59, "pcate": 1, "pcode": "PRD-055", "pname": "Kately", "price": 12.00, "createdate": "2026-07-11T16:17:13.491", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	\N	2026-07-11 16:17:13.558899+06
4	\N	UPDATE	products	59	{"id": 59, "pcate": 1, "pcode": "PRD-055", "pname": "Kately", "price": 12.00, "createdate": "2026-07-11T16:17:13.491", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	{"id": 59, "pcate": 1, "pcode": "PRD-055", "pname": "Kately", "price": 14.00, "createdate": "2026-07-11T16:17:13.491", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null}	\N	2026-07-11 16:19:15.005714+06
5	\N	UPDATE	products	59	{"id": 59, "pcate": 1, "pcode": "PRD-055", "pname": "Kately", "price": 14.00, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "createdate": "2026-07-11T16:17:13.491", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null}	{"id": 59, "pcate": 1, "pcode": "PRD-055", "pname": "Kately", "price": 13.00, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "createdate": "2026-07-11T16:17:13.491", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T10:40:50.463963+00:00", "updated_by": 1}	\N	2026-07-11 16:40:50.463963+06
6	\N	CREATE	products	60	\N	{"id": 60, "pcate": 1, "pcode": "PRD-056", "pname": "Singara Machine", "price": 25.00, "created_at": "2026-07-11T10:42:49.29555+00:00", "created_by": 1, "createdate": "2026-07-11T16:42:49.225", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null}	\N	2026-07-11 16:42:49.29555+06
7	\N	CREATE	products	61	\N	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 30.00, "created_at": "2026-07-11T10:48:40.26742+00:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null}	\N	2026-07-11 16:48:40.26742+06
8	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 30.00, "created_at": "2026-07-11T10:48:40.26742+00:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T10:48:40.26742+00:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:04:23.203464+00:00", "updated_by": 2}	\N	2026-07-11 17:04:23.203464+06
9	\N	CREATE	order_details	3	\N	{"id": 3, "quantity": 5.00, "statusid": 1, "vendorid": 1, "productid": 61, "created_at": "2026-07-11T11:47:04.721689+00:00", "created_by": 1, "createdate": "2026-07-11T17:47:03.843", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 175.00}	\N	2026-07-11 17:47:04.721689+06
10	\N	CREATE	stocks	8	\N	{"id": 8, "quantity": 5.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-11T17:47:04.935", "warehouseid": 1}	\N	2026-07-11 17:47:05.000663+06
11	\N	CREATE	order_details	4	\N	{"id": 4, "quantity": 10.00, "statusid": 1, "vendorid": 1, "productid": 61, "created_at": "2026-07-11T11:47:51.167616+00:00", "created_by": 1, "createdate": "2026-07-11T17:47:50.348", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 350.00}	\N	2026-07-11 17:47:51.167616+06
12	\N	UPDATE	stocks	8	{"id": 8, "quantity": 5.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-11T17:47:04.935", "warehouseid": 1}	{"id": 8, "quantity": 15.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:47:51.41789+00:00", "updated_by": null, "updatedate": "2026-07-11T17:47:51.355", "warehouseid": 1}	\N	2026-07-11 17:47:51.41789+06
13	\N	CREATE	order_details	5	\N	{"id": 5, "quantity": 102.00, "statusid": 1, "vendorid": 1, "productid": 58, "created_at": "2026-07-11T11:48:17.664529+00:00", "created_by": 1, "createdate": "2026-07-11T17:48:16.868", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 2.00, "updated_at": null, "updated_by": null, "total_price": 204.00}	\N	2026-07-11 17:48:17.664529+06
14	\N	UPDATE	stocks	7	{"id": 7, "quantity": 100.00, "productid": 58, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-11T15:14:28.528", "warehouseid": 1}	{"id": 7, "quantity": 202.00, "productid": 58, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:48:17.904034+00:00", "updated_by": null, "updatedate": "2026-07-11T17:48:17.842", "warehouseid": 1}	\N	2026-07-11 17:48:17.904034+06
15	\N	CREATE	delivery_details	3	\N	{"id": 3, "quantity": 20.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T11:49:59.870102+00:00", "created_by": 1, "createdate": "2026-07-11T17:49:59.013", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 770.00, "deliverydate": "2026-07-14"}	\N	2026-07-11 17:49:59.870102+06
16	\N	UPDATE	stocks	8	{"id": 8, "quantity": 15.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:47:51.41789+00:00", "updated_by": null, "updatedate": "2026-07-11T17:47:51.355", "warehouseid": 1}	{"id": 8, "quantity": -5.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:50:00.112094+00:00", "updated_by": null, "updatedate": "2026-07-11T17:50:00.053", "warehouseid": 1}	\N	2026-07-11 17:50:00.112094+06
17	\N	CREATE	delivery_details	4	\N	{"id": 4, "quantity": 5.00, "statusid": 1, "productid": 58, "created_at": "2026-07-11T11:57:17.913946+00:00", "created_by": 1, "createdate": "2026-07-11T17:57:17.846", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 10.00, "updated_at": null, "updated_by": null, "total_price": 50.00, "deliverydate": "2026-07-11"}	\N	2026-07-11 17:57:17.913946+06
18	\N	UPDATE	stocks	7	{"id": 7, "quantity": 202.00, "productid": 58, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:48:17.904034+00:00", "updated_by": null, "updatedate": "2026-07-11T17:48:17.842", "warehouseid": 1}	{"id": 7, "quantity": 197.00, "productid": 58, "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:57:18.171816+00:00", "updated_by": null, "updatedate": "2026-07-11T17:57:18.104", "warehouseid": 1}	\N	2026-07-11 17:57:18.171816+06
19	\N	CREATE	order_details	6	\N	{"id": 6, "quantity": 20.00, "statusid": 1, "vendorid": 1, "productid": 61, "created_at": "2026-07-11T12:31:59.463004+00:00", "created_by": 1, "createdate": "2026-07-11T18:31:59.401", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 700.00}	\N	2026-07-11 18:31:59.463004+06
20	\N	UPDATE	stocks	8	{"id": 8, "quantity": -5.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:50:00.112094+00:00", "updated_by": null, "updatedate": "2026-07-11T17:50:00.053", "warehouseid": 1}	{"id": 8, "quantity": 15.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T12:31:59.788459+00:00", "updated_by": null, "updatedate": "2026-07-11T18:31:59.727", "warehouseid": 1}	\N	2026-07-11 18:31:59.788459+06
21	\N	CREATE	delivery_details	5	\N	{"id": 5, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T12:32:47.575602+00:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 770.00, "deliverydate": "2026-07-20"}	\N	2026-07-11 18:32:47.575602+06
22	\N	UPDATE	stocks	8	{"id": 8, "quantity": 15.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T12:31:59.788459+00:00", "updated_by": null, "updatedate": "2026-07-11T18:31:59.727", "warehouseid": 1}	{"id": 8, "quantity": 10.00, "productid": 61, "created_at": "2026-07-11T11:47:05.000663+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T12:32:47.809614+00:00", "updated_by": null, "updatedate": "2026-07-11T18:32:47.751", "warehouseid": 1}	\N	2026-07-11 18:32:47.809614+06
23	\N	CREATE	invoices	2	\N	{"id": 2, "notes": "Test", "total": 110.00, "status": "draft", "discount": 0.00, "due_date": "2026-08-01", "subtotal": 100.00, "created_at": "2026-07-11T12:43:58.502985+00:00", "created_by": 1, "createdate": "2026-07-11T12:43:58.502985", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "issue_date": "2026-07-11", "tax_amount": 10.00, "updated_at": null, "updated_by": null, "tax_percent": 10.00, "invoice_number": "INV-2026-000004"}	\N	2026-07-11 18:43:58.502985+06
24	\N	CREATE	invoice_items	3	\N	{"id": 3, "total": 100.00, "quantity": 1.00, "invoiceid": 2, "productid": 58, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 100.00, "description": "item"}	\N	2026-07-11 18:43:58.502985+06
25	\N	CREATE	invoices	3	\N	{"id": 3, "notes": "", "total": 95.00, "status": "draft", "discount": 5.00, "due_date": "2026-08-15", "subtotal": 100.00, "created_at": "2026-07-11T12:43:59.129694+00:00", "created_by": 1, "createdate": "2026-07-11T12:43:59.129694", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "issue_date": "2026-07-11", "tax_amount": 0.00, "updated_at": null, "updated_by": null, "tax_percent": 0.00, "invoice_number": "INV-2026-000005"}	\N	2026-07-11 18:43:59.129694+06
26	\N	CREATE	invoice_items	4	\N	{"id": 4, "total": 100.00, "quantity": 2.00, "invoiceid": 3, "productid": 52, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 50.00, "description": ""}	\N	2026-07-11 18:43:59.129694+06
27	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T10:48:40.26742+00:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T11:04:23.203464+00:00", "updated_by": 2}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 34.00, "created_at": "2026-07-11T10:48:40.26742+00:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T12:48:13.190222+00:00", "updated_by": 1}	\N	2026-07-11 18:48:13.190222+06
28	\N	CREATE	invoices	4	\N	{"id": 4, "notes": null, "total": 371.48, "status": "draft", "discount": 10.00, "due_date": "2026-07-14", "subtotal": 374.00, "created_at": "2026-07-11T13:01:36.521714+00:00", "created_by": 1, "createdate": "2026-07-11T13:01:36.521714", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "issue_date": "2026-07-11", "tax_amount": 7.48, "updated_at": null, "updated_by": null, "tax_percent": 2.00, "invoice_number": "INV-2026-000006"}	\N	2026-07-11 19:01:36.521714+06
29	\N	CREATE	invoice_items	5	\N	{"id": 5, "total": 374.00, "quantity": 11.00, "invoiceid": 4, "productid": 61, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 34.00, "description": "Flusk"}	\N	2026-07-11 19:01:36.521714+06
30	\N	UPDATE	customers	1	{"id": 1, "email": "aman@gmail.com", "phone": "887766", "address": "4455, NY", "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "customer_name": "Aman"}	{"id": 1, "email": "shohabsikder4057@gmail.com", "phone": "887766", "address": "4455, NY", "created_at": "2026-07-11T10:26:00.330505+00:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T13:02:50.863279+00:00", "updated_by": 1, "customer_name": "Aman"}	\N	2026-07-11 19:02:50.863279+06
31	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 34.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T18:48:13.190222+06:00", "updated_by": 1}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T18:45:23.329573+06:00", "updated_by": 1}	\N	2026-07-24 18:45:23.329573+06
32	\N	UPDATE	delivery_details	5	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 770.00, "deliverydate": "2026-07-20", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T19:33:19.407677+06:00", "updated_by": 1, "total_price": 770.00, "deliverydate": "2026-07-20", "shipment_status": "packed", "tracking_number": null, "shipping_address": null, "status_changed_at": "2026-07-24T19:33:19.407+06:00", "status_changed_by": 1}	\N	2026-07-24 19:33:19.407677+06
33	\N	UPDATE	delivery_details	5	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T19:33:19.407677+06:00", "updated_by": 1, "total_price": 770.00, "deliverydate": "2026-07-20", "shipment_status": "packed", "tracking_number": null, "shipping_address": null, "status_changed_at": "2026-07-24T19:33:19.407+06:00", "status_changed_by": 1}	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T19:33:24.664667+06:00", "updated_by": 1, "total_price": 770.00, "deliverydate": "2026-07-20", "shipment_status": "returned", "tracking_number": null, "shipping_address": null, "status_changed_at": "2026-07-24T19:33:24.664+06:00", "status_changed_by": 1}	\N	2026-07-24 19:33:24.664667+06
34	\N	CREATE	invoices	5	\N	{"id": 5, "notes": null, "total": 239.90, "status": "draft", "discount": 10.00, "due_date": "2026-07-30", "subtotal": 245.00, "created_at": "2026-07-24T20:04:51.767717+06:00", "created_by": 1, "createdate": "2026-07-24T20:04:51.767717", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "issue_date": "2026-07-24", "tax_amount": 4.90, "updated_at": null, "updated_by": null, "tax_percent": 2.00, "invoice_number": "INV-2026-000007"}	\N	2026-07-24 20:04:51.767717+06
35	\N	CREATE	invoice_items	6	\N	{"id": 6, "total": 245.00, "quantity": 7.00, "invoiceid": 5, "productid": 61, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "description": "Flusk"}	\N	2026-07-24 20:04:51.767717+06
36	\N	CREATE	delivery_details	6	\N	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": null, "updated_by": null, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 20:19:23.045953+06
37	\N	UPDATE	stocks	2	{"id": 2, "quantity": 52.00, "productid": 54, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-06-21T01:08:33.833", "warehouseid": 1}	{"id": 2, "quantity": 42.00, "productid": 54, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T20:19:23.055554+06:00", "updated_by": null, "updatedate": "2026-07-24T20:19:23.055", "warehouseid": 1}	\N	2026-07-24 20:19:23.055554+06
38	\N	CREATE	warehouses	2	\N	{"id": 2, "wname": "Fahim", "created_at": "2026-07-24T20:43:31.058508+06:00", "created_by": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null}	\N	2026-07-24 20:43:31.058508+06
39	\N	UPDATE	stocks	8	{"id": 8, "quantity": 10.00, "productid": 61, "created_at": "2026-07-11T17:47:05.000663+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-11T18:32:47.809614+06:00", "updated_by": null, "updatedate": "2026-07-11T18:32:47.751", "warehouseid": 1}	{"id": 8, "quantity": 0.00, "productid": 61, "created_at": "2026-07-11T17:47:05.000663+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T20:44:25.965297+06:00", "updated_by": null, "updatedate": "2026-07-24T20:44:25.965297", "warehouseid": 1}	\N	2026-07-24 20:44:25.965297+06
40	\N	CREATE	stocks	9	\N	{"id": 9, "quantity": 10.00, "productid": 61, "created_at": "2026-07-24T20:44:25.965297+06:00", "created_by": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T20:44:25.965297", "warehouseid": 2}	\N	2026-07-24 20:44:25.965297+06
41	\N	UPDATE	delivery_details	6	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": null, "updated_by": null, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": null, "status_changed_by": null}	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:25:42.721876+06:00", "updated_by": 1, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "packed", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:25:42.721+06:00", "status_changed_by": 1}	\N	2026-07-24 21:25:42.721876+06
42	\N	UPDATE	delivery_details	6	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:25:42.721876+06:00", "updated_by": 1, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "packed", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:25:42.721+06:00", "status_changed_by": 1}	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:25:51.0641+06:00", "updated_by": 1, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "shipped", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:25:51.063+06:00", "status_changed_by": 1}	\N	2026-07-24 21:25:51.0641+06
43	\N	UPDATE	delivery_details	6	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:25:51.0641+06:00", "updated_by": 1, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "shipped", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:25:51.063+06:00", "status_changed_by": 1}	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:26:21.972455+06:00", "updated_by": 1, "total_price": 1595.00, "deliverydate": "2026-07-30", "shipment_status": "delivered", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:26:21.972+06:00", "status_changed_by": 1}	\N	2026-07-24 21:26:21.972455+06
44	\N	CREATE	delivery_details	7	\N	{"id": 7, "carrier": "DHL", "quantity": 4.00, "statusid": null, "productid": 53, "created_at": "2026-07-24T21:28:15.135305+06:00", "created_by": 1, "createdate": "2026-07-24T21:28:15.135", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": null, "updated_by": null, "total_price": 2196.60, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "T-202607001", "shipping_address": "UK", "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:28:15.135305+06
45	\N	UPDATE	stocks	5	{"id": 5, "quantity": 5.00, "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-06-21T01:14:47.308", "warehouseid": 1}	{"id": 5, "quantity": 1.00, "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:28:15.14438+06:00", "updated_by": null, "updatedate": "2026-07-24T21:28:15.144", "warehouseid": 1}	\N	2026-07-24 21:28:15.14438+06
46	\N	UPDATE	order_details	1	{"id": 1, "quantity": 2.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 1, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-05-31T01:26:10.163", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 45000.00, "updated_at": null, "updated_by": null, "total_price": 90000.00, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 1, "quantity": 2.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 1, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-05-31T01:26:10.163", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 45000.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 90000.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
47	\N	UPDATE	order_details	2	{"id": 2, "quantity": 10.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:13:47.046", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 499.23, "updated_at": null, "updated_by": null, "total_price": 4992.30, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 2, "quantity": 10.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:13:47.046", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 499.23, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 4992.30, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
48	\N	UPDATE	order_details	3	{"id": 3, "quantity": 5.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T17:47:04.721689+06:00", "created_by": 1, "createdate": "2026-07-11T17:47:03.843", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 175.00, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 3, "quantity": 5.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T17:47:04.721689+06:00", "created_by": 1, "createdate": "2026-07-11T17:47:03.843", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 175.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
49	\N	UPDATE	order_details	4	{"id": 4, "quantity": 10.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T17:47:51.167616+06:00", "created_by": 1, "createdate": "2026-07-11T17:47:50.348", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 350.00, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 4, "quantity": 10.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T17:47:51.167616+06:00", "created_by": 1, "createdate": "2026-07-11T17:47:50.348", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 350.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
50	\N	UPDATE	order_details	5	{"id": 5, "quantity": 102.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 58, "created_at": "2026-07-11T17:48:17.664529+06:00", "created_by": 1, "createdate": "2026-07-11T17:48:16.868", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 2.00, "updated_at": null, "updated_by": null, "total_price": 204.00, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 5, "quantity": 102.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 58, "created_at": "2026-07-11T17:48:17.664529+06:00", "created_by": 1, "createdate": "2026-07-11T17:48:16.868", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 2.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 204.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
51	\N	UPDATE	order_details	6	{"id": 6, "quantity": 20.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T18:31:59.463004+06:00", "created_by": 1, "createdate": "2026-07-11T18:31:59.401", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": null, "updated_by": null, "total_price": 700.00, "warehouseid": null, "status_changed_at": null, "status_changed_by": null}	{"id": 6, "quantity": 20.00, "statusid": 1, "vendorid": 1, "po_status": "draft", "productid": 61, "created_at": "2026-07-11T18:31:59.463004+06:00", "created_by": 1, "createdate": "2026-07-11T18:31:59.401", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 35.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 700.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
52	\N	UPDATE	delivery_details	1	{"id": 1, "carrier": null, "quantity": 12.00, "statusid": 1, "productid": 54, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:10:06.035", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": null, "updated_by": null, "total_price": 59400.00, "warehouseid": null, "deliverydate": "2026-06-21", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	{"id": 1, "carrier": null, "quantity": 12.00, "statusid": 1, "productid": 54, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:10:06.035", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 59400.00, "warehouseid": 1, "deliverydate": "2026-06-21", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
53	\N	UPDATE	delivery_details	2	{"id": 2, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:14:46.32", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": null, "updated_by": null, "total_price": 2745.75, "warehouseid": null, "deliverydate": "2026-06-20", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	{"id": 2, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 53, "created_at": "2026-07-11T16:26:00.330505+06:00", "created_by": null, "createdate": "2026-06-21T01:14:46.32", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 2745.75, "warehouseid": 1, "deliverydate": "2026-06-20", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
54	\N	UPDATE	delivery_details	3	{"id": 3, "carrier": null, "quantity": 20.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T17:49:59.870102+06:00", "created_by": 1, "createdate": "2026-07-11T17:49:59.013", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 770.00, "warehouseid": null, "deliverydate": "2026-07-14", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	{"id": 3, "carrier": null, "quantity": 20.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T17:49:59.870102+06:00", "created_by": 1, "createdate": "2026-07-11T17:49:59.013", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 770.00, "warehouseid": 1, "deliverydate": "2026-07-14", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
55	\N	UPDATE	delivery_details	4	{"id": 4, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 58, "created_at": "2026-07-11T17:57:17.913946+06:00", "created_by": 1, "createdate": "2026-07-11T17:57:17.846", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 10.00, "updated_at": null, "updated_by": null, "total_price": 50.00, "warehouseid": null, "deliverydate": "2026-07-11", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	{"id": 4, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 58, "created_at": "2026-07-11T17:57:17.913946+06:00", "created_by": 1, "createdate": "2026-07-11T17:57:17.846", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 10.00, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 50.00, "warehouseid": 1, "deliverydate": "2026-07-11", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
56	\N	UPDATE	delivery_details	5	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T19:33:24.664667+06:00", "updated_by": 1, "total_price": 770.00, "warehouseid": null, "deliverydate": "2026-07-20", "shipment_status": "returned", "tracking_number": null, "shipping_address": null, "status_changed_at": "2026-07-24T19:33:24.664+06:00", "status_changed_by": 1}	{"id": 5, "carrier": null, "quantity": 5.00, "statusid": 1, "productid": 61, "created_at": "2026-07-11T18:32:47.575602+06:00", "created_by": 1, "createdate": "2026-07-11T18:32:47.517", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": 1, "total_price": 770.00, "warehouseid": 1, "deliverydate": "2026-07-20", "shipment_status": "returned", "tracking_number": null, "shipping_address": null, "status_changed_at": "2026-07-24T19:33:24.664+06:00", "status_changed_by": 1}	\N	2026-07-24 21:43:18.590436+06
57	\N	UPDATE	delivery_details	6	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:26:21.972455+06:00", "updated_by": 1, "total_price": 1595.00, "warehouseid": null, "deliverydate": "2026-07-30", "shipment_status": "delivered", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:26:21.972+06:00", "status_changed_by": 1}	{"id": 6, "carrier": "Pathao", "quantity": 10.00, "statusid": null, "productid": 54, "created_at": "2026-07-24T20:19:23.045953+06:00", "created_by": 1, "createdate": "2026-07-24T20:19:23.045", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 819.59, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": 1, "total_price": 1595.00, "warehouseid": 1, "deliverydate": "2026-07-30", "shipment_status": "delivered", "tracking_number": "4456", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:26:21.972+06:00", "status_changed_by": 1}	\N	2026-07-24 21:43:18.590436+06
58	\N	UPDATE	delivery_details	7	{"id": 7, "carrier": "DHL", "quantity": 4.00, "statusid": null, "productid": 53, "created_at": "2026-07-24T21:28:15.135305+06:00", "created_by": 1, "createdate": "2026-07-24T21:28:15.135", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": null, "updated_by": null, "total_price": 2196.60, "warehouseid": null, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "T-202607001", "shipping_address": "UK", "status_changed_at": null, "status_changed_by": null}	{"id": 7, "carrier": "DHL", "quantity": 4.00, "statusid": null, "productid": 53, "created_at": "2026-07-24T21:28:15.135305+06:00", "created_by": 1, "createdate": "2026-07-24T21:28:15.135", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 2196.60, "warehouseid": 1, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "T-202607001", "shipping_address": "UK", "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:43:18.590436+06
59	\N	CREATE	products	62	\N	{"id": 62, "pcate": 1, "pcode": "TEST-WH-001", "pname": "Warehouse Test Widget", "price": 100.00, "created_at": "2026-07-24T21:46:13.810971+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:13.786", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "reorder_level": 5}	\N	2026-07-24 21:46:13.810971+06
60	\N	CREATE	stocks	10	\N	{"id": 10, "quantity": 20.00, "productid": 62, "created_at": "2026-07-24T21:46:13.824323+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T21:46:13.824", "warehouseid": 2}	\N	2026-07-24 21:46:13.824323+06
61	\N	CREATE	order_details	7	\N	{"id": 7, "quantity": 15.00, "statusid": null, "vendorid": 1, "po_status": "draft", "productid": 62, "created_at": "2026-07-24T21:46:14.126212+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:14.125", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 90.00, "updated_at": null, "updated_by": null, "total_price": 1350.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:46:14.126212+06
62	\N	CREATE	stocks	11	\N	{"id": 11, "quantity": 15.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T21:46:14.14", "warehouseid": 1}	\N	2026-07-24 21:46:14.140433+06
63	\N	CREATE	delivery_details	8	\N	{"id": 8, "carrier": null, "quantity": 10.00, "statusid": null, "productid": 62, "created_at": "2026-07-24T21:46:14.437408+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:14.437", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 120.00, "updated_at": null, "updated_by": null, "total_price": 1200.00, "warehouseid": 1, "deliverydate": "2026-07-24", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:46:14.437408+06
64	\N	UPDATE	stocks	11	{"id": 11, "quantity": 15.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T21:46:14.14", "warehouseid": 1}	{"id": 11, "quantity": 5.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:46:14.444595+06:00", "updated_by": null, "updatedate": "2026-07-24T21:46:14.444", "warehouseid": 1}	\N	2026-07-24 21:46:14.444595+06
65	\N	UPDATE	stocks	11	{"id": 11, "quantity": 5.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:46:14.444595+06:00", "updated_by": null, "updatedate": "2026-07-24T21:46:14.444", "warehouseid": 1}	{"id": 11, "quantity": 9.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:46:14.754911+06:00", "updated_by": null, "updatedate": "2026-07-24T21:46:14.754", "warehouseid": 1}	\N	2026-07-24 21:46:14.754911+06
66	\N	DELETE	delivery_details	8	{"id": 8, "carrier": null, "quantity": 10.00, "statusid": null, "productid": 62, "created_at": "2026-07-24T21:46:14.437408+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:14.437", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 120.00, "updated_at": null, "updated_by": null, "total_price": 1200.00, "warehouseid": 1, "deliverydate": "2026-07-24", "shipment_status": "pending", "tracking_number": null, "shipping_address": null, "status_changed_at": null, "status_changed_by": null}	\N	\N	2026-07-24 21:46:15.065764+06
67	\N	DELETE	order_details	7	{"id": 7, "quantity": 15.00, "statusid": null, "vendorid": 1, "po_status": "draft", "productid": 62, "created_at": "2026-07-24T21:46:14.126212+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:14.125", "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 90.00, "updated_at": null, "updated_by": null, "total_price": 1350.00, "warehouseid": 1, "status_changed_at": null, "status_changed_by": null}	\N	\N	2026-07-24 21:46:15.067693+06
68	\N	DELETE	stocks	10	{"id": 10, "quantity": 20.00, "productid": 62, "created_at": "2026-07-24T21:46:13.824323+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T21:46:13.824", "warehouseid": 2}	\N	\N	2026-07-24 21:46:15.069312+06
69	\N	DELETE	stocks	11	{"id": 11, "quantity": 9.00, "productid": 62, "created_at": "2026-07-24T21:46:14.140433+06:00", "created_by": null, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:46:14.754911+06:00", "updated_by": null, "updatedate": "2026-07-24T21:46:14.754", "warehouseid": 1}	\N	\N	2026-07-24 21:46:15.069312+06
70	\N	DELETE	products	62	{"id": 62, "pcate": 1, "pcode": "TEST-WH-001", "pname": "Warehouse Test Widget", "price": 100.00, "created_at": "2026-07-24T21:46:13.810971+06:00", "created_by": 1, "createdate": "2026-07-24T21:46:13.786", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "reorder_level": 5}	\N	\N	2026-07-24 21:46:15.07144+06
71	\N	CREATE	delivery_details	9	\N	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "pending", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": null, "status_changed_by": null}	\N	2026-07-24 21:53:09.874245+06
72	\N	UPDATE	stocks	9	{"id": 9, "quantity": 10.00, "productid": 61, "created_at": "2026-07-24T20:44:25.965297+06:00", "created_by": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": null, "updated_by": null, "updatedate": "2026-07-24T20:44:25.965297", "warehouseid": 2}	{"id": 9, "quantity": 0.00, "productid": 61, "created_at": "2026-07-24T20:44:25.965297+06:00", "created_by": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:53:09.882+06:00", "updated_by": null, "updatedate": "2026-07-24T21:53:09.881", "warehouseid": 2}	\N	2026-07-24 21:53:09.882+06
73	\N	UPDATE	delivery_details	9	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": null, "updated_by": null, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "pending", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": null, "status_changed_by": null}	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:53:47.384113+06:00", "updated_by": 1, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "packed", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:53:47.384+06:00", "status_changed_by": 1}	\N	2026-07-24 21:53:47.384113+06
74	\N	UPDATE	delivery_details	9	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:53:47.384113+06:00", "updated_by": 1, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "packed", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:53:47.384+06:00", "status_changed_by": 1}	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:53:47.866301+06:00", "updated_by": 1, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "shipped", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:53:47.866+06:00", "status_changed_by": 1}	\N	2026-07-24 21:53:47.866301+06
75	\N	UPDATE	delivery_details	9	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:53:47.866301+06:00", "updated_by": 1, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "shipped", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:53:47.866+06:00", "status_changed_by": 1}	{"id": 9, "carrier": "UPS", "quantity": 10.00, "statusid": null, "productid": 61, "created_at": "2026-07-24T21:53:09.874245+06:00", "created_by": 1, "createdate": "2026-07-24T21:53:09.874", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 38.50, "updated_at": "2026-07-24T21:53:48.402644+06:00", "updated_by": 1, "total_price": 385.00, "warehouseid": 2, "deliverydate": "2026-07-29", "shipment_status": "delivered", "tracking_number": "TRA-0098", "shipping_address": "Dhaka", "status_changed_at": "2026-07-24T21:53:48.402+06:00", "status_changed_by": 1}	\N	2026-07-24 21:53:48.402644+06
76	\N	UPDATE	delivery_details	7	{"id": 7, "carrier": "DHL", "quantity": 4.00, "statusid": null, "productid": 53, "created_at": "2026-07-24T21:28:15.135305+06:00", "created_by": 1, "createdate": "2026-07-24T21:28:15.135", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": "2026-07-24T21:43:18.590436+06:00", "updated_by": null, "total_price": 2196.60, "warehouseid": 1, "deliverydate": "2026-07-30", "shipment_status": "pending", "tracking_number": "T-202607001", "shipping_address": "UK", "status_changed_at": null, "status_changed_by": null}	{"id": 7, "carrier": "DHL", "quantity": 4.00, "statusid": null, "productid": 53, "created_at": "2026-07-24T21:28:15.135305+06:00", "created_by": 1, "createdate": "2026-07-24T21:28:15.135", "customerid": 1, "deleted_at": null, "deleted_by": null, "is_deleted": false, "unit_price": 549.15, "updated_at": "2026-07-24T21:54:09.775725+06:00", "updated_by": 1, "total_price": 2196.60, "warehouseid": 1, "deliverydate": "2026-07-30", "shipment_status": "returned", "tracking_number": "T-202607001", "shipping_address": "UK", "status_changed_at": "2026-07-24T21:54:09.775+06:00", "status_changed_by": 1}	\N	2026-07-24 21:54:09.775725+06
77	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T18:45:23.329573+06:00", "updated_by": 1, "reorder_level": 0}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": "2026-07-24T21:55:46.32854+06:00", "deleted_by": 1, "is_deleted": true, "updated_at": "2026-07-24T21:55:46.32854+06:00", "updated_by": 1, "reorder_level": 0}	\N	2026-07-24 21:55:46.32854+06
78	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": "2026-07-24T21:55:46.32854+06:00", "deleted_by": 1, "is_deleted": true, "updated_at": "2026-07-24T21:55:46.32854+06:00", "updated_by": 1, "reorder_level": 0}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:56:00.497038+06:00", "updated_by": 1, "reorder_level": 0}	\N	2026-07-24 21:56:00.497038+06
79	\N	UPDATE	products	61	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:56:00.497038+06:00", "updated_by": 1, "reorder_level": 0}	{"id": 61, "pcate": 1, "pcode": "PRD-057", "pname": "Flusk", "price": 35.00, "created_at": "2026-07-11T16:48:40.26742+06:00", "created_by": 1, "createdate": "2026-07-11T16:48:40.206", "deleted_at": null, "deleted_by": null, "is_deleted": false, "updated_at": "2026-07-24T21:58:11.046356+06:00", "updated_by": 1, "reorder_level": 5}	\N	2026-07-24 21:58:11.046356+06
\.


--
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.book (id, name, price, dept_id) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.categories (id, cname, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Electronics	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.customers (id, address, phone, customer_name, email, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	4455, NY	887766	Aman	shohabsikder4057@gmail.com	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-11 19:02:50.863279+06	1
\.


--
-- Data for Name: delivery_details; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.delivery_details (id, quantity, productid, customerid, deliverydate, unit_price, total_price, statusid, createdate, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by, shipment_status, tracking_number, shipping_address, carrier, status_changed_by, status_changed_at, warehouseid) FROM stdin;
1	12.00	54	1	2026-06-21	819.59	59400.00	1	2026-06-21 01:10:06.035	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 21:43:18.590436+06	\N	pending	\N	\N	\N	\N	\N	1
2	5.00	53	1	2026-06-20	549.15	2745.75	1	2026-06-21 01:14:46.32	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 21:43:18.590436+06	\N	pending	\N	\N	\N	\N	\N	1
3	20.00	61	1	2026-07-14	38.50	770.00	1	2026-07-11 17:49:59.013	f	\N	\N	2026-07-11 17:49:59.870102+06	1	2026-07-24 21:43:18.590436+06	\N	pending	\N	\N	\N	\N	\N	1
4	5.00	58	1	2026-07-11	10.00	50.00	1	2026-07-11 17:57:17.846	f	\N	\N	2026-07-11 17:57:17.913946+06	1	2026-07-24 21:43:18.590436+06	\N	pending	\N	\N	\N	\N	\N	1
5	5.00	61	1	2026-07-20	38.50	770.00	1	2026-07-11 18:32:47.517	f	\N	\N	2026-07-11 18:32:47.575602+06	1	2026-07-24 21:43:18.590436+06	1	returned	\N	\N	\N	1	2026-07-24 19:33:24.664+06	1
6	10.00	54	1	2026-07-30	819.59	1595.00	\N	2026-07-24 20:19:23.045	f	\N	\N	2026-07-24 20:19:23.045953+06	1	2026-07-24 21:43:18.590436+06	1	delivered	4456	Dhaka	Pathao	1	2026-07-24 21:26:21.972+06	1
9	10.00	61	1	2026-07-29	38.50	385.00	\N	2026-07-24 21:53:09.874	f	\N	\N	2026-07-24 21:53:09.874245+06	1	2026-07-24 21:53:48.402644+06	1	delivered	TRA-0098	Dhaka	UPS	1	2026-07-24 21:53:48.402+06	2
7	4.00	53	1	2026-07-30	549.15	2196.60	\N	2026-07-24 21:28:15.135	f	\N	\N	2026-07-24 21:28:15.135305+06	1	2026-07-24 21:54:09.775725+06	1	returned	T-202607001	UK	DHL	1	2026-07-24 21:54:09.775+06	1
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.invoice_items (id, invoiceid, productid, description, quantity, unit_price, total, is_deleted, deleted_at, deleted_by) FROM stdin;
1	1	54	Printer 50	4.00	745.08	2980.32	f	\N	\N
2	1	48	Monitor 44	3.00	421.80	1265.40	f	\N	\N
3	2	58	item	1.00	100.00	100.00	f	\N	\N
4	3	52		2.00	50.00	100.00	f	\N	\N
5	4	61	Flusk	11.00	34.00	374.00	f	\N	\N
6	5	61	Flusk	7.00	35.00	245.00	f	\N	\N
\.


--
-- Data for Name: invoice_sequences; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.invoice_sequences (year, last_seq) FROM stdin;
2026	7
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.invoices (id, invoice_number, customerid, issue_date, due_date, subtotal, discount, tax_percent, tax_amount, total, status, notes, createdate, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	INV-1780942607479	1	2026-06-08	2026-06-09	4245.72	10.00	5.00	212.29	4448.01	draft	Test	2026-06-08 18:16:47.354152	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
2	INV-2026-000004	1	2026-07-11	2026-08-01	100.00	0.00	10.00	10.00	110.00	draft	Test	2026-07-11 12:43:58.502985	f	\N	\N	2026-07-11 18:43:58.502985+06	1	\N	\N
3	INV-2026-000005	1	2026-07-11	2026-08-15	100.00	5.00	0.00	0.00	95.00	draft		2026-07-11 12:43:59.129694	f	\N	\N	2026-07-11 18:43:59.129694+06	1	\N	\N
4	INV-2026-000006	1	2026-07-11	2026-07-14	374.00	10.00	2.00	7.48	371.48	draft	\N	2026-07-11 13:01:36.521714	f	\N	\N	2026-07-11 19:01:36.521714+06	1	\N	\N
5	INV-2026-000007	1	2026-07-24	2026-07-30	245.00	10.00	2.00	4.90	239.90	draft	\N	2026-07-24 20:04:51.767717	f	\N	\N	2026-07-24 20:04:51.767717+06	1	\N	\N
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.modules (id, module_name, display_name) FROM stdin;
1	products	Products
2	stocks	Stocks
3	categories	Categories
4	warehouse	Warehouses
5	orders	Purchase Orders
6	delivery	Deliveries
7	vendors	Vendors
8	customers	Customers
9	status	Status
10	dashboard	Dashboard
11	returns	Returns
12	stock_transfers	Stock Transfers
13	reports	Reports
\.


--
-- Data for Name: order_details; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.order_details (id, quantity, productid, unit_price, statusid, total_price, vendorid, createdate, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by, po_status, status_changed_by, status_changed_at, warehouseid) FROM stdin;
1	2.00	1	45000.00	1	90000.00	1	2026-05-31 01:26:10.163	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
2	10.00	53	499.23	1	4992.30	1	2026-06-21 01:13:47.046	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
3	5.00	61	35.00	1	175.00	1	2026-07-11 17:47:03.843	f	\N	\N	2026-07-11 17:47:04.721689+06	1	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
4	10.00	61	35.00	1	350.00	1	2026-07-11 17:47:50.348	f	\N	\N	2026-07-11 17:47:51.167616+06	1	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
5	102.00	58	2.00	1	204.00	1	2026-07-11 17:48:16.868	f	\N	\N	2026-07-11 17:48:17.664529+06	1	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
6	20.00	61	35.00	1	700.00	1	2026-07-11 18:31:59.401	f	\N	\N	2026-07-11 18:31:59.463004+06	1	2026-07-24 21:43:18.590436+06	\N	draft	\N	\N	1
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.payments (id, invoice_id, amount, method, transaction_id, paid_at, note, is_deleted, deleted_at, deleted_by, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.products (id, pcode, pname, pcate, price, createdate, updated_at, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_by, reorder_level) FROM stdin;
3	C-889	Fan	1	20000.00	2026-06-01 00:10:54.202	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
4	C-009	Oven	1	25000.00	2026-06-01 00:21:56.531	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
2	C-887	Fan	1	6000.00	2026-05-31 01:19:17.744	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
5	PRD-001	Laptop 1	2	778.00	2026-05-31 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
6	PRD-002	Mouse 2	3	717.51	2026-05-30 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
7	PRD-003	Keyboard 3	4	761.01	2026-05-29 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
8	PRD-004	Monitor 4	1	507.40	2026-05-28 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
9	PRD-005	Headset 5	2	17.88	2026-05-27 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
10	PRD-006	Webcam 6	3	107.74	2026-05-26 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
11	PRD-007	USB Hub 7	4	126.14	2026-05-25 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
12	PRD-008	SSD 8	1	764.00	2026-05-24 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
13	PRD-009	RAM 9	2	22.04	2026-05-23 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
14	PRD-010	Printer 10	3	618.51	2026-05-22 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
15	PRD-011	Scanner 11	4	460.64	2026-05-21 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
16	PRD-012	Router 12	1	68.05	2026-05-20 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
17	PRD-013	Switch 13	2	152.28	2026-05-19 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
18	PRD-014	Cable 14	3	352.10	2026-05-18 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
19	PRD-015	Charger 15	4	560.89	2026-05-17 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
20	PRD-016	Desk Lamp 16	1	508.75	2026-05-16 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
21	PRD-017	Speaker 17	2	375.67	2026-05-15 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
22	PRD-018	Microphone 18	3	57.21	2026-05-14 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
23	PRD-019	Tablet 19	4	645.34	2026-05-13 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
24	PRD-020	Phone 20	1	224.62	2026-05-12 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
25	PRD-021	Laptop 21	2	657.13	2026-05-11 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
26	PRD-022	Mouse 22	3	515.01	2026-05-10 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
27	PRD-023	Keyboard 23	4	367.40	2026-05-09 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
28	PRD-024	Monitor 24	1	177.94	2026-05-08 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
29	PRD-025	Headset 25	2	122.97	2026-05-07 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
30	PRD-026	Webcam 26	3	572.02	2026-05-06 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
31	PRD-027	USB Hub 27	4	536.05	2026-05-05 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
32	PRD-028	SSD 28	1	164.61	2026-05-04 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
33	PRD-029	RAM 29	2	797.08	2026-05-03 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
34	PRD-030	Printer 30	3	53.10	2026-05-02 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
35	PRD-031	Scanner 31	4	32.17	2026-05-01 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
36	PRD-032	Router 32	1	79.27	2026-04-30 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
37	PRD-033	Switch 33	2	658.15	2026-04-29 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
38	PRD-034	Cable 34	3	239.14	2026-04-28 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
39	PRD-035	Charger 35	4	930.04	2026-04-27 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
40	PRD-036	Desk Lamp 36	1	376.35	2026-04-26 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
41	PRD-037	Speaker 37	2	890.52	2026-04-25 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
42	PRD-038	Microphone 38	3	852.29	2026-04-24 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
43	PRD-039	Tablet 39	4	820.07	2026-04-23 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
44	PRD-040	Phone 40	1	95.51	2026-04-22 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
45	PRD-041	Laptop 41	2	965.03	2026-04-21 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
46	PRD-042	Mouse 42	3	658.07	2026-04-20 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
47	PRD-043	Keyboard 43	4	600.29	2026-04-19 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
48	PRD-044	Monitor 44	1	421.80	2026-04-18 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
49	PRD-045	Headset 45	2	264.53	2026-04-17 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
50	PRD-046	Webcam 46	3	821.59	2026-04-16 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
51	PRD-047	USB Hub 47	4	939.25	2026-04-15 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
52	PRD-048	SSD 48	1	293.99	2026-04-14 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
53	PRD-049	RAM 49	1	499.23	2026-04-13 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
54	PRD-050	Printer 50	1	745.08	2026-04-12 23:54:21.187845	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
55	PRD-051	Freez	1	4500.00	2026-06-03 23:32:24.864	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
56	PRD-052	Induction Oven	1	677.00	2026-07-10 00:53:32.417	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
57	PRD-053	Test	1	1.00	2026-07-11 03:20:29.232	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
58	PRD-054	Electric Oven	1	2.00	2026-07-11 03:29:00.443	\N	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	0
59	PRD-055	Kately	1	13.00	2026-07-11 16:17:13.491	2026-07-11 16:40:50.463963+06	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	1	0
60	PRD-056	Singara Machine	1	25.00	2026-07-11 16:42:49.225	\N	f	\N	\N	2026-07-11 16:42:49.29555+06	1	\N	0
61	PRD-057	Flusk	1	35.00	2026-07-11 16:48:40.206	2026-07-24 21:58:11.046356+06	f	\N	\N	2026-07-11 16:48:40.26742+06	1	1	5
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.returns (id, delivery_id, productid, qty, reason, status, createdate, is_deleted, deleted_at, deleted_by, created_by, updated_by, updated_at, status_changed_by, status_changed_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.role_permissions (id, role_id, module_id, can_view, can_create, can_update, can_delete) FROM stdin;
40	2	1	t	t	t	f
41	2	2	t	f	f	f
42	2	3	f	f	f	f
43	2	4	f	f	f	f
44	2	5	f	f	f	f
45	2	6	f	f	f	f
46	2	7	f	f	f	f
47	2	8	f	f	f	f
48	2	9	f	f	f	f
49	2	10	f	f	f	f
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.roles (id, role_name, description, created_at) FROM stdin;
1	super_admin	Full system access including user and role management	2026-06-05 20:15:06.520082
2	manager	he can edit	2026-06-05 20:18:07.620766
\.


--
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.status (id, status, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Sold	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.stock_movements (id, productid, warehouseid, change, reason, ref_type, ref_id, created_by, createdate) FROM stdin;
1	3	1	50	order	order_details	101	7	2026-07-11 17:21:37.991415+06
2	3	1	30	order	order_details	102	7	2026-07-11 17:21:38.115849+06
3	3	1	-10	delivery	delivery_details	55	7	2026-07-11 17:21:38.236937+06
4	3	1	-5	delivery	delivery_details	56	7	2026-07-11 17:21:38.356157+06
5	3	1	20	adjustment	stocks	10	7	2026-07-11 17:21:38.476069+06
6	61	1	5	order	order_details	3	1	2026-07-11 17:47:05.123424+06
7	61	1	10	order	order_details	4	1	2026-07-11 17:47:51.543392+06
8	58	1	102	order	order_details	5	1	2026-07-11 17:48:18.024014+06
9	61	1	-20	delivery	delivery_details	3	1	2026-07-11 17:50:00.232507+06
10	58	1	-5	delivery	delivery_details	4	1	2026-07-11 17:57:18.294637+06
11	61	1	20	order	order_details	6	1	2026-07-11 18:31:59.909773+06
12	61	1	-5	delivery	delivery_details	5	1	2026-07-11 18:32:47.925873+06
13	54	1	-10	delivery	delivery_details	6	1	2026-07-24 20:19:23.058049+06
14	61	1	-10	transfer	stock_transfers	1	1	2026-07-24 20:44:25.965297+06
15	61	2	10	transfer	stock_transfers	1	1	2026-07-24 20:44:25.965297+06
16	53	1	-4	delivery	delivery_details	7	1	2026-07-24 21:28:15.147148+06
21	61	2	-10	delivery	delivery_details	9	1	2026-07-24 21:53:09.884526+06
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.stock_transfers (id, from_warehouse, to_warehouse, productid, qty, status, createdate, is_deleted, deleted_at, deleted_by, created_by, updated_by, updated_at, status_changed_by, status_changed_at) FROM stdin;
1	1	2	61	10	approved	2026-07-24 20:44:00.043106+06	f	\N	\N	1	1	\N	1	2026-07-24 20:44:25.965297+06
\.


--
-- Data for Name: stocks; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.stocks (id, quantity, productid, warehouseid, updatedate, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
6	100.00	52	1	2026-07-05 22:44:06.559	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
7	197.00	58	1	2026-07-11 17:57:18.104	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-11 17:57:18.171816+06	\N
2	42.00	54	1	2026-07-24 20:19:23.055	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 20:19:23.055554+06	\N
8	0.00	61	1	2026-07-24 20:44:25.965297	f	\N	\N	2026-07-11 17:47:05.000663+06	\N	2026-07-24 20:44:25.965297+06	\N
5	1.00	53	1	2026-07-24 21:28:15.144	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	2026-07-24 21:28:15.14438+06	\N
9	0.00	61	2	2026-07-24 21:53:09.881	f	\N	\N	2026-07-24 20:44:25.965297+06	1	2026-07-24 21:53:09.882+06	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.users (id, full_name, email, password_hash, role_id, is_active, created_at, must_change_password, password_change_otp_hash, password_change_otp_expires_at) FROM stdin;
7	test2	shohabsikder1997@gmail.com	$2b$10$hzu8qbrYGCWb0hWfgJxyDesSael/l0o4ILdDhCCR5iQKtdvs4wTsK	2	t	2026-06-06 18:37:23.286193	f	\N	\N
8	test.user	shohabsikder4057@gmail.com	$2b$10$/2EIKoijGVPqHzg0p0Pvue3EmPgClqVi9K39p8cq7jvcAvxudPQ62	2	t	2026-06-20 18:53:48.488395	f	\N	\N
1	Shohab	admin@inventory.com	$2a$12$O6XOxzZ3PnGykGJb4fyjkOhRaRL5BzpqtSfTCkT7vUgrvfeNPwi4a	1	t	2026-06-05 20:15:14.369316	f	\N	\N
2	Test	test@gmail.com	$2b$10$JDVEl0hh2Ah55ltapohvfOjEQ3KC9D0uRTDk6c27D0NpJ7nvSkqU6	2	t	2026-06-05 20:18:33.959352	f	\N	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.vendors (id, address, cell, contact_person, company, email, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	ansercamp,Mirpur-1	01688132317	Rafi	Quatum	shohabsikder4057@gmail.com	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: ims
--

COPY public.warehouses (id, wname, is_deleted, deleted_at, deleted_by, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Rubin	f	\N	\N	2026-07-11 16:26:00.330505+06	\N	\N	\N
2	Fahim	f	\N	\N	2026-07-24 20:43:31.058508+06	1	\N	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: ims
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: ims
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-01 13:19:25.794295
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-01 13:19:25.844405
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-01 13:19:25.864364
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-01 13:19:25.892748
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-01 13:19:25.90742
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-01 13:19:25.913546
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-01 13:19:25.920622
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-01 13:19:25.927828
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-01 13:19:25.93376
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-01 13:19:25.940039
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-01 13:19:25.948619
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-01 13:19:25.955125
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-01 13:19:25.968027
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-01 13:19:25.974464
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-01 13:19:29.742427
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-01 13:19:29.797921
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-01 13:19:29.807175
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-01 13:19:29.825815
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-01 13:19:29.875425
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-01 13:19:29.881249
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-01 13:19:29.886523
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-01 13:19:29.891809
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-01 13:19:29.920034
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-01 13:19:29.931906
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-01 13:19:29.935236
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-01 13:19:29.939256
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-01 13:19:29.942658
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-01 13:19:29.945662
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-01 13:19:29.948578
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-01 13:19:29.951576
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-01 13:19:29.955496
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-01 13:19:29.958394
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-01 13:19:29.961458
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-01 13:19:29.964513
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-01 13:19:29.967324
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-01 13:19:29.970262
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-01 13:19:29.973257
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-01 13:19:29.976487
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-01 13:19:29.980319
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-01 13:19:29.99464
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-01 13:19:29.997714
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-01 13:19:30.000701
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-01 13:19:30.003863
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-01 13:19:30.006775
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-01 13:19:30.009994
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-01 13:19:30.013876
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-01 13:19:30.023172
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-01 13:19:30.027079
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-01 13:19:30.030258
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-01 13:19:30.0462
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-01 13:19:30.050143
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-01 13:19:30.069464
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-01 13:19:30.071344
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-01 13:19:30.079238
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-01 13:19:30.081374
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-01 13:19:30.082836
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-01 13:19:30.086882
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-01 13:19:30.091478
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-01 13:19:30.094894
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-01 13:19:30.098844
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-01 13:19:30.102268
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: ims
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: ims
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 79, true);


--
-- Name: book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.book_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, true);


--
-- Name: delivery_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.delivery_details_id_seq', 9, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 6, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.invoices_id_seq', 5, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.modules_id_seq', 13, true);


--
-- Name: order_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.order_details_id_seq', 7, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.products_id_seq', 62, true);


--
-- Name: returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.returns_id_seq', 1, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 49, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.status_id_seq', 1, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 21, true);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.stock_transfers_id_seq', 1, true);


--
-- Name: stocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.stocks_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ims
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 2, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: ims
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_details delivery_details_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_sequences invoice_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_sequences
    ADD CONSTRAINT invoice_sequences_pkey PRIMARY KEY (year);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: modules modules_module_name_key; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_module_name_key UNIQUE (module_name);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: order_details order_details_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_module_id_key; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_module_id_key UNIQUE (role_id, module_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: stocks stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: ims
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: ims
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: ims
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: ims
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: ims
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: ims
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: ims
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_al_created_at; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_al_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_al_entity_type; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_al_entity_type ON public.activity_logs USING btree (entity_type);


--
-- Name: idx_al_user_id; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_al_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_customers_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_customers_is_deleted ON public.customers USING btree (is_deleted);


--
-- Name: idx_delivery_details_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_delivery_details_is_deleted ON public.delivery_details USING btree (is_deleted);


--
-- Name: idx_invoice_items_invoiceid; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_invoice_items_invoiceid ON public.invoice_items USING btree (invoiceid);


--
-- Name: idx_invoices_customerid; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_invoices_customerid ON public.invoices USING btree (customerid);


--
-- Name: idx_invoices_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_invoices_is_deleted ON public.invoices USING btree (is_deleted);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_order_details_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_order_details_is_deleted ON public.order_details USING btree (is_deleted);


--
-- Name: idx_payments_invoice_id; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_payments_invoice_id ON public.payments USING btree (invoice_id);


--
-- Name: idx_products_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_products_is_deleted ON public.products USING btree (is_deleted);


--
-- Name: idx_products_pcode; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_products_pcode ON public.products USING btree (pcode);


--
-- Name: idx_returns_delivery_id; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_returns_delivery_id ON public.returns USING btree (delivery_id);


--
-- Name: idx_sm_createdate; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_sm_createdate ON public.stock_movements USING btree (createdate DESC);


--
-- Name: idx_sm_productid; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_sm_productid ON public.stock_movements USING btree (productid);


--
-- Name: idx_stock_transfers_productid; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_stock_transfers_productid ON public.stock_transfers USING btree (productid);


--
-- Name: idx_stocks_productid; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_stocks_productid ON public.stocks USING btree (productid);


--
-- Name: idx_vendors_is_deleted; Type: INDEX; Schema: public; Owner: ims
--

CREATE INDEX idx_vendors_is_deleted ON public.vendors USING btree (is_deleted);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: ims
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: ims
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: ims
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: ims
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: ims
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: ims
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: ims
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: ims
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: ims
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: ims
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: ims
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: products product; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER product AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: categories trg_audit_categories; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_categories AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: customers trg_audit_customers; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_customers AFTER INSERT OR DELETE OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: delivery_details trg_audit_delivery_details; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_delivery_details AFTER INSERT OR DELETE OR UPDATE ON public.delivery_details FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: invoice_items trg_audit_invoice_items; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_invoice_items AFTER INSERT OR DELETE OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: invoices trg_audit_invoices; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_invoices AFTER INSERT OR DELETE OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: order_details trg_audit_order_details; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_order_details AFTER INSERT OR DELETE OR UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: products trg_audit_products; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_products AFTER INSERT OR DELETE OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: status trg_audit_status; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_status AFTER INSERT OR DELETE OR UPDATE ON public.status FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: stocks trg_audit_stocks; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_stocks AFTER INSERT OR DELETE OR UPDATE ON public.stocks FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: vendors trg_audit_vendors; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_vendors AFTER INSERT OR DELETE OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: warehouses trg_audit_warehouses; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_audit_warehouses AFTER INSERT OR DELETE OR UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();


--
-- Name: categories trg_set_updated_at_categories; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: customers trg_set_updated_at_customers; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: delivery_details trg_set_updated_at_delivery_details; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_delivery_details BEFORE UPDATE ON public.delivery_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices trg_set_updated_at_invoices; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: order_details trg_set_updated_at_order_details; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_order_details BEFORE UPDATE ON public.order_details FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products trg_set_updated_at_products; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: status trg_set_updated_at_status; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_status BEFORE UPDATE ON public.status FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stocks trg_set_updated_at_stocks; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_stocks BEFORE UPDATE ON public.stocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: vendors trg_set_updated_at_vendors; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_vendors BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: warehouses trg_set_updated_at_warehouses; Type: TRIGGER; Schema: public; Owner: ims
--

CREATE TRIGGER trg_set_updated_at_warehouses BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: ims
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: ims
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: ims
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: ims
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: ims
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: ims
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: categories categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: categories categories_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: categories categories_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: customers customers_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: customers customers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: delivery_details delivery_details_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: delivery_details delivery_details_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: delivery_details delivery_details_status_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_status_changed_by_fkey FOREIGN KEY (status_changed_by) REFERENCES public.users(id);


--
-- Name: delivery_details delivery_details_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: delivery_details delivery_details_warehouseid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.delivery_details
    ADD CONSTRAINT delivery_details_warehouseid_fkey FOREIGN KEY (warehouseid) REFERENCES public.warehouses(id);


--
-- Name: invoice_items invoice_items_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: invoice_items invoice_items_invoiceid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoiceid_fkey FOREIGN KEY (invoiceid) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_productid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_productid_fkey FOREIGN KEY (productid) REFERENCES public.products(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_customerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customers(id);


--
-- Name: invoices invoices_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_details order_details_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_details order_details_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: order_details order_details_status_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_status_changed_by_fkey FOREIGN KEY (status_changed_by) REFERENCES public.users(id);


--
-- Name: order_details order_details_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_details order_details_warehouseid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.order_details
    ADD CONSTRAINT order_details_warehouseid_fkey FOREIGN KEY (warehouseid) REFERENCES public.warehouses(id);


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payments payments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: products products_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: products products_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: products products_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: returns returns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: returns returns_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: returns returns_delivery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.delivery_details(id);


--
-- Name: returns returns_productid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_productid_fkey FOREIGN KEY (productid) REFERENCES public.products(id);


--
-- Name: returns returns_status_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_status_changed_by_fkey FOREIGN KEY (status_changed_by) REFERENCES public.users(id);


--
-- Name: returns returns_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: role_permissions role_permissions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: status status_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: status status_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: status status_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_productid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_productid_fkey FOREIGN KEY (productid) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_warehouseid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_warehouseid_fkey FOREIGN KEY (warehouseid) REFERENCES public.warehouses(id) ON DELETE SET NULL;


--
-- Name: stock_transfers stock_transfers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_transfers stock_transfers_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: stock_transfers stock_transfers_from_warehouse_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_warehouse_fkey FOREIGN KEY (from_warehouse) REFERENCES public.warehouses(id);


--
-- Name: stock_transfers stock_transfers_productid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_productid_fkey FOREIGN KEY (productid) REFERENCES public.products(id);


--
-- Name: stock_transfers stock_transfers_status_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_status_changed_by_fkey FOREIGN KEY (status_changed_by) REFERENCES public.users(id);


--
-- Name: stock_transfers stock_transfers_to_warehouse_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_warehouse_fkey FOREIGN KEY (to_warehouse) REFERENCES public.warehouses(id);


--
-- Name: stock_transfers stock_transfers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: stocks stocks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stocks stocks_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: stocks stocks_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.stocks
    ADD CONSTRAINT stocks_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: vendors vendors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vendors vendors_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: vendors vendors_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: warehouses warehouses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: warehouses warehouses_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: warehouses warehouses_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ims
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: ims
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: ims
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: book; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.book ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: delivery_details; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.delivery_details ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_sequences; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- Name: order_details; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: status; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_movements; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: stocks; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: vendors; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

--
-- Name: warehouses; Type: ROW SECURITY; Schema: public; Owner: ims
--

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: ims
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: ims
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: ims
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO ims;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: ims
--

GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO ims;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: ims
--

GRANT USAGE ON SCHEMA realtime TO postgres;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: ims
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: ims
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: ims
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: ims
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: ims
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: ims
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: ims
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: ims
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: ims
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: ims
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: ims
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON TABLE realtime.messages TO postgres;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON TABLE realtime.subscription TO postgres;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: ims
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: ims
--

GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: ims
--

GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict eSnStznGNDLUQthzIeMZX7yZ74KWWDqcgUyNCG2phSsX9lA7n5FBfwRB7jiz7nM

