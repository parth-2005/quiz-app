-- This script creates demo data for testing

-- Create a demo teacher
INSERT INTO "Teacher" (id, name, email, password) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'teacher@example.com', '$2b$10$BvwaXSB2ye24WI.MKalLSeSQltj1TWSLCF772aPSa/i1ZICMxylYW')
ON CONFLICT DO NOTHING;

-- Create demo students
INSERT INTO "Student" (id, name, email, password, "rollNo") VALUES 
('650e8400-e29b-41d4-a716-446655440001', 'Alice Smith', 'alice@example.com', '$2b$10$BvwaXSB2ye24WI.MKalLSeSQltj1TWSLCF772aPSa/i1ZICMxylYW', 'A001'),
('650e8400-e29b-41d4-a716-446655440002', 'Bob Johnson', 'bob@example.com', '$2b$10$BvwaXSB2ye24WI.MKalLSeSQltj1TWSLCF772aPSa/i1ZICMxylYW', 'A002')
ON CONFLICT DO NOTHING;

-- Note: The password hash is for "password123"