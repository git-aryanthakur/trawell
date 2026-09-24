"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// --- Mapbox Imports ---
import Map, { Layer, Marker, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const API_URL = "http://localhost:5000/api";
const DUMMY_USER_ID = "fa44cde0-aaa7-4a66-8d3c-8b36bb36fee5"; 

const categories = [
  { key: "hidden_gem", label: "Hidden gems", icon: "✦", tone: "emerald" },
  { key: "cafe_restaurant", label: "Cafes & eats", icon: "☕", tone: "amber" },
  { key: "viewpoint", label: "Viewpoints", icon: "◉", tone: "violet" },
  { key: "cultural", label: "Culture", icon: "⌂", tone: "sky" },
];

const mapCategoryMeta = {
  hidden_gem: { icon: "✦", accent: "#8de7c5", background: "rgba(16, 62, 50, 0.95)" },
  cafe_restaurant: { icon: "☕", accent: "#f5c26b", background: "rgba(68, 48, 14, 0.95)" },
  viewpoint: { icon: "◉", accent: "#bca3ff", background: "rgba(29, 23, 49, 0.95)" },
  cultural: { icon: "⌂", accent: "#7cc5ff", background: "rgba(18, 39, 56, 0.95)" },
};

const travelImages = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=900&q=85",
];

const travelVideos = [
  "https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/857195/857195-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4434249/4434249-hd_1920_1080_25fps.mp4",
];

function videoFor(index = 0) {
  return travelVideos[Math.abs(index) % travelVideos.length];
}

const locationImages = {
  "chalal village": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=90",
  "kasol": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90",
  "parvati valley": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=90",
  "manali": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=90",
  "leh": "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=90",
  "ladakh": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=90",
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=90",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=90",
  "udaipur": "https://images.unsplash.com/photo-1582972236019-ea9f7c7a3f37?auto=format&fit=crop&w=1200&q=90",
  "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=90",
};

const himachalDistrictImages = {
  "bilaspur": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90",
  "chamba": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=90",
  "hamirpur": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=90",
  "kangra": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=90",
  "kinnaur": "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=90",
  "kullu": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=90",
  "lahaul and spiti": "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=90",
  "mandi": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=90",
  "shimla": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=90",
  "sirmaur": "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=90",
  "solan": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90",
  "una": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=90",
};

const uttarakhandDistrictImages = {
  "almora": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=90",
  "bageshwar": "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=90",
  "chamoli": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=90",
  "champawat": "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=1200&q=90",
  "dehradun": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=90",
  "haridwar": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=90",
  "nainital": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=90",
  "pauri garhwal": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=90",
  "pithoragarh": "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=90",
  "rudraprayag": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=90",
  "tehri garhwal": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=90",
  "udham singh nagar": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=90",
  "uttarkashi": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=90",
};

const cafeAndTrailImages = [
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=90",
];

function imageFor(index = 0, label = "") {
  const text = label.toLowerCase();
  const exactMatch = Object.entries(locationImages).find(([name]) => text.includes(name));
  if (exactMatch) return exactMatch[1];
  const districtMatch = Object.entries(himachalDistrictImages).find(([name]) => text.includes(name));
  if (districtMatch) return districtMatch[1];
  const uttarakhandMatch = Object.entries(uttarakhandDistrictImages).find(([name]) => text.includes(name));
  if (uttarakhandMatch) return uttarakhandMatch[1];
  if (text.includes("mountain") || text.includes("himachal") || text.includes("ladakh") || text.includes("sikkim")) return travelImages[0];
  if (text.includes("beach") || text.includes("coast") || text.includes("goa") || text.includes("kerala")) return travelImages[2];
  if (text.includes("fort") || text.includes("palace") || text.includes("rajasthan")) return travelImages[1];
  if (text.includes("forest") || text.includes("wildlife") || text.includes("valley")) return travelImages[5];
  return travelImages[index % travelImages.length];
}

function imageForPlace(index, place, context = "") {
  const apiImage = place?.image_url || place?.photo_url || place?.image || place?.photo || place?.thumbnail || place?.cover_image;
  if (apiImage) return apiImage;
  const label = `${place?.name || ""} ${place?.description || ""} ${context}`;
  const knownImage = imageFor(index, label);
  const hasKnownImage = Object.keys(locationImages).some((name) => label.toLowerCase().includes(name))
    || Object.keys(himachalDistrictImages).some((name) => label.toLowerCase().includes(name))
    || Object.keys(uttarakhandDistrictImages).some((name) => label.toLowerCase().includes(name));
  if (hasKnownImage) return knownImage;
  return cafeAndTrailImages[Math.abs(Number(place?.id) || index) % cafeAndTrailImages.length];
}

function entityImage(index, entity, context = "") {
  const apiImage = entity?.image_url || entity?.photo_url || entity?.image || entity?.photo || entity?.thumbnail || entity?.cover_image;
  return apiImage || imageForPlace(index, entity, context);
}

function permitData(place) {
  const required = place?.requires_permit ?? place?.permit_required ?? place?.ilp_required;
  if (!required) return null;

  return {
    details: place.permit_details || place.permit_name || "Check the local authority requirements before travelling.",
    indianFee: place.permit_fee_indian ?? place.permit_amount_indian ?? "See authority",
    foreignFee: place.permit_fee_foreigner ?? place.permit_amount_foreign ?? "See authority"
  };
}

const researchedSeasonGuides = [
  { match: /amarnath/, season: "July to August", reason: "The annual pilgrimage window is set by the shrine board and the high route is open only seasonally." },
  { match: /valley of flowers|hemkund/, season: "July to September", reason: "The alpine trail and wildflower meadows are accessible in the short summer window." },
  { match: /gulmarg/, season: "December to March", reason: "This is the reliable snow and skiing season; April to June is better for green meadows." },
  { match: /auli/, season: "January to March", reason: "Winter gives Auli its ski conditions; April to June is clearer for views without snow." },
  { match: /badrinath|kedarnath|gangotri|yamunotri/, season: "May to June and September to October", reason: "The pilgrimage roads and high-altitude shrines are most accessible in the pre-monsoon and post-monsoon windows." },
  { match: /chitkul|kalpa/, season: "April to June and September to October", reason: "Road access, clear mountain views, and comfortable daytime temperatures are strongest in these months." },
  { match: /kaza|keylong/, season: "May to October", reason: "The high-altitude roads are generally most accessible after winter and before heavy snowfall." },
  { match: /spiti|kinnaur/, season: "April to June and September to October", reason: "These shoulder seasons balance open roads, clear skies, and manageable temperatures." },
  { match: /pahalgam|sonamarg|gurez/, season: "May to October", reason: "The valleys are most accessible after snowmelt and before the winter closure." },
  { match: /dharamshala|mcleod|kangra|palampur|bir billing/, season: "March to June and September to November", reason: "Spring, autumn, and the clear post-monsoon period offer the best combination of weather and visibility." },
  { match: /dalhousie|khajjiar|chamba|manali|kasol|barot|prashar|narkanda|kasauli|shimla|nahan/, season: "March to June and September to November", reason: "The hill stations are clearest and most comfortable before the monsoon and after the rains." },
  { match: /uttarakhand|mussoorie|nainital|almora|ranikhet|kausani|munsiyari|chopta|lansdowne|chakrata|uttarkashi|chamoli|rudraprayag|tehri|pauri|pithoragarh|bageshwar|dehradun|haridwar|udham|champawat/, season: "March to June and September to November", reason: "These months generally provide the clearest roads, pleasant temperatures, and better mountain visibility." },
  { match: /jammu|kashmir|pahalgam|srinagar|sonamarg|gurez|doodhpathri|yusmarg|bangus|patnitop|anantnag|bandipora|baramulla|budgam|ganderbal|kupwara|pulwama|shopian|udhampur|reasi/, season: "April to June and September to November", reason: "Spring and autumn bring clearer skies and easier access than the peak winter and monsoon periods." },
  { match: /himachal|lahaul|kullu|mandi|sirmaur|solan|una|bilaspur|hamirpur/, season: "March to June and September to November", reason: "The most dependable travel conditions are in spring, early summer, and the post-monsoon autumn period." }
];

function bestTimeToVisitText(item, contextPlaceName = "") {
  const name = item?.name || "this stop";
  const haystack = `${name} ${contextPlaceName}`.toLowerCase();
  const reviewSeason = item?.best_season || item?.preferred_season || item?.reviewed_in;
  const researchedGuide = researchedSeasonGuides.find(({ match }) => match.test(haystack));

  if (researchedGuide) {
    return { season: researchedGuide.season, line: `Best time: ${researchedGuide.season} for ${name} — ${researchedGuide.reason}` };
  }

  if (reviewSeason) {
    return { season: reviewSeason, line: `Best time: ${reviewSeason} for ${name} — based on the available traveler-season data.` };
  }

  return null;
}

function Spinner({ light = false }) {
  return <span className={`spinner ${light ? "spinner-light" : ""}`} aria-label="Loading" />;
}

function todayTripDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FALLBACK_TRIP_DATE = todayTripDate();

function normalizeTripDate(value) {
  const candidate = String(value || "").slice(0, 10);
  const date = new Date(`${candidate}T12:00:00`);
  return Number.isNaN(date.getTime()) ? FALLBACK_TRIP_DATE : candidate;
}

function dateAfter(startDate, days) {
  const date = new Date(`${normalizeTripDate(startDate)}T12:00:00`);
  date.setDate(date.getDate() + Number(days) - 1);
  return date.toISOString().slice(0, 10);
}

function tripDays(startDate, duration) {
  const safeStartDate = normalizeTripDate(startDate);
  return Array.from({ length: Number(duration) || 1 }, (_, index) => {
    const date = new Date(`${safeStartDate}T12:00:00`);
    date.setDate(date.getDate() + index);
    return { day: index + 1, date: date.toISOString().slice(0, 10) };
  });
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${normalizeTripDate(date)}T12:00:00`));
}

function dayForTripItem(item, startDate) {
  if (item.day) return Number(item.day);
  if (!item.visit_date) return 1;
  const difference = new Date(`${normalizeTripDate(item.visit_date)}T12:00:00`) - new Date(`${normalizeTripDate(startDate)}T12:00:00`);
  return Math.max(1, Math.round(difference / 86400000) + 1);
}

function orderStops(stops, stopOrder = []) {
  const order = new globalThis.Map(stopOrder.map((itemId, index) => [String(itemId), index]));
  return [...stops].sort((first, second) => (order.get(String(first.item_id)) ?? Number.MAX_SAFE_INTEGER) - (order.get(String(second.item_id)) ?? Number.MAX_SAFE_INTEGER));
}

function haversineKm(first, second) {
  const earthRadiusKm = 6371;
  const latitudeDelta = (Number(second.lat) - Number(first.lat)) * Math.PI / 180;
  const longitudeDelta = (Number(second.lng) - Number(first.lng)) * Math.PI / 180;
  const latitudeOne = Number(first.lat) * Math.PI / 180;
  const latitudeTwo = Number(second.lat) * Math.PI / 180;
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatMinutes(minutes) {
  const roundedMinutes = Math.max(1, Math.round(minutes));
  const hours = Math.floor(roundedMinutes / 60);
  return hours ? `${hours} hr ${roundedMinutes % 60} min` : `${roundedMinutes} min`;
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);
  
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [subplaces, setSubplaces] = useState(null);
  const [subplacesLoading, setSubplacesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hidden_gem");
  const [selectedMapSpot, setSelectedMapSpot] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [activeTrip, setActiveTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [tripMeta, setTripMeta] = useState({ title: "My Epic Journey", startDate: FALLBACK_TRIP_DATE, duration: 5, notes: "" });
  const [routeEstimate, setRouteEstimate] = useState({ loading: false, distanceKm: 0, durationMinutes: 0, stops: 0, source: "" });
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: "", startDate: FALLBACK_TRIP_DATE, duration: 5 });

  // --- REVIEWS & PHOTOS STATE ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubPlace, setSelectedSubPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // --- Map State ---
  const [viewState, setViewState] = useState({
    longitude: 77.3150, 
    latitude: 32.0100,  
    zoom: 13
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("wanderwise-theme");
    const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const themeTimer = setTimeout(() => setTheme(savedTheme || preferredTheme), 0);
    return () => clearTimeout(themeTimer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("wanderwise-theme", theme);
  }, [theme]);

  useEffect(() => {
    axios.get(`${API_URL}/states`)
      .then(({ data }) => setStates(data))
      .catch((error) => console.error("Error fetching states:", error))
      .finally(() => setStatesLoading(false));
  }, []);

  useEffect(() => {
    const orderedStops = [...(activeTrip?.itinerary_items || [])]
      .sort((first, second) => dayForTripItem(first, tripMeta.startDate) - dayForTripItem(second, tripMeta.startDate));
    const points = orderedStops.filter(stop => Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng)));

    if (points.length < 2) {
      const resetTimer = setTimeout(() => setRouteEstimate({ loading: false, distanceKm: 0, durationMinutes: 0, stops: points.length, source: "" }), 0);
      return () => clearTimeout(resetTimer);
    }

    let fallbackDistance = 0;
    for (let index = 1; index < points.length; index += 1) fallbackDistance += haversineKm(points[index - 1], points[index]);
    const fallbackEstimate = {
      loading: Boolean(MAPBOX_TOKEN),
      distanceKm: fallbackDistance * 1.35,
      durationMinutes: (fallbackDistance * 1.35 / 35) * 60,
      stops: points.length,
      source: "straight-line estimate"
    };
    const fallbackTimer = setTimeout(() => setRouteEstimate(fallbackEstimate), 0);

    if (!MAPBOX_TOKEN) return () => clearTimeout(fallbackTimer);
    let cancelled = false;
    const coordinates = points.map(point => `${Number(point.lng)},${Number(point.lat)}`).join(";");
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?alternatives=false&geometries=geojson&overview=false&access_token=${MAPBOX_TOKEN}`)
      .then(response => response.json())
      .then(data => {
        if (cancelled || !data.routes?.[0]) return;
        const route = data.routes[0];
        setRouteEstimate({ loading: false, distanceKm: route.distance / 1000, durationMinutes: route.duration / 60, stops: points.length, source: "Mapbox driving route" });
      })
      .catch(() => {
        if (!cancelled) setRouteEstimate({ ...fallbackEstimate, loading: false });
      });

    return () => { cancelled = true; clearTimeout(fallbackTimer); };
  }, [activeTrip, tripMeta.startDate]);

  useEffect(() => {
    if (!selectedMapSpot?.lat || !selectedMapSpot?.lng || !selectedPlace?.lat || !selectedPlace?.lng) {
      return undefined;
    }

    let cancelled = false;
    const start = `${Number(selectedPlace.lng)},${Number(selectedPlace.lat)}`;
    const end = `${Number(selectedMapSpot.lng)},${Number(selectedMapSpot.lat)}`;
    const fallbackRoute = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[Number(selectedPlace.lng), Number(selectedPlace.lat)], [Number(selectedMapSpot.lng), Number(selectedMapSpot.lat)]] },
      properties: {}
    };

    if (!MAPBOX_TOKEN) return undefined;

    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?alternatives=false&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const route = data.routes?.[0];
        setSelectedRoute(route ? {
          geometry: { type: "Feature", geometry: route.geometry, properties: {} },
          distanceKm: (route.distance / 1000).toFixed(1),
          durationMinutes: Math.round(route.duration / 60),
          loading: false
        } : { geometry: fallbackRoute, distanceKm: selectedMapSpot.distance_km, loading: false, fallback: true });
      })
      .catch(() => {
        if (!cancelled) setSelectedRoute({ geometry: fallbackRoute, distanceKm: selectedMapSpot.distance_km, loading: false, fallback: true });
      });

    return () => { cancelled = true; };
  }, [selectedMapSpot, selectedPlace]);

  useEffect(() => {
    const setupTrip = async () => {
      try {
        const { data: trips } = await axios.get(`${API_URL}/users/${DUMMY_USER_ID}/trips`);
        
        if (trips.length > 0) {
          setTrips(trips);
          setActiveTrip(trips[0]);
          const savedMeta = JSON.parse(localStorage.getItem(`wanderwise-trip-${trips[0].trip_id || trips[0].id}`) || "null");
          const duration = savedMeta?.duration || Math.max(1, Math.round((new Date(trips[0].end_date) - new Date(trips[0].start_date)) / 86400000) + 1);
          setTripMeta({ title: trips[0].title, startDate: normalizeTripDate(trips[0].start_date), duration, notes: savedMeta?.notes || "", stopOrder: savedMeta?.stopOrder || [] });
          if (trips[0].itinerary_items) {
             const itemIds = new Set(trips[0].itinerary_items.map(i => i.sub_place_id));
             setAddedItems(itemIds);
          }
        } else {
          const { data: newTrip } = await axios.post(`${API_URL}/trips`, {
            user_id: DUMMY_USER_ID,
            title: "My Epic Journey",
            start_date: FALLBACK_TRIP_DATE,
            end_date: dateAfter(FALLBACK_TRIP_DATE, 15)
          });
          setTrips([newTrip]);
          setActiveTrip(newTrip);
          setTripMeta({ title: newTrip.title, startDate: normalizeTripDate(newTrip.start_date), duration: 15, notes: "", stopOrder: [] });
        }
      } catch (error) {
        console.error("Error setting up itinerary:", error);
      }
    };
    setupTrip();
  }, []);

  useEffect(() => {
    if (!scrollTarget) return undefined;

    const scrollTimer = setTimeout(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollTarget(null);
    }, 80);

    return () => clearTimeout(scrollTimer);
  }, [scrollTarget]);

  const persistTripMeta = (nextMeta, trip = activeTrip) => {
    setTripMeta(nextMeta);
    if (trip) localStorage.setItem(`wanderwise-trip-${trip.trip_id || trip.id}`, JSON.stringify(nextMeta));
  };

  const handleSelectTrip = (trip) => {
    setActiveTrip(trip);
    setAddedItems(new Set((trip.itinerary_items || []).map(item => item.sub_place_id)));
    const savedMeta = JSON.parse(localStorage.getItem(`wanderwise-trip-${trip.trip_id || trip.id}`) || "null");
    const duration = savedMeta?.duration || Math.max(1, Math.round((new Date(trip.end_date) - new Date(trip.start_date)) / 86400000) + 1);
    setTripMeta({ title: trip.title, startDate: normalizeTripDate(trip.start_date), duration, notes: savedMeta?.notes || "", stopOrder: savedMeta?.stopOrder || [] });
    setSelectedDay(1);
  };

  const handleCreateTrip = async (event) => {
    event.preventDefault();
    const title = newTrip.title.trim() || "Untitled escape";
    const payload = { user_id: DUMMY_USER_ID, title, start_date: newTrip.startDate, end_date: dateAfter(newTrip.startDate, newTrip.duration) };
    setIsCreatingTrip(true);
    try {
      const { data } = await axios.post(`${API_URL}/trips`, payload);
      setTrips(prev => [data, ...prev]);
      setActiveTrip(data);
      setAddedItems(new Set());
      persistTripMeta({ title, startDate: newTrip.startDate, duration: Number(newTrip.duration), notes: "", stopOrder: [] }, data);
      setIsCreatingTrip(false);
      setShowNewTrip(false);
      setNewTrip({ title: "", startDate: newTrip.startDate, duration: 5 });
    } catch (error) {
      console.error("Error creating trip:", error);
      setIsCreatingTrip(false);
      alert("Could not create a new trip right now.");
    }
  };

  const handleDeleteTrip = async (trip) => {
    if (!window.confirm(`Delete ${trip.title || "this trip"} and all its planned stops?`)) return;
    const tripId = trip.trip_id || trip.id;
    try {
      await axios.delete(`${API_URL}/trips/${tripId}`);
      const remainingTrips = trips.filter(item => (item.trip_id || item.id) !== tripId);
      setTrips(remainingTrips);
      localStorage.removeItem(`wanderwise-trip-${tripId}`);
      if ((activeTrip?.trip_id || activeTrip?.id) === tripId) {
        const nextTrip = remainingTrips[0];
        if (nextTrip) handleSelectTrip(nextTrip);
        else {
          setActiveTrip(null);
          setAddedItems(new Set());
          setTripMeta({ title: "", startDate: FALLBACK_TRIP_DATE, duration: 1, notes: "", stopOrder: [] });
        }
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Could not delete this trip. Please try again.");
    }
  };

  const handleStateClick = async (state) => {
    if (selectedState?.id === state.id) return;
    setSelectedState(state);
    setSelectedDistrict(null);
    setDistricts([]);
    setSelectedPlace(null);
    setPlaces([]);
    setSubplaces(null);
    setScrollTarget("district-selection");
    setDistrictsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/states/${state.id}/districts`);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setDistrictsLoading(false);
    }
  };

  const handleDistrictClick = async (district) => {
    if (selectedDistrict?.id === district.id) return;
    setSelectedDistrict(district);
    setSelectedPlace(null);
    setPlaces([]);
    setSubplaces(null);
    setScrollTarget("places-selection");
    setPlacesLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/districts/${district.id}/places`);
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setPlacesLoading(false);
    }
  };

  const handlePlaceClick = async (place) => {
    if (selectedPlace?.id === place.id) return;
    setSelectedPlace(place);
    setSelectedMapSpot(null);
    setSelectedRoute(null);
    setScrollTarget("shortlist");
    if (place.lat && place.lng) {
      setViewState({
        longitude: Number(place.lng),
        latitude: Number(place.lat),
        zoom: 13
      });
    }
    setSubplaces(null);
    setSubplacesLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/places/${place.id}/subplaces`);
      setSubplaces(data);
      const firstAvailable = categories.find(({ key }) => data[key]);
      if (firstAvailable) setActiveTab(firstAvailable.key);
    } catch (error) {
      console.error("Error fetching subplaces:", error);
    } finally {
      setSubplacesLoading(false);
    }
  };

  const handleAddToTrip = async (subPlace) => {
    if (!activeTrip) return alert("Trip is still loading...");
    if (addedItems.has(subPlace.id)) return; 

    const currentTripId = activeTrip.trip_id || activeTrip.id;
    try {
      const { data: createdItem } = await axios.post(`${API_URL}/trips/${currentTripId}/items`, {
        sub_place_id: subPlace.id,
        visit_date: tripDays(tripMeta.startDate, tripMeta.duration)[selectedDay - 1]?.date || tripMeta.startDate,
        notes: `Exploring ${subPlace.name}`
      });
      
      setAddedItems(prev => new Set(prev).add(subPlace.id));
      
      setActiveTrip(prev => ({
        ...prev,
        itinerary_items: [
          ...(prev.itinerary_items || []),
          {
            item_id: createdItem?.id || Date.now(), 
            sub_place_id: subPlace.id,
            name: subPlace.name,
            category: subPlace.category,
            distance_km: subPlace.distance_from_primary_km || subPlace.distance_km,
            notes: `Exploring ${subPlace.name}`,
            day: selectedDay,
            lat: subPlace.lat,
            lng: subPlace.lng,
            visit_date: tripDays(tripMeta.startDate, tripMeta.duration)[selectedDay - 1]?.date || tripMeta.startDate
          }
        ]
      }));
    } catch (error) {
      console.error("Error adding to trip:", error);
      alert("Failed to add place to trip.");
    }
  };

  const handleMoveTripItem = async (item, day) => {
    const nextDay = Number(day);
    const visitDate = activeTripDays[nextDay - 1]?.date || tripMeta.startDate;
    const currentTripId = activeTrip.trip_id || activeTrip.id;
    try {
      await axios.patch(`${API_URL}/trips/${currentTripId}/items/${item.item_id}`, { visit_date: visitDate });
      setActiveTrip(prev => ({
        ...prev,
        itinerary_items: (prev.itinerary_items || []).map(stop => stop.item_id === item.item_id ? { ...stop, day: nextDay, visit_date: visitDate } : stop)
      }));
    } catch (error) {
      console.error("Error moving trip item:", error);
      alert("Could not move this stop. Please try again.");
    }
  };

  const handleSwapTripItem = (item, direction) => {
    const dayStops = orderStops(activeDayStops, tripMeta.stopOrder);
    const currentIndex = dayStops.findIndex(stop => stop.item_id === item.item_id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= dayStops.length) return;

    const reorderedDayStops = [...dayStops];
    [reorderedDayStops[currentIndex], reorderedDayStops[targetIndex]] = [reorderedDayStops[targetIndex], reorderedDayStops[currentIndex]];
    const dayStopIds = new Set(dayStops.map(stop => String(stop.item_id)));
    const nextOrder = [
      ...(tripMeta.stopOrder || []).filter(itemId => !dayStopIds.has(String(itemId))),
      ...reorderedDayStops.map(stop => stop.item_id)
    ];
    persistTripMeta({ ...tripMeta, stopOrder: nextOrder });
  };

  const handleRemoveTripItem = async (item) => {
    if (!window.confirm(`Remove ${item.name} from this trip?`)) return;
    const currentTripId = activeTrip.trip_id || activeTrip.id;
    try {
      await axios.delete(`${API_URL}/trips/${currentTripId}/items/${item.item_id}`);
      setActiveTrip(prev => ({ ...prev, itinerary_items: (prev.itinerary_items || []).filter(stop => stop.item_id !== item.item_id) }));
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(item.sub_place_id);
        return next;
      });
    } catch (error) {
      console.error("Error removing trip item:", error);
      alert("Could not remove this stop. Please try again.");
    }
  };

  const handleMapSpotClick = (spot) => {
    setSelectedMapSpot(spot);
    setSelectedRoute({
      geometry: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [[Number(selectedPlace.lng), Number(selectedPlace.lat)], [Number(spot.lng), Number(spot.lat)]] },
        properties: {}
      },
      distanceKm: spot.distance_km,
      loading: Boolean(MAPBOX_TOKEN),
      fallback: true
    });
  };

  // --- Review Handlers ---
  const handleOpenReviews = async (subPlace) => {
    setSelectedSubPlace(subPlace);
    setIsReviewModalOpen(true);
    setReviewsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/subplaces/${subPlace.id}/reviews`);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubPlace) return;

    setSubmittingReview(true);
    const formData = new FormData();
    formData.append("user_id", DUMMY_USER_ID);
    formData.append("rating", newRating);
    formData.append("comment", newComment);
    if (newPhoto) {
      formData.append("photo", newPhoto);
    }

    try {
      const { data: createdReview } = await axios.post(
        `${API_URL}/subplaces/${selectedSubPlace.id}/reviews`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setReviews([createdReview, ...reviews]);
      setNewComment("");
      setNewPhoto(null);
      setNewRating(5);
    } catch (error) {
      console.error("Error posting review:", error);
      alert("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const step = selectedPlace ? 4 : selectedDistrict ? 3 : selectedState ? 2 : 1;
  const scrollToJourney = () => document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  const activeTripDays = tripDays(tripMeta.startDate, tripMeta.duration);
  const activeDayStops = orderStops(activeTrip?.itinerary_items?.filter(stop => dayForTripItem(stop, tripMeta.startDate) === selectedDay) || [], tripMeta.stopOrder);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>Wanderwise</span></div>
        <nav className="topbar-nav" aria-label="Primary navigation">
          <a href="#journey">Discover</a>
          <a href="#shortlist">Shortlist</a>
        </nav>
        <div className="flex gap-4 items-center">
            <div className="topbar-note"><span className="live-dot" /> For the beautifully lost</div>
            <button type="button" className="theme-toggle" onClick={() => setTheme(currentTheme => currentTheme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
              <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            </button>
            {activeTrip && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="trip-button text-sm font-bold border border-white/40 rounded-full px-4 py-1.5 hover:bg-white/10 transition shadow-sm text-white bg-black/20 backdrop-blur-md"
                >
                    View Trip ({addedItems.size})
                </button>
            )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=2200&q=90"
          >
            <source src={travelVideos[1]} type="video/mp4" />
          </video>
          <div className="hero-stars" aria-hidden="true" />
        </div>
        <div className="hero-content">
          <div className="hero-kicker"><span className="pulse-ring" /> A field guide for curious souls</div>
          <h1>Somewhere<br /><em>beautiful is waiting.</em></h1>
          <p className="hero-copy">“The best journeys answer questions you never thought to ask.” Let the road lead you through Himachal&apos;s quiet valleys, warm kitchens, and wild views.</p>
          <button className="hero-cta" onClick={scrollToJourney}>Find my somewhere <span>↗</span></button>
          <div className="hero-stats">
            <span><strong>01</strong> Choose a region</span>
            <span><strong>02</strong> Follow your curiosity</span>
          </div>
        </div>
      </section>

      <div className="content-wrap" id="journey">
        <div className="journey-head">
          <div>
            <p className="eyebrow">The Wanderwise method</p>
            <h2>Follow the feeling. <em>Find the view.</em></h2>
          </div>
          <div className="progress-wrap">
            <div className="progress-label"><span>YOUR TRAIL</span><strong>{step} / 4</strong></div>
            <div className="progress-track"><span style={{ width: `${step * 25}%` }} /></div>
            <span className="progress-caption">{selectedPlace ? "Shortlist ready" : "Keep exploring"}</span>
          </div>
        </div>

        <section className="quote-strip">
          <span className="quote-mark">“</span>
          <p>Take the road that disappears into the mountains. That is usually where the story begins.</p>
          <span className="quote-credit">WANDERWISE FIELD NOTE · 01</span>
        </section>

        <section className="discovery-section">
            <div className="section-heading">
            <div className="step-number">01</div>
              <div><p className="eyebrow">Choose your first horizon</p><h3>Where does your curiosity point?</h3></div>
            <span className="section-meta">{states.length} regions</span>
            {selectedState && <span className="selected-pill">✓ {selectedState.name}</span>}
          </div>
          {statesLoading ? <div className="loading-row"><Spinner /> Loading destinations...</div> : (
            <div className="state-grid">
              {states.map((state, index) => (
                <button key={state.id} onClick={() => handleStateClick(state)} className={`state-card ${selectedState?.id === state.id ? "is-selected" : ""}`} style={{ backgroundImage: `url(${state.image_url || state.photo_url || imageFor(index, state.name)})` }}>
                  <video className="card-video" autoPlay muted loop playsInline preload="metadata" poster={state.image_url || state.photo_url || imageFor(index, state.name)}><source src={videoFor(index)} type="video/mp4" /></video>
                  <span className="card-shade" />
                  <span className="card-index">0{index + 1}</span>
                  <span className="state-name">{state.name}</span>
                  <span className="state-arrow">↗</span>
                  {state.ilp_required && <span className="permit-tag">Permit required</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedState && (
          <section className="discovery-section reveal" id="district-selection">
            <div className="section-heading">
              <div className="step-number">02</div>
              <div><p className="eyebrow">Narrow it down</p><h3>Around {selectedState.name}</h3></div>
              <span className="section-meta">{districts.length} districts</span>
            </div>
            {districtsLoading ? <div className="loading-row"><Spinner /> Reading the landscape...</div> : (
              <div className="district-grid">
                {districts.map((district) => (
                  <button key={district.id} onClick={() => handleDistrictClick(district)} className={`district-card ${selectedDistrict?.id === district.id ? "is-selected" : ""}`} style={{ backgroundImage: `url(${entityImage(20, district, selectedState.name)})` }}>
                    <video className="card-video" autoPlay muted loop playsInline preload="metadata" poster={entityImage(20, district, selectedState.name)}><source src={videoFor(Number(district.id) || 20)} type="video/mp4" /></video>
                    <span className="district-shade" /><span className="district-name">{district.name}</span><span className="district-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedDistrict && (
          <section className="discovery-section reveal" id="places-selection">
            <div className="section-heading">
              <div className="step-number">03</div>
              <div><p className="eyebrow">Make the day yours</p><h3>Small wonders around {selectedDistrict.name}</h3></div>
              <span className="section-meta">{places.length} local picks</span>
            </div>
            {placesLoading ? <div className="loading-row"><Spinner /> Uncovering the good stuff...</div> : places.length === 0 ? (
              <div className="empty-state">This trail is still being written. Try another district.</div>
            ) : (
              <div className="place-grid">
                {places.map((place, index) => {
                  const placeBestTime = bestTimeToVisitText({ name: place.name, description: place.description }, selectedDistrict?.name || "this region");
                  const placePermit = permitData(place);
                  return (
                    <button key={place.id} onClick={() => handlePlaceClick(place)} className={`place-card ${selectedPlace?.id === place.id ? "is-selected" : ""}`}>
                      <span className="place-image" style={{ backgroundImage: `url(${imageForPlace(index + 2, place, `${selectedDistrict.name} ${selectedPlace?.name || ""}`)})` }}><video autoPlay muted loop playsInline preload="metadata" poster={imageForPlace(index + 2, place, selectedDistrict.name)}><source src={videoFor(index + 2)} type="video/mp4" /></video></span>
                      <span className="place-number">0{index + 1}</span>
                      <span className="place-content">
                        <strong>{place.name}</strong>
                        <span>{place.description}</span>
                        {placePermit && <span className="permit-mini">⚠ Permit required</span>}
                        {placeBestTime && <span className="place-season mini">
                          <em>Best time</em>
                          <b>{placeBestTime.season}</b>
                          <small>{placeBestTime.line.replace(`Best time: ${placeBestTime.season} for ${place.name} — `, "")}</small>
                        </span>}
                      </span>
                      <span className="place-details"><span>✦ Local pick</span><span>{selectedPlace?.id === place.id ? "Selected ✓" : "Explore →"}</span></span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* --- MAP & EXPLORATION HUB SPLIT LAYOUT --- */}
        {selectedPlace && (
          <section className="explore-panel reveal" id="shortlist">
            <div className="panel-heading">
              <div><p className="eyebrow eyebrow-light">Your personal shortlist</p><h2>Worth the detour<span>.</span></h2><p>Little places, long memories, and the best reasons to linger in {selectedPlace.name}.</p></div>
              <div className="panel-badge">✦<span>EDITOR&apos;S<br />PICK</span></div>
            </div>
            {permitData(selectedPlace) && <div className="permit-card" role="note">
              <div className="permit-card-heading"><span className="permit-alert" aria-hidden="true">⚠</span><div><h3>Travel permit required</h3><p>{permitData(selectedPlace).details}</p></div></div>
              <div className="permit-fees"><div><span>Indian nationals</span><strong>{permitData(selectedPlace).indianFee}</strong></div><div><span>Foreign nationals</span><strong>{permitData(selectedPlace).foreignFee}</strong></div></div>
            </div>}
            
            {subplacesLoading ? <div className="loading-row loading-row-light"><Spinner light /> Collecting local whispers...</div> : !subplaces || Object.keys(subplaces).length === 0 ? (
              <div className="empty-state empty-state-dark">No field notes here yet. Be the first to leave one.</div>
            ) : (
              <div className="explore-layout flex flex-col lg:flex-row gap-8 items-start mt-8">
                
                {/* Left Side: Places List */}
                <div className="w-full lg:w-3/5 flex-shrink-0">
                  <div className="tab-row">
                    {categories.map(({ key, label, icon }) => subplaces[key] && (
                      <button key={key} onClick={() => { setActiveTab(key); setSelectedMapSpot(null); setSelectedRoute(null); }} className={activeTab === key ? "active" : ""}>{icon} {label} <small>{subplaces[key].length}</small></button>
                    ))}
                  </div>
                  <div className="subplace-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {subplaces[activeTab]?.map((item, index) => {
                      const isAdded = addedItems.has(item.id);
                      const itemBestTime = bestTimeToVisitText(item, selectedPlace?.name);
                      return (
                        <article key={item.id} className="subplace-card bg-[#111] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="subplace-image h-32 rounded-xl mb-4" style={{ backgroundImage: `url(${entityImage(index + 3, item, `${selectedDistrict?.name || ""} ${selectedPlace?.name || ""}`)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><video autoPlay muted loop playsInline preload="metadata" poster={entityImage(index + 3, item, `${selectedDistrict?.name || ""} ${selectedPlace?.name || ""}`)}><source src={videoFor(index + 3)} type="video/mp4" /></video></div>
                          <div className="flex justify-between items-start mb-2">
                            <div><span className="subplace-index">0{index + 1} / {categories.find(c => c.key === activeTab)?.label}</span><h4 className="text-white font-bold text-lg">{item.name}</h4></div>
                            <span className="distance-chip">{item.distance_km} km</span>
                          </div>
                          <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                          {itemBestTime && <div className="subplace-season mb-4">
                            <span className="season-label">Best time</span>
                            <strong>{itemBestTime.season}</strong>
                            <span>{itemBestTime.line.replace(`Best time: ${itemBestTime.season} for ${item.name} — `, "")}</span>
                          </div>}
                          
                          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                            <button 
                              onClick={() => handleOpenReviews(item)}
                              className="text-xs font-bold px-3 py-1.5 rounded bg-white/5 text-white/80 hover:bg-white/10 transition flex items-center gap-1"
                            >
                              ✦ Traveler notes
                            </button>
                            
                            <button 
                              onClick={() => handleAddToTrip(item)}
                              disabled={isAdded}
                              className={`text-sm font-bold px-3 py-1.5 rounded transition ${isAdded ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                              {isAdded ? "✓ In my trail" : "+ Save stop"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Mapbox Map */}
                <div className="map-frame w-full lg:w-2/5 h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5 sticky top-8 bg-slate-900 relative">
                  <div className="map-toolbar"><span><i /> LIVE AREA MAP</span><strong>{selectedPlace.name}</strong><span className="map-legend"><b /> {subplaces[activeTab]?.length || 0} stops</span></div>
                  {!selectedPlace.lat ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 p-6 text-center">
                      <span className="text-4xl mb-3">🗺️</span>
                      <p>Map data isn&apos;t available for this region yet.</p>
                      <p className="text-xs mt-2 opacity-70">Try viewing Kasol in Himachal Pradesh to see the map in action!</p>
                    </div>
                  ) : (
                    <Map
                      {...viewState}
                      onMove={evt => setViewState(evt.viewState)}
                      mapStyle="mapbox://styles/mapbox/dark-v11"
                      mapboxAccessToken={MAPBOX_TOKEN}
                    >
                      {selectedRoute?.geometry && (
                        <Source id="selected-route" type="geojson" data={selectedRoute.geometry}>
                          <Layer id="selected-route-casing" type="line" paint={{ "line-color": "#10251f", "line-width": 7, "line-opacity": 0.82 }} layout={{ "line-cap": "round", "line-join": "round" }} />
                          <Layer id="selected-route-line" type="line" paint={{ "line-color": "#f3b08d", "line-width": 3, "line-opacity": 1, "line-dasharray": [1, 1.5] }} layout={{ "line-cap": "round", "line-join": "round" }} />
                        </Source>
                      )}
                      <Marker longitude={Number(selectedPlace.lng)} latitude={Number(selectedPlace.lat)}>
                        <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce cursor-pointer flex items-center gap-2">
                           <span className="font-bold text-xs uppercase px-1">{selectedPlace.name}</span>
                        </div>
                      </Marker>

                      {categories.flatMap(({ key }) => (subplaces[key] || []).map((item) => {
                        const meta = mapCategoryMeta[key] || mapCategoryMeta.hidden_gem;
                        return item.lat && item.lng ? (
                          <Marker key={`${key}-${item.id}`} longitude={Number(item.lng)} latitude={Number(item.lat)}>
                            <button
                              type="button"
                              aria-label={`Show details for ${item.name}`}
                              onClick={() => handleMapSpotClick(item)}
                              className={`map-marker ${selectedMapSpot?.id === item.id ? "is-active" : ""}`}
                              data-category={key}
                              style={{ "--marker-accent": meta.accent, "--marker-bg": meta.background }}
                            >
                              <span className="map-marker-icon">{meta.icon}</span>
                              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl">
                                {item.name}
                              </div>
                            </button>
                          </Marker>
                        ) : null;
                      }))}
                    </Map>
                  )}
                  {selectedMapSpot && (
                    <aside className="map-spot-card" aria-live="polite">
                      <button type="button" aria-label="Close place details" className="map-spot-close" onClick={() => setSelectedMapSpot(null)}>×</button>
                      <div className="map-spot-image" style={{ backgroundImage: `url(${entityImage(7, selectedMapSpot, `${selectedDistrict?.name || ""} ${selectedPlace.name}`)})` }} />
                      <div className="map-spot-body">
                        <span className="map-spot-kicker">{categories.find(c => c.key === activeTab)?.label || "Local spot"} · {selectedMapSpot.distance_km || "Nearby"} km away</span>
                        <h3>{selectedMapSpot.name}</h3>
                        <p>{selectedMapSpot.description || "A local stop worth slowing down for, with scenery and stories around every turn."}</p>
                        <div className="map-spot-route"><span>{selectedRoute?.loading ? "Tracing route..." : selectedRoute?.fallback ? "Direct route estimate" : "Route traced"}</span><strong>{selectedRoute?.distanceKm || selectedMapSpot.distance_km || "--"} km</strong>{selectedRoute?.durationMinutes ? <small>{selectedRoute.durationMinutes} min drive</small> : null}</div>
                        <div className="map-spot-footer"><span><i /> Scenery worth the detour</span><button type="button" onClick={() => handleOpenReviews(selectedMapSpot)}>Traveler notes →</button></div>
                      </div>
                    </aside>
                  )}
                </div>

              </div>
            )}
          </section>
        )}
      </div>

      {/* --- TRIP PLANNER MODAL --- */}
      {isModalOpen && (
        <div className="trip-modal fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="trip-dialog w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="trip-planner-head">
              <video className="planner-head-video" autoPlay muted loop playsInline preload="metadata" poster="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=85"><source src={travelVideos[1]} type="video/mp4" /></video>
              <div className="trip-planner-head-copy"><p className="eyebrow">Your travel desk</p><h2>Plan the days that stay with you.</h2><p>{activeTrip?.itinerary_items?.length || 0} stops across {tripMeta.duration} days</p></div>
              <button aria-label="Close trip planner" onClick={() => setIsModalOpen(false)} className="trip-close">✕</button>
            </div>
            <div className="trip-planner-body">
              <video className="planner-video" autoPlay muted loop playsInline preload="metadata" poster="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1800&q=85"><source src={travelVideos[1]} type="video/mp4" /></video>
              <aside className="trip-sidebar">
                <div className="trip-sidebar-title"><span>Your trips</span><button type="button" onClick={() => setShowNewTrip(prev => !prev)} aria-label="Create a new trip">+</button></div>
                {trips.map(trip => (
                  <div key={trip.trip_id || trip.id} className={`trip-list-item ${(activeTrip?.trip_id || activeTrip?.id) === (trip.trip_id || trip.id) ? "active" : ""}`}>
                    <button type="button" onClick={() => handleSelectTrip(trip)} className="trip-select"><strong>{trip.title}</strong><span>{trip.start_date ? dateLabel(trip.start_date) : "Flexible dates"}</span></button>
                    <button type="button" className="trip-delete" title={`Delete ${trip.title}`} aria-label={`Delete ${trip.title}`} onClick={() => handleDeleteTrip(trip)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7V4h6v3m-9 0 1 13h8l1-13" /></svg></button>
                  </div>
                ))}
                {showNewTrip && (
                  <form className="new-trip-form" onSubmit={handleCreateTrip}>
                    <label>Trip name<input required value={newTrip.title} onChange={e => setNewTrip({ ...newTrip, title: e.target.value })} placeholder="Monsoon in Kerala" /></label>
                    <label>Starts<input type="date" value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} /></label>
                    <label>Days<input type="number" min="1" max="30" value={newTrip.duration} onChange={e => setNewTrip({ ...newTrip, duration: e.target.value })} /></label>
                    <button type="submit" disabled={isCreatingTrip}>{isCreatingTrip ? "Creating..." : "Create trip"}</button>
                  </form>
                )}
              </aside>
              <section className="trip-planner-content">
                <div className="trip-details-grid">
                  <label>Trip name<input value={tripMeta.title} onChange={e => persistTripMeta({ ...tripMeta, title: e.target.value })} /></label>
                  <label>Start date<input type="date" value={tripMeta.startDate} onChange={e => persistTripMeta({ ...tripMeta, startDate: e.target.value })} /></label>
                  <label>Number of days<input type="number" min="1" max="30" value={tripMeta.duration} onChange={e => persistTripMeta({ ...tripMeta, duration: e.target.value })} /></label>
                </div>
                <label className="trip-notes">Planning notes<textarea value={tripMeta.notes} onChange={e => persistTripMeta({ ...tripMeta, notes: e.target.value })} placeholder="Add a hotel, food preference, permit reminder, or a promise to yourself..." /></label>
                <div className="trip-route-summary" aria-live="polite">
                  <div><span>ROUTE ESTIMATE</span><strong>{routeEstimate.loading ? "Calculating..." : routeEstimate.stops > 1 ? `${routeEstimate.distanceKm.toFixed(1)} km` : "Add 2 stops"}</strong><small>{routeEstimate.stops > 1 ? "between saved stops" : "to build a route"}</small></div>
                  <div><span>DRIVING TIME</span><strong>{routeEstimate.loading ? "..." : routeEstimate.stops > 1 ? formatMinutes(routeEstimate.durationMinutes) : "--"}</strong><small>{routeEstimate.source || "No route yet"}</small></div>
                  <div><span>PLANNED STOPS</span><strong>{routeEstimate.stops}</strong><small>{routeEstimate.source === "Mapbox driving route" ? "road route" : routeEstimate.stops > 1 ? "estimated route" : "saved locations"}</small></div>
                </div>
                <div className="day-tabs" role="tablist" aria-label="Trip days">
                  {activeTripDays.map(({ day, date }) => <button key={date} type="button" onClick={() => setSelectedDay(day)} className={selectedDay === day ? "active" : ""}><span>DAY {day}</span><strong>{dateLabel(date)}</strong></button>)}
                </div>
                <div className="day-plan-head"><div><p className="eyebrow">{dateLabel(activeTripDays[selectedDay - 1]?.date || tripMeta.startDate)}</p><h3>Day {selectedDay} itinerary</h3></div><span>{activeDayStops.length} planned stop{activeDayStops.length === 1 ? "" : "s"}</span></div>
                {activeDayStops.length === 0 ? <div className="day-empty"><span>✦</span><strong>A blank page for a good day.</strong><p>Save places from the discovery area, then assign them to this day.</p></div> : (
                  <div className="day-stop-list">{activeDayStops.map((stop, index) => <div key={stop.item_id || `${stop.name}-${index}`} className="day-stop"><span className="day-stop-number">{String(index + 1).padStart(2, "0")}</span><div className="day-stop-copy"><strong>{stop.name}</strong><span>{stop.category?.replaceAll("_", " ") || "Local stop"} {stop.distance_km ? `· ${stop.distance_km} km` : ""}</span></div><div className="day-stop-actions"><span className="day-stop-time">{index === 0 ? "Morning" : index === 1 ? "Afternoon" : "Evening"}</span><div className="stop-reorder" aria-label={`Reorder ${stop.name}`}><button type="button" onClick={() => handleSwapTripItem(stop, -1)} disabled={index === 0} title="Move stop up" aria-label={`Move ${stop.name} up`}>↑</button><button type="button" onClick={() => handleSwapTripItem(stop, 1)} disabled={index === activeDayStops.length - 1} title="Move stop down" aria-label={`Move ${stop.name} down`}>↓</button></div><label className="move-day"><span>Move to</span><select aria-label={`Move ${stop.name} to another day`} value={dayForTripItem(stop, tripMeta.startDate)} onChange={event => handleMoveTripItem(stop, event.target.value)}>{activeTripDays.map(({ day }) => <option key={day} value={day}>Day {day}</option>)}</select></label><button type="button" className="delete-stop" title={`Remove ${stop.name}`} aria-label={`Remove ${stop.name} from trip`} onClick={() => handleRemoveTripItem(stop)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M9 7V4h6v3m-9 0 1 13h8l1-13" /></svg></button></div></div>)}</div>
                )}
              </section>
            </div>
            <div className="trip-planner-foot"><span>Stops are added to the selected day when you save them.</span><button type="button" onClick={() => setIsModalOpen(false)}>Back to discovery ↗</button></div>
          </div>
        </div>
      )}

      {/* --- REVIEWS & PHOTO UPLOAD MODAL --- */}
      {isReviewModalOpen && selectedSubPlace && (
        <div className="review-modal fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="review-dialog bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181818]">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Field notes from fellow wanderers</span>
                <h3 className="text-xl font-black mt-1">{selectedSubPlace.name}</h3>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)} 
                className="text-white/40 hover:text-white bg-white/5 rounded-full w-8 h-8 flex items-center justify-center border border-white/10 font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <form onSubmit={handleReviewSubmit} className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4">
                <h4 className="font-bold text-sm text-indigo-300">Leave a note for the next curious traveler</h4>
                
                <div className="flex gap-4 items-center">
                  <label className="text-xs text-white/60">Rating:</label>
                  <select 
                    value={newRating} 
                    onChange={(e) => setNewRating(e.target.value)}
                    className="bg-black border border-white/20 rounded px-3 py-1 text-sm text-white"
                  >
                    <option value="5">★★★★★ (5/5)</option>
                    <option value="4">★★★★☆ (4/5)</option>
                    <option value="3">★★★☆☆ (3/5)</option>
                    <option value="2">★★☆☆☆ (2/5)</option>
                    <option value="1">★☆☆☆☆ (1/5)</option>
                  </select>
                </div>

                <textarea 
                  rows="2"
                  placeholder="Share tips about the trail, crowd, or food..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
                  required
                />

                <div className="flex justify-between items-center pt-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setNewPhoto(e.target.files[0])}
                    className="text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  >
                    {submittingReview ? "Posting..." : "Post Review"}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                  <h4 className="font-bold text-sm text-white/60">Notes from the trail ({reviews.length})</h4>
                
                {reviewsLoading ? (
                  <div className="text-center py-8 text-white/40">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/5">No notes yet. Leave the first little piece of wisdom.</div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-indigo-300">{rev.user_name || "Wanderer"}</span>
                        <span className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</span>
                      </div>
                      <p className="text-sm text-white/80">{rev.comment}</p>
                      {rev.photo_url && (
                        <div className="mt-3">
                          <img src={rev.photo_url} alt="Traveler upload" className="rounded-lg max-h-48 object-cover border border-white/10" />
                        </div>
                      )}
                      <span className="text-[10px] text-white/30 block pt-1">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

            </div>

            <div className="p-4 border-t border-white/10 bg-[#181818] flex justify-end">
              <button 
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl font-bold text-sm transition" 
                onClick={() => setIsReviewModalOpen(false)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      <footer className="footer"><span>WANDERWISE · HIMACHAL & BEYOND</span><span>Go gently. Look closely.</span></footer>
    </main>
  );
}