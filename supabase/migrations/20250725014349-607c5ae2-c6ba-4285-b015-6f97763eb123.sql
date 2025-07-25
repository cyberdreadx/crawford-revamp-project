-- First, clear existing sample data
DELETE FROM property_images;
DELETE FROM properties;

-- Insert all 19 real Crawford Team properties
INSERT INTO properties (
  title, location, price, bedrooms, bathrooms, sqft, year_built, 
  property_type, status, description, key_features, taxes, flood_zone, is_featured
) VALUES 
-- Property 1
('Charming Coastal Retreat', '6730 10th Avenue Ter S, St. Petersburg, FL 33707', 210000, 2, 1, 886, 1953, 'House', 'For Sale', 'Not Substantially Damaged! Welcome to one of St. Pete''s most charming pockets, this property is just a short jaunt to St. Pete Beach, Treasure Island, near sunny parks, and close to the heart of downtown.', '{"AE Flood Zone","Stucco & Wood Frame","Fully Fenced Yard","Screened Porch"}', 1371, 'AE', true),

-- Property 2
('Updated Duplex Rental', '7116/7120 Oakwood Dr, New Port Richey, FL 34652', 1400, 2, 1, 825, 1981, 'House', 'For Rent', 'Now leasing a beautifully updated 2-bedroom, 1-bathroom duplex in the heart of New Port Richey! Modern kitchen with soft-close cabinets, granite countertops, and fresh interior paint.', '{"Modern Kitchen","Granite Counters","Pet Friendly","Near Downtown"}', NULL, NULL, false),

-- Property 3
('Furnished Rainbow Lakes Rental', '21078 SW Honeysuckle St, Dunnellon, FL 34431', 1750, 3, 2, 1395, 1969, 'House', 'For Rent', 'Charming Mid-Century Gem in Rainbow Lakes Estates – Fully Furnished & Move-In Ready! Perfect turnkey seasonal retreat or investment property.', '{"Fully Furnished","2-Car Garage","Fireplace","Near Rainbow Springs"}', NULL, NULL, false),

-- Property 4
('Rainbow Lakes Paradise', '21078 SW Honeysuckle St, Dunnellon, FL 34431', 250000, 3, 2, 1395, 1969, 'House', 'For Sale', 'Charming Mid-Century Gem in Rainbow Lakes Estates – Fully Furnished & Move-In Ready! Perfect turnkey home, seasonal retreat, or investment property.', '{"Fully Furnished","2-Car Garage","Fireplace","Near Rainbow Springs"}', 657, 'X', true),

-- Property 5
('Charming Gulfport Duplex', '2808 56th St S, Gulfport, FL 33707', 2100, 2, 1, 850, 1928, 'House', 'For Rent', 'Charming Gulfport rental available now! This 2BR/1BA unit in a 1928 duplex offers approx. 850 sq ft with a split bedroom layout, ceiling fans, and a welcoming front porch.', '{"Historic Duplex","Front Porch","Pet Friendly","Near Waterfront"}', NULL, NULL, false),

-- Property 6
('Corner Lot Gem Near 4th Street', '5700 Pacific St N, St. Petersburg, FL 33703', 375000, 2, 1, 936, 1973, 'House', 'For Sale', 'Charming Corner Lot Home Near 4th St Corridor – Move-In Ready! Recently updated with new roof (2019), electrical panel (2022), and HVAC (2022).', '{"Corner Lot","Recent Updates","No Hurricane Damage","Climate-Controlled Garage"}', 2216, 'AE', true),

-- Property 7
('Double Lot Investment Opportunity', '3102 57th St S, Gulfport, FL 33707', 500000, 3, 2, 1495, 1949, 'House', 'For Sale', 'INVESTORS, BUILDERS, DREAMERS.... This is the OPPORTUNITY you''ve been waiting for! A DOUBLE LOT in the HEART OF GULFPORT! The existing structure was flooded during Hurricane Helene and needs to be removed.', '{"Double Lot","Development Opportunity","Heart of Gulfport","Multiple Permitted Uses"}', 10583, 'AE', true),

-- Property 8
('West Shore Village Villa', '3146 37th Ln S #A, St. Petersburg, FL 33711', 270000, 2, 2, 1100, 1983, 'Condo', 'For Sale', 'Welcome to West Shore Village — where comfort meets convenience in a vibrant, resort-style gated community for all ages! This single-story, villa-style condo with a private garage has been extensively upgraded.', '{"$40K Recent Upgrades","Gated Community","Private Garage","Resort Amenities"}', 3923, 'X', false),

-- Property 9
('Gulf Coast Estates Duplex', '7116/7120 Oakwood Dr, New Port Richey, FL 34652', 315000, 4, 2, 1650, 1981, 'House', 'For Sale', 'Welcome to your Gulf Coast Estates investment! Turnkey and cash-flow ready, this updated duplex offers an exceptional opportunity for investors or house-hackers seeking a low-maintenance, income-generating asset.', '{"Turnkey Investment","Updated Units","Strong Rental Demand","Low Maintenance"}', 5408, NULL, false),

-- Property 10
('Custom Brookwood Home', '941 65th St S, St. Petersburg, FL 33707', 465000, 3, 2, 1670, 1952, 'House', 'For Sale', 'Live the Florida lifestyle in this beautifully maintained 3-bedroom, 2-bath home ideally situated just minutes from the vibrant Gulfport Arts District, the sandy Gulf Beaches, and only 15 minutes to downtown St. Petersburg.', '{"Custom Built","RV Parking","Tropical Backyard","Impact Windows"}', 2493, 'X', true),

-- Property 11
('Gulfport Entertainer''s Dream', '6114 7th Ave S, Gulfport, FL 33707', 699999, 4, 2, 2004, 1957, 'House', 'For Sale', 'NEW PRICE ~ NEW ROOF ~ NEW HVAC ~ Schedule your showing for this Gulfport Gem TODAY! Tucked into Gulfport''s desirable Stetson neighborhood, this deceptively spacious 4-bedroom, 2-bath home offers over 2,000 sq ft of character.', '{"New Roof & HVAC 2025","Hardwood Floors","Gas Fireplace","2-Car Garage"}', 2903, 'X', true),

-- Property 12
('West Shore Village Corner Unit', '3268 39th St S #A, St. Petersburg, FL 33711', 265000, 2, 2, 1175, 1973, 'Condo', 'For Sale', 'Welcome to Your Slice of Paradise in West Shore Village! Experience the perfect combination of privacy, comfort, and resort-style living in this beautifully maintained single-story, villa-style condo.', '{"Corner Unit","Fully Furnished","New Roof 2024","Nature Preserve Access"}', 3366, 'X', false),

-- Property 13
('Bermuda Bay Beach Condo', '3595 41st Ln S #L, St. Petersburg, FL 33711', 225000, 2, 2, 1100, 1974, 'Condo', 'For Sale', 'Move-in Ready | Clean, Bright, & Full of Coastal Charm. Located on the second floor of a two-story building, this home offers a spacious open-concept layout filled with natural light.', '{"Private Beach Access","Resort Amenities","2 Heated Pools","Boat Ramp"}', 4489, 'AE', false),

-- Property 14
('Waterfront Renovation Opportunity', '328 Tallahassee Dr NE, St. Petersburg, FL 33702', 270000, 3, 2, 1329, 1962, 'House', 'For Sale', 'Waterfront Opportunity – Gutted and Ready for Your Vision! This 3 bed, 2 bath block home with a 1-car garage sits directly on a serene pond in the highly desirable Sun-Lit Shores neighborhood.', '{"Waterfront on Pond","Gutted to Studs","1-Car Garage","Investment Potential"}', 2211, 'AE', false),

-- Property 15
('Custom Home on 17th Green', '2613 59th St S, Gulfport, FL 33707', 1100000, 3, 3, 2270, 1992, 'House', 'For Sale', 'One-of-a-Kind Custom Home on the 17th Green of Pasadena Yacht & Country Club. Custom-built in 1992 by its original builder-owner and packed with thoughtful upgrades and luxurious features.', '{"Golf Course Views","Paid Solar Panels","3 Elevated Decks","2024 Generator"}', 7749, 'AE', true),

-- Property 16
('Broadwater Waterfront Estate', '4490 38th Way S, St. Petersburg, FL 33711', 1295000, 3, 2, 2382, 1970, 'Estate', 'For Sale', 'Welcome to waterfront living at its finest in Broadwater - St Pete''s highest elevated waterfront community! NO FLOODING - NO DAMAGE from the 2024 hurricane season!', '{"Direct Gulf Access","30'' Dock","Private Pool","No Hurricane Damage"}', 21546, 'A', true),

-- Property 17
('Bayway Isles Water View Condo', '5220 Brittany Dr S #210, St. Petersburg, FL 33715', 235000, 2, 2, 1175, 1972, 'Condo', 'For Sale', 'CORNER UNIT WITH WATER VIEWS + DEEDED PARKING! Rarely available corner unit with sparkling water views and a deeded parking spot. Welcome to Point Brittany, a vibrant 55+ resort-style community.', '{"Corner Unit","Water Views","55+ Community","4 Heated Pools"}', 1129, 'AE', false),

-- Property 18
('Furnished Gulfport Bungalow', '2808 Clinton St S, Gulfport, FL 33707', 2200, 2, 1, 840, 1948, 'House', 'For Rent', 'Escape to this bright and fully furnished 2BR/1BA bungalow in the heart of Gulfport! Just steps from the beach and a short walk to top local spots like Pia''s, Tommy''s Hideaway, and North End Taphouse.', '{"Fully Furnished","Steps to Beach","Private Herb Garden","Includes Internet"}', NULL, NULL, false),

-- Property 19
('Town Shores 55+ Condo', '2960 59th St S #509, Gulfport, FL 33707', 165000, 1, 1, 815, 1973, 'Condo', 'For Sale', 'Come Live Your Best Chapter at Town Shores, an active, 55+ condo community in the waterfront town of Gulfport. Move-in ready environment, pool views and a covered parking spot.', '{"55+ Community","4 Heated Pools","Marina Views","Covered Parking"}', 819, 'AE', false);