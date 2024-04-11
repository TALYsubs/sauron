-- Create or replace the general log_insert function to handle delete actions
CREATE OR REPLACE FUNCTION log_insert()
RETURNS TRIGGER AS $$
DECLARE
    logging_table_name text := TG_ARGV[0];
    action_type text := TG_ARGV[1];
    current_record json;
BEGIN
    IF action_type = 'delete' THEN
        current_record := row_to_json(OLD);
    ELSE
        current_record := row_to_json(NEW);
    END IF;

    EXECUTE format('INSERT INTO %I (record, action, actor, action_time) VALUES ($1, $2, $3, NOW())', logging_table_name)
    USING current_record, action_type, COALESCE(NEW.actor, OLD.actor); -- use actor from NEW if it exists, otherwise from OLD

    IF action_type = 'delete' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- Create triggers that use log_insert function
DO $$ 
DECLARE 
    table_name text;
    log_table_name text;
BEGIN
    -- Loop through all tables in the current schema
    FOR table_name IN (
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ) 
    LOOP
        RAISE NOTICE 'Processing table: %', table_name;
        log_table_name := table_name || '_log';
        
        -- Check if the log table exists
        IF EXISTS (
            SELECT 1 
            FROM pg_catalog.pg_tables 
            WHERE tablename = log_table_name 
                AND schemaname NOT IN ('pg_catalog', 'information_schema')
        ) THEN
            RAISE NOTICE 'Creating triggers for table: %', table_name;

            -- Drop the existing insert trigger if it already exists
            EXECUTE 'DROP TRIGGER IF EXISTS ' || table_name || '_insert_trigger ON "' || table_name || '";';
            
            -- Create the new insert trigger
            EXECUTE 'CREATE TRIGGER ' || table_name || '_insert_trigger' || 
                    ' AFTER INSERT ON "' || table_name || '"' || 
                    ' FOR EACH ROW EXECUTE FUNCTION log_insert(''' || log_table_name || ''', ''insert'');';

            -- Drop the existing update trigger if it already exists
            EXECUTE 'DROP TRIGGER IF EXISTS ' || table_name || '_update_trigger ON "' || table_name || '";';

            -- Create the new update trigger
            EXECUTE 'CREATE TRIGGER ' || table_name || '_update_trigger' ||
                    ' AFTER UPDATE ON "' || table_name || '"' ||
                    ' FOR EACH ROW EXECUTE FUNCTION log_insert(''' || log_table_name || ''', ''update'');';

            -- Drop the existing delete trigger if it already exists
            EXECUTE 'DROP TRIGGER IF EXISTS ' || table_name || '_delete_trigger ON "' || table_name || '";';

            -- Create the new delete trigger
            EXECUTE 'CREATE TRIGGER ' || table_name || '_delete_trigger' ||
                    ' AFTER DELETE ON "' || table_name || '"' ||
                    ' FOR EACH ROW EXECUTE FUNCTION log_insert(''' || log_table_name || ''', ''delete'');';
        ELSE
            RAISE NOTICE 'Log table does not exist for table: %', table_name;
            
            -- Drop the insert trigger if it exists when log table doesn't exist
            EXECUTE 'DROP TRIGGER IF EXISTS ' || table_name || '_insert_trigger ON "' || table_name || '";';
        END IF;
    END LOOP;
END $$;
