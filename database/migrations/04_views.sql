-- Views Migration for Laundry Management System
-- This script creates useful database views for reporting

-- View for task details with related information
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id,
  t.task_id,
  t.description,
  t.status,
  t.priority,
  t.weight,
  t.due_date,
  t.created_at,
  t.completed_at,
  t.notes,
  d.name AS department_name,
  d.location AS department_location,
  requester.name AS requested_by_name,
  requester.username AS requested_by_username,
  assignee.name AS assigned_to_name,
  assignee.username AS assigned_to_username,
  CASE 
    WHEN t.status = 'completed' THEN TRUE
    WHEN t.due_date < CURRENT_TIMESTAMP AND t.status != 'completed' THEN TRUE
    ELSE FALSE
  END AS is_overdue,
  CASE
    WHEN t.completed_at IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 -- hours
    ELSE
      NULL
  END AS processing_time_hours
FROM 
  tasks t
  JOIN departments d ON t.department_id = d.id
  JOIN users requester ON t.requested_by_id = requester.id
  LEFT JOIN users assignee ON t.assigned_to_id = assignee.id;

-- View for equipment status with maintenance information
CREATE OR REPLACE VIEW equipment_status_view AS
SELECT
  e.id,
  e.name,
  e.type,
  e.status,
  e.last_maintenance,
  e.next_maintenance,
  e.time_remaining,
  e.notes,
  CASE
    WHEN e.next_maintenance IS NOT NULL AND e.next_maintenance < CURRENT_TIMESTAMP THEN TRUE
    ELSE FALSE
  END AS maintenance_overdue,
  CASE
    WHEN e.next_maintenance IS NOT NULL THEN 
      EXTRACT(DAY FROM (e.next_maintenance - CURRENT_TIMESTAMP)) 
    ELSE NULL
  END AS days_until_maintenance
FROM
  equipment e;

-- View for inventory status with alerts
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT
  i.id,
  i.name,
  i.category,
  i.unit,
  i.quantity,
  i.minimum_level,
  i.unit_cost,
  i.location,
  i.supplier,
  i.last_restocked,
  i.notes,
  (i.quantity * i.unit_cost) AS total_value,
  CASE
    WHEN i.quantity <= i.minimum_level THEN TRUE
    ELSE FALSE
  END AS needs_restock,
  CASE
    WHEN i.quantity <= i.minimum_level THEN 
      (i.minimum_level - i.quantity) 
    ELSE 0
  END AS restock_amount
FROM
  inventory_items i;

-- View for department workload
CREATE OR REPLACE VIEW department_workload AS
SELECT
  d.id,
  d.name,
  COUNT(t.id) AS total_tasks,
  SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
  SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) AS delayed_tasks,
  SUM(CASE 
    WHEN t.due_date < CURRENT_TIMESTAMP AND t.status != 'completed' THEN 1 
    ELSE 0 
  END) AS overdue_tasks,
  COALESCE(AVG(
    CASE
      WHEN t.completed_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 -- hours
      ELSE NULL
    END
  ), 0) AS avg_processing_time_hours
FROM
  departments d
  LEFT JOIN tasks t ON d.id = t.department_id
GROUP BY
  d.id, d.name;

-- View for monthly cost reports
CREATE OR REPLACE VIEW monthly_cost_report AS
SELECT
  ca.month,
  d.name AS department_name,
  ca.total_weight,
  ca.total_cost,
  ca.cost_per_kg,
  ca.created_at
FROM
  cost_allocations ca
  JOIN departments d ON ca.department_id = d.id
ORDER BY
  ca.month DESC, d.name;