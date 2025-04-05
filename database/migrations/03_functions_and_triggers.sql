-- Functions and Triggers Migration for Laundry Management System
-- This script adds database functions and triggers for automation

-- Function to generate task IDs
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.task_id := 'LT-' || TO_CHAR(NOW(), 'YYMM') || LPAD(NEXTVAL('task_id_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for task IDs if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS task_id_seq START 1;

-- Trigger to automatically generate task_id before insert
DROP TRIGGER IF EXISTS generate_task_id_trigger ON tasks;
CREATE TRIGGER generate_task_id_trigger
BEFORE INSERT ON tasks
FOR EACH ROW
WHEN (NEW.task_id IS NULL)
EXECUTE FUNCTION generate_task_id();

-- Function to update task status and set completed_at timestamp
CREATE OR REPLACE FUNCTION update_task_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set completed_at when status changes to completed
DROP TRIGGER IF EXISTS update_task_status_trigger ON tasks;
CREATE TRIGGER update_task_status_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION update_task_status();

-- Function to check inventory levels and log alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= NEW.minimum_level AND OLD.quantity > OLD.minimum_level THEN
    INSERT INTO inventory_alerts (inventory_item_id, alert_message, created_at)
    VALUES (NEW.id, 'Inventory item ' || NEW.name || ' has fallen below minimum level. Current: ' || NEW.quantity || ' ' || NEW.unit, CURRENT_TIMESTAMP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create inventory alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id),
  alert_message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to check inventory levels after update
DROP TRIGGER IF EXISTS check_inventory_levels_trigger ON inventory_items;
CREATE TRIGGER check_inventory_levels_trigger
AFTER UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_inventory_levels();

-- Function to calculate cost_per_kg automatically
CREATE OR REPLACE FUNCTION calculate_cost_per_kg()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_weight > 0 THEN
    NEW.cost_per_kg := NEW.total_cost / NEW.total_weight;
  ELSE
    NEW.cost_per_kg := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate cost_per_kg before insert or update
DROP TRIGGER IF EXISTS calculate_cost_per_kg_trigger ON cost_allocations;
CREATE TRIGGER calculate_cost_per_kg_trigger
BEFORE INSERT OR UPDATE OF total_cost, total_weight ON cost_allocations
FOR EACH ROW
EXECUTE FUNCTION calculate_cost_per_kg();

-- Function to set next maintenance date based on last maintenance
CREATE OR REPLACE FUNCTION set_next_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_maintenance IS NOT NULL AND (OLD.last_maintenance IS NULL OR NEW.last_maintenance <> OLD.last_maintenance) THEN
    -- Set next maintenance to 90 days after last maintenance
    NEW.next_maintenance := NEW.last_maintenance + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set next maintenance date automatically
DROP TRIGGER IF EXISTS set_next_maintenance_trigger ON equipment;
CREATE TRIGGER set_next_maintenance_trigger
BEFORE INSERT OR UPDATE OF last_maintenance ON equipment
FOR EACH ROW
EXECUTE FUNCTION set_next_maintenance();