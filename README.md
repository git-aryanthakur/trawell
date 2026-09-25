![TRAWELL Logo](./.github/agents/logo.svg)

# 🏔️ TRAWELL

Most travel apps point you to the crowded Mall Roads. We wanted to build something that takes you deeper. 

**TRAWELL** (Travel + Well) is a full-stack travel platform built specifically for the Indian Himalayas. It’s designed to help travelers find that hidden mud-house cafe in Palampur, explore border villages along the Line of Control in Kashmir, and—most importantly—figure out exactly what permits they need so they don't get turned around at an army checkpost. 

It’s part curated directory, part trip-planner, and entirely built for people who want to travel well and travel deep.

## ✨ Why We Built This (The Features)

*   **🗺️ Beyond the Tourist Traps:** We structured the database hierarchically (`State` → `District` → `Primary Hub` → `Sub-Place`). This means you don't just search for "Manali"; you can drill down to find specific hidden gems, ancient temples, or aesthetic cafes tucked away in the surrounding valleys.
*   **🚧 The "Permit Engine":** Mountain bureaucracy is confusing. The app features a conditional permit system. If a user clicks on a restricted area (like Spiti Valley, Gartang Gali, or Teetwal), the app instantly flags it and breaks down the exact permit required, where to get it, and how much it costs for both Indian and Foreign nationals.
*   **🎒 Build Your Own Journey:** A built-in itinerary engine lets users drag-and-drop these locations into customized, day-by-day trip schedules.
*   **☕ Vibes & Budgets:** Places aren't just listed; they are categorized (`HIDDEN_GEM`, `VIEWPOINT`, `CAFE_RESTAURANT`) and ranked with a custom `cheap_vibe_score` so backpackers and luxury travelers can find exactly what they're looking for.
*   **📸 Community Driven:** Full backend support for users to drop reviews, rate places, and upload their own photos.

## 📍 Where We've Mapped So Far

The database isn't just populated with generic data—it's highly curated. We've currently mapped the three major Himalayan states down to the village level:

*   **Jammu & Kashmir:** Extensive mapping beyond Srinagar. We've seeded deep border outposts like Gurez, Lolab Valley, Teetwal, and Keran.
*   **Himachal Pradesh:** Covers all 12 districts, the restricted zones of Spiti and Kinnaur, and features a massive, heavily detailed directory of the booming cafe culture in Palampur.
*   **Uttarakhand:** Complete coverage of both Garhwal and Kumaon, including remote Tibetan-border valleys like Niti and high-altitude national parks.

## 🛠️ What's Under the Hood?

*   **Frontend:** React / Next.js, Tailwind CSS (for that clean, airy UI), Lucide Icons
*   **Backend:** Node.js, Express.js
*   **Database:** Supabase (PostgreSQL) - strictly relational to handle the geographical nesting and spatial relationships.

## 🚀 What's Next?

The mountains keep calling. Here is what we are building next for TRAWELL:
*   **The North East Expansion:** Seeding data for Sikkim, Meghalaya, and Arunachal Pradesh.
*   **Zero-Network Offline Mode:** Payload syncing so travelers can download their itineraries and permit documents before heading into dead zones like Spiti or Gurez.
*   **"Near Me" Radar:** Using PostGIS spatial queries to alert users when they are within 5km of a hidden gem or a highly-rated local dhaba.
*   **Google Maps Sync:** One-click export of a daily itinerary straight into a Google Maps multi-stop route.

---
*Built with ❤️ for the Himalayas. Travel deep, travel well.*