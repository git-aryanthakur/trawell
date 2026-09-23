const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get all States (First step in the user journey)
app.get('/api/states', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM states ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while fetching states" });
    }
});

// 2. Get Districts for a specific State
app.get('/api/states/:stateId/districts', async (req, res) => {
    try {
        const { stateId } = req.params;
        const result = await pool.query(
            'SELECT * FROM districts WHERE state_id = $1 ORDER BY name ASC', 
            [stateId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while fetching districts" });
    }
});

// 3. Get Primary Places for a specific District (e.g., Kasol, Cherrapunji)
app.get('/api/districts/:districtId/places', async (req, res) => {
    try {
        const { districtId } = req.params;
        const result = await pool.query(
            'SELECT * FROM primary_places WHERE district_id = $1 ORDER BY name ASC', 
            [districtId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while fetching places" });
    }
});

// 4. Get Categorized Subplaces (The core Hidden Gems & Cafes engine)
app.get('/api/places/:placeId/subplaces', async (req, res) => {
    try {
        const { placeId } = req.params;

        const query = `
            WITH review_seasons AS (
                SELECT
                    sub_place_id,
                    COUNT(*) AS total_reviews,
                    SUM(CASE WHEN LOWER(comment) ~ '(winter|december|january|february|snow|cold weather)' THEN 1 ELSE 0 END) AS winter_reviews,
                    SUM(CASE WHEN LOWER(comment) ~ '(spring|march|april|may|pleasant weather|bloom|fresh air)' THEN 1 ELSE 0 END) AS spring_reviews,
                    SUM(CASE WHEN LOWER(comment) ~ '(summer|june|july|august|sunny|heat|summer vacation|peak season)' THEN 1 ELSE 0 END) AS summer_reviews,
                    SUM(CASE WHEN LOWER(comment) ~ '(monsoon|rain|rainy season|lush|waterfall|mist|cloudy)' THEN 1 ELSE 0 END) AS monsoon_reviews,
                    SUM(CASE WHEN LOWER(comment) ~ '(autumn|september|october|november|golden|cooler weather|fall)' THEN 1 ELSE 0 END) AS autumn_reviews
                FROM reviews
                GROUP BY sub_place_id
            )
            SELECT 
                sp.category,
                json_agg(
                    json_build_object(
                        'id', sp.id,
                        'name', sp.name,
                        'distance_km', sp.distance_from_primary_km,
                        'cheap_vibe_score', sp.cheap_vibe_score,
                        'description', sp.description,
                        'lat', sp.lat,
                        'lng', sp.lng,
                        'review_count', COALESCE(rs.total_reviews, 0),
                        'best_season', CASE
                            WHEN COALESCE(rs.monsoon_reviews, 0) >= COALESCE(rs.spring_reviews, 0)
                             AND COALESCE(rs.monsoon_reviews, 0) >= COALESCE(rs.summer_reviews, 0)
                             AND COALESCE(rs.monsoon_reviews, 0) >= COALESCE(rs.autumn_reviews, 0)
                             AND COALESCE(rs.monsoon_reviews, 0) >= COALESCE(rs.winter_reviews, 0) THEN 'Monsoon'
                            WHEN COALESCE(rs.summer_reviews, 0) >= COALESCE(rs.spring_reviews, 0)
                             AND COALESCE(rs.summer_reviews, 0) >= COALESCE(rs.autumn_reviews, 0)
                             AND COALESCE(rs.summer_reviews, 0) >= COALESCE(rs.winter_reviews, 0)
                             AND COALESCE(rs.summer_reviews, 0) >= COALESCE(rs.monsoon_reviews, 0) THEN 'Summer'
                            WHEN COALESCE(rs.spring_reviews, 0) >= COALESCE(rs.summer_reviews, 0)
                             AND COALESCE(rs.spring_reviews, 0) >= COALESCE(rs.autumn_reviews, 0)
                             AND COALESCE(rs.spring_reviews, 0) >= COALESCE(rs.winter_reviews, 0)
                             AND COALESCE(rs.spring_reviews, 0) >= COALESCE(rs.monsoon_reviews, 0) THEN 'Spring'
                            WHEN COALESCE(rs.autumn_reviews, 0) >= COALESCE(rs.spring_reviews, 0)
                             AND COALESCE(rs.autumn_reviews, 0) >= COALESCE(rs.summer_reviews, 0)
                             AND COALESCE(rs.autumn_reviews, 0) >= COALESCE(rs.winter_reviews, 0)
                             AND COALESCE(rs.autumn_reviews, 0) >= COALESCE(rs.monsoon_reviews, 0) THEN 'Autumn'
                            WHEN COALESCE(rs.winter_reviews, 0) >= COALESCE(rs.spring_reviews, 0)
                             AND COALESCE(rs.winter_reviews, 0) >= COALESCE(rs.summer_reviews, 0)
                             AND COALESCE(rs.winter_reviews, 0) >= COALESCE(rs.autumn_reviews, 0)
                             AND COALESCE(rs.winter_reviews, 0) >= COALESCE(rs.monsoon_reviews, 0) THEN 'Winter'
                            ELSE 'Spring'
                        END
                    ) ORDER BY sp.distance_from_primary_km ASC
                ) AS items
            FROM sub_places sp
            LEFT JOIN review_seasons rs ON rs.sub_place_id = sp.id
            WHERE sp.primary_place_id = $1
            GROUP BY sp.category;
        `;

        const result = await pool.query(query, [placeId]);

        const categorizedResponse = {};
        result.rows.forEach(row => {
            categorizedResponse[row.category.toLowerCase()] = row.items;
        });

        res.json(categorizedResponse);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while fetching subplaces" });
    }
});

// ==========================================
// ITINERARY ENGINE ROUTES (PHASE 1)
// ==========================================

// 1. Create a new Trip
app.post('/api/trips', async (req, res) => {
    try {
        const { user_id, title, start_date, end_date } = req.body;
        
        const result = await pool.query(
            `INSERT INTO trips (user_id, title, start_date, end_date) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, title, start_date, end_date]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating trip:", err.message);
        res.status(500).json({ error: "Failed to create trip" });
    }
});

// 2. Delete a trip and its planned stops
app.delete('/api/trips/:tripId', async (req, res) => {
    const client = await pool.connect();
    try {
        const { tripId } = req.params;
        await client.query('BEGIN');
        await client.query('DELETE FROM trip_items WHERE trip_id = $1', [tripId]);
        const result = await client.query('DELETE FROM trips WHERE id = $1 RETURNING id', [tripId]);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Trip not found" });
        }
        await client.query('COMMIT');
        res.status(204).send();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error deleting trip:", err.message);
        res.status(500).json({ error: "Failed to delete trip" });
    } finally {
        client.release();
    }
});

// 3. Add a Subplace (Hidden Gem/Cafe) to a Trip
app.post('/api/trips/:tripId/items', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { sub_place_id, visit_date, notes } = req.body;

        const result = await pool.query(
            `INSERT INTO trip_items (trip_id, sub_place_id, visit_date, notes) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [tripId, sub_place_id, visit_date, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        // Catch the UNIQUE constraint violation if they add the same place twice
        if (err.code === '23505') {
            return res.status(409).json({ error: "Place is already in this trip" });
        }
        console.error("Error adding trip item:", err.message);
        res.status(500).json({ error: "Failed to add item to trip" });
    }
});

// 3. Move an itinerary item to another day
app.patch('/api/trips/:tripId/items/:itemId', async (req, res) => {
    try {
        const { tripId, itemId } = req.params;
        const { visit_date } = req.body;
        const result = await pool.query(
            `UPDATE trip_items
             SET visit_date = $1
             WHERE id = $2 AND trip_id = $3
             RETURNING *`,
            [visit_date, itemId, tripId]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Trip item not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error moving trip item:", err.message);
        res.status(500).json({ error: "Failed to move trip item" });
    }
});

// 4. Remove an itinerary item
app.delete('/api/trips/:tripId/items/:itemId', async (req, res) => {
    try {
        const { tripId, itemId } = req.params;
        const result = await pool.query(
            'DELETE FROM trip_items WHERE id = $1 AND trip_id = $2 RETURNING id',
            [itemId, tripId]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Trip item not found" });
        res.status(204).send();
    } catch (err) {
        console.error("Error removing trip item:", err.message);
        res.status(500).json({ error: "Failed to remove trip item" });
    }
});

// 5. Get all Trips for a User (with nested items)
app.get('/api/users/:userId/trips', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                t.id AS trip_id,
                t.title,
                t.start_date,
                t.end_date,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'item_id', ti.id,
                            'sub_place_id', sp.id,
                            'name', sp.name,
                            'category', sp.category,
                            'distance_km', sp.distance_from_primary_km,
                            'lat', sp.lat,
                            'lng', sp.lng,
                            'visit_date', ti.visit_date,
                            'notes', ti.notes
                        ) ORDER BY ti.visit_date ASC
                    ) FILTER (WHERE ti.id IS NOT NULL), '[]'
                ) AS itinerary_items
            FROM trips t
            LEFT JOIN trip_items ti ON t.id = ti.trip_id
            LEFT JOIN sub_places sp ON ti.sub_place_id = sp.id
            WHERE t.user_id = $1
            GROUP BY t.id
            ORDER BY t.created_at DESC;
        `;

        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching trips:", err.message);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
});

// ==========================================
// REVIEWS & PHOTO UPLOADS ENGINE (PHASE 3)
// ==========================================
const multer = require('multer');
const path = require('path');

// Configure local storage for uploaded travel photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure an 'uploads' directory exists in your backend root folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Serve the uploads folder statically so the frontend can render the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Get all reviews for a specific sub-place
app.get('/api/subplaces/:subPlaceId/reviews', async (req, res) => {
    try {
        const { subPlaceId } = req.params;
        const result = await pool.query(
            `SELECT r.*, u.name as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.sub_place_id = $1 
             ORDER BY r.created_at DESC`,
            [subPlaceId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching reviews:", err.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// 2. Post a review with an optional photo upload
app.post('/api/subplaces/:subPlaceId/reviews', upload.single('photo'), async (req, res) => {
    try {
        const { subPlaceId } = req.params;
        const { user_id, rating, comment } = req.body;
        
        // Construct public URL if a photo was attached
        const photoUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

        const result = await pool.query(
            `INSERT INTO reviews (sub_place_id, user_id, rating, comment, photo_url) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [subPlaceId, user_id, rating, comment, photoUrl]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error posting review:", err.message);
        res.status(500).json({ error: "Failed to post review" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});