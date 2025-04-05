-- Data Seeding Migration for Laundry Management System
-- This script adds initial sample data to the database

-- Admin user (password is admin123 - this would be hashed in production)
INSERT INTO users (username, password, name, role, email, phone)
VALUES ('admin', '$2a$10$rDJu0gTQhEVthYC8aLvSu.PgaNvztWvzNc4fKbPtk.PSz/0CPh8yq', 'Admin User', 'admin', 'admin@hospital.com', '9876543210')
ON CONFLICT (username) DO NOTHING;

-- Sample departments
INSERT INTO departments (name, location, contact_person, contact_email, contact_phone)
VALUES 
  ('General Ward', 'Block A, Ground Floor', 'Dr. Rajesh Kumar', 'rajesh@hospital.com', '9876543211'),
  ('ICU', 'Block B, First Floor', 'Dr. Priya Sharma', 'priya@hospital.com', '9876543212'),
  ('Operation Theater', 'Block C, Second Floor', 'Dr. Vikram Singh', 'vikram@hospital.com', '9876543213'),
  ('Pediatrics', 'Block D, Third Floor', 'Dr. Ananya Patel', 'ananya@hospital.com', '9876543214'),
  ('Maternity Ward', 'Block E, Fourth Floor', 'Dr. Meera Reddy', 'meera@hospital.com', '9876543215')
ON CONFLICT (name) DO NOTHING;

-- Sample inventory items
INSERT INTO inventory_items (name, category, unit, quantity, minimum_level, unit_cost, location, supplier)
VALUES
  ('Detergent Powder', 'Cleaning Agents', 'kg', 100.0, 20.0, 50.0, 'Store Room A', 'CleanChem Ltd.'),
  ('Fabric Softener', 'Cleaning Agents', 'liters', 50.0, 10.0, 80.0, 'Store Room A', 'SoftFab Inc.'),
  ('Bleach', 'Cleaning Agents', 'liters', 30.0, 5.0, 45.0, 'Store Room B', 'CleanChem Ltd.'),
  ('Disinfectant', 'Cleaning Agents', 'liters', 40.0, 8.0, 120.0, 'Store Room B', 'MedClean Supplies'),
  ('Cotton Bedsheets', 'Linen', 'pieces', 200.0, 50.0, 250.0, 'Linen Storage', 'TextilePro Ltd.'),
  ('Pillow Covers', 'Linen', 'pieces', 150.0, 40.0, 100.0, 'Linen Storage', 'TextilePro Ltd.'),
  ('Towels', 'Linen', 'pieces', 180.0, 45.0, 120.0, 'Linen Storage', 'ComfortLinen Inc.'),
  ('Surgical Gowns', 'Medical Wear', 'pieces', 100.0, 25.0, 350.0, 'Medical Storage', 'MedApparels Ltd.'),
  ('Patient Gowns', 'Medical Wear', 'pieces', 120.0, 30.0, 200.0, 'Medical Storage', 'MedApparels Ltd.'),
  ('Laundry Bags', 'Accessories', 'pieces', 80.0, 20.0, 150.0, 'Store Room C', 'BagMakers Inc.')
ON CONFLICT DO NOTHING;

-- Sample equipment
INSERT INTO equipment (name, type, status, notes)
VALUES
  ('Washer 1', 'washer', 'available', 'Industrial grade washing machine'),
  ('Washer 2', 'washer', 'available', 'Industrial grade washing machine'),
  ('Dryer 1', 'dryer', 'available', 'High capacity tumble dryer'),
  ('Dryer 2', 'dryer', 'available', 'High capacity tumble dryer'),
  ('Sterilizer 1', 'sterilizer', 'available', 'Medical-grade sterilization unit'),
  ('Folding Machine', 'folding', 'available', 'Automatic laundry folder'),
  ('Iron Press 1', 'press', 'available', 'Industrial steam press'),
  ('Iron Press 2', 'press', 'available', 'Industrial steam press')
ON CONFLICT DO NOTHING;

-- Sample laundry processes
INSERT INTO laundry_processes (name, description, duration, temperature, detergent_amount, softener_amount, disinfectant_amount, is_active)
VALUES
  ('Standard Wash', 'Regular washing process for general items', 45, 60, 50.0, 25.0, 0.0, TRUE),
  ('Heavy-Duty Wash', 'For heavily soiled items', 60, 70, 75.0, 25.0, 0.0, TRUE),
  ('Delicate Wash', 'For gentle washing of delicate fabrics', 30, 40, 30.0, 30.0, 0.0, TRUE),
  ('Sterilization', 'Full sterilization process for surgical items', 90, 85, 50.0, 0.0, 75.0, TRUE),
  ('Quick Wash', 'Fast washing cycle for lightly soiled items', 25, 50, 30.0, 15.0, 0.0, TRUE)
ON CONFLICT DO NOTHING;