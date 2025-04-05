-- 02_views_and_triggers.sql
-- Create functions, triggers and views for the Laundry Management System

-- Create task ID generation function and trigger
CREATE OR REPLACE FUNCTION generate_task_id() RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  department_prefix TEXT;
  sequence_number INT;
  new_task_id TEXT;
BEGIN
  -- Get the year prefix (last 2 digits of current year)
  year_prefix := to_char(CURRENT_DATE, 'YY');
  
  -- Get the department prefix (first 2 chars of department name)
  SELECT UPPER(SUBSTRING(name FROM 1 FOR 2)) INTO department_prefix
  FROM departments
  WHERE id = NEW.department_id;
  
  IF department_prefix IS NULL THEN
    department_prefix := 'XX';
  END IF;
  
  -- Get next sequence number for this department and year
  SELECT COALESCE(MAX(SUBSTRING(task_id FROM 8)::INT), 0) + 1 INTO sequence_number
  FROM tasks
  WHERE task_id LIKE year_prefix || '-' || department_prefix || '-%';
  
  -- Create new task ID in format: YY-DE-NNNN (year-department-sequence)
  new_task_id := year_prefix || '-' || department_prefix || '-' || LPAD(sequence_number::TEXT, 4, '0');
  
  -- Set the new task_id
  NEW.task_id := new_task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_task_id_trigger ON tasks;

CREATE TRIGGER generate_task_id_trigger
BEFORE INSERT ON tasks
FOR EACH ROW
WHEN (NEW.task_id IS NULL)
EXECUTE FUNCTION generate_task_id();

-- Create task status update trigger
CREATE OR REPLACE FUNCTION update_task_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_task_status_trigger ON tasks;

CREATE TRIGGER update_task_status_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_status();

-- Create inventory alerts table and trigger
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER REFERENCES inventory_items(id),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION check_inventory_levels() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_quantity <= NEW.reorder_threshold AND 
      (OLD.current_quantity IS NULL OR OLD.current_quantity > OLD.reorder_threshold) THEN
    INSERT INTO inventory_alerts (inventory_item_id, alert_type, message)
    VALUES (NEW.id, 'low_stock', 'Item is below reorder threshold');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_inventory_levels_trigger ON inventory_items;

CREATE TRIGGER check_inventory_levels_trigger
AFTER UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_inventory_levels();

-- Create views for reporting
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id, 
  t.task_id,
  t.description,
  t.status,
  t.priority,
  t.created_at,
  t.completed_at,
  t.department_id,
  d.name AS department_name,
  t.requested_by_id,
  u1.name AS requested_by_name,
  t.assigned_to_id,
  u2.name AS assigned_to_name,
  t.weight
FROM 
  tasks t
  LEFT JOIN departments d ON t.department_id = d.id
  LEFT JOIN users u1 ON t.requested_by_id = u1.id
  LEFT JOIN users u2 ON t.assigned_to_id = u2.id;

-- Equipment status view
CREATE OR REPLACE VIEW equipment_status_view AS
SELECT 
  e.id,
  e.name,
  e.type,
  e.status,
  e.location,
  e.last_maintenance,
  e.next_maintenance,
  CASE 
    WHEN e.next_maintenance < CURRENT_DATE THEN 'overdue'
    WHEN e.next_maintenance < CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
    ELSE 'ok'
  END AS maintenance_status
FROM 
  equipment e;

-- Inventory status view
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
  i.id,
  i.name,
  i.category,
  i.current_quantity,
  i.unit,
  i.reorder_threshold,
  i.last_restocked,
  CASE 
    WHEN i.current_quantity <= i.reorder_threshold * 0.5 THEN 'critical'
    WHEN i.current_quantity <= i.reorder_threshold THEN 'low'
    ELSE 'ok'
  END AS stock_status
FROM 
  inventory_items i;

-- Department workload view
CREATE OR REPLACE VIEW department_workload AS
SELECT 
  d.id,
  d.name,
  COUNT(t.id) AS total_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
  SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) AS delayed_tasks,
  COALESCE(SUM(t.weight), 0) AS total_weight_kg
FROM 
  departments d
  LEFT JOIN tasks t ON d.id = t.department_id
GROUP BY 
  d.id, d.name;

-- Monthly cost report view
CREATE OR REPLACE VIEW monthly_cost_report AS
SELECT 
  DATE_TRUNC('month', ca.period_start) AS month,
  d.id AS department_id,
  d.name AS department_name,
  SUM(ca.amount) AS total_cost,
  SUM(ca.weight_kg) AS total_weight_kg,
  CASE 
    WHEN SUM(ca.weight_kg) > 0 
    THEN SUM(ca.amount) / SUM(ca.weight_kg) 
    ELSE 0 
  END AS avg_cost_per_kg
FROM 
  cost_allocations ca
  JOIN departments d ON ca.department_id = d.id
GROUP BY 
  DATE_TRUNC('month', ca.period_start),
  d.id,
  d.name
ORDER BY 
  month DESC, total_cost DESC;
