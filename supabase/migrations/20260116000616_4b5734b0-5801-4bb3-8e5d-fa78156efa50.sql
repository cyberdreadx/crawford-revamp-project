-- Delete images for test listing
DELETE FROM property_images WHERE property_id = 'c179132b-d8d3-4307-b097-c14a573e9ad3';

-- Delete the test listing itself
DELETE FROM properties WHERE id = 'c179132b-d8d3-4307-b097-c14a573e9ad3';