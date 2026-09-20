"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// --- Mapbox Imports ---
import Map, { Marker } from 'react-map-gl';
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

const travelImages = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=900&q=85",
];

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

function imageFor(index = 0, label = "") {
  const text = label.toLowerCase();
  const exactMatch = Object.entries(locationImages).find(([name]) => text.includes(name));
  if (exactMatch) return exactMatch[1];
  if (text.includes("mountain") || text.includes("himachal") || text.includes("ladakh") || text.includes("sikkim")) return travelImages[0];
  if (text.includes("beach") || text.includes("coast") || text.includes("goa") || text.includes("kerala")) return travelImages[2];
  if (text.includes("fort") || text.includes("palace") || text.includes("rajasthan")) return travelImages[1];
  if (text.includes("forest") || text.includes("wildlife") || text.includes("valley")) return travelImages[5];
  return travelImages[index % travelImages.length];
}

function imageForPlace(index, place) {
  const apiImage = place?.image_url || place?.photo_url || place?.image || place?.photo || place?.thumbnail || place?.cover_image;
  if (apiImage) return apiImage;
  const label = `${place?.name || ""} ${place?.description || ""}`;
  const knownImage = imageFor(index, label);
  const hasKnownImage = Object.keys(locationImages).some((name) => label.toLowerCase().includes(name));
  if (hasKnownImage) return knownImage;
  const query = encodeURIComponent(`${place?.name || "India travel"} India travel`);
  return `https://loremflickr.com/1200/800/${query}?lock=${Math.abs(Number(place?.id) || index + 1)}`;
}

function entityImage(index, entity) {
  const apiImage = entity?.image_url || entity?.photo_url || entity?.image || entity?.photo || entity?.thumbnail || entity?.cover_image;
  return apiImage || imageForPlace(index, entity);
}

function Spinner({ light = false }) {
  return <span className={`spinner ${light ? "spinner-light" : ""}`} aria-label="Loading" />;
}

export default function Home() {
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [subplaces, setSubplaces] = useState(null);
  const [subplacesLoading, setSubplacesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hidden_gem");

  const [activeTrip, setActiveTrip] = useState(null);
  const [addedItems, setAddedItems] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (selectedPlace?.lat && selectedPlace?.lng) {
      setViewState({
        longitude: Number(selectedPlace.lng),
        latitude: Number(selectedPlace.lat),
        zoom: 13
      });
    }
  }, [selectedPlace]);

  useEffect(() => {
    axios.get(`${API_URL}/states`)
      .then(({ data }) => setStates(data))
      .catch((error) => console.error("Error fetching states:", error))
      .finally(() => setStatesLoading(false));
  }, []);

  useEffect(() => {
    const setupTrip = async () => {
      try {
        const { data: trips } = await axios.get(`${API_URL}/users/${DUMMY_USER_ID}/trips`);
        
        if (trips.length > 0) {
          setActiveTrip(trips[0]);
          if (trips[0].itinerary_items) {
             const itemIds = new Set(trips[0].itinerary_items.map(i => i.sub_place_id));
             setAddedItems(itemIds);
          }
        } else {
          const { data: newTrip } = await axios.post(`${API_URL}/trips`, {
            user_id: DUMMY_USER_ID,
            title: "My Epic Journey",
            start_date: "2026-10-01",
            end_date: "2026-10-15"
          });
          setActiveTrip(newTrip);
        }
      } catch (error) {
        console.error("Error setting up itinerary:", error);
      }
    };
    setupTrip();
  }, []);

  const handleStateClick = async (state) => {
    if (selectedState?.id === state.id) return;
    setSelectedState(state);
    setSelectedDistrict(null);
    setDistricts([]);
    setSelectedPlace(null);
    setPlaces([]);
    setSubplaces(null);
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
      await axios.post(`${API_URL}/trips/${currentTripId}/items`, {
        sub_place_id: subPlace.id,
        visit_date: "2026-10-05", 
        notes: `Exploring ${subPlace.name}`
      });
      
      setAddedItems(prev => new Set(prev).add(subPlace.id));
      
      setActiveTrip(prev => ({
        ...prev,
        itinerary_items: [
          ...(prev.itinerary_items || []),
          {
            item_id: Date.now(), 
            sub_place_id: subPlace.id,
            name: subPlace.name,
            category: subPlace.category,
            distance_km: subPlace.distance_from_primary_km || subPlace.distance_km,
            notes: `Exploring ${subPlace.name}`
          }
        ]
      }));
    } catch (error) {
      console.error("Error adding to trip:", error);
      alert("Failed to add place to trip.");
    }
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>Wanderwise</span></div>
        <div className="flex gap-4 items-center">
            <div className="topbar-note"><span className="live-dot" /> Curated for the curious</div>
            {activeTrip && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-bold border border-white/40 rounded-full px-4 py-1.5 hover:bg-white/10 transition shadow-sm text-white bg-black/20 backdrop-blur-md"
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
            poster="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=90"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-mountains-1577/1080p.mp4" type="video/mp4" />
          </video>
          <div className="scene-sun" />
          <div className="scene-mountain scene-mountain-back" />
          <div className="scene-mountain scene-mountain-front" />
          <div className="scene-haze" />
          <div className="scene-stars" />
        </div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-route" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-content">
          <div className="hero-kicker"><span className="pulse-ring" /> Your next story starts here</div>
          <h1>Go where the map<br /><em>gets interesting.</em></h1>
          <p className="hero-copy">A thoughtful guide to India&apos;s lesser-known places, local flavors, and views worth taking the long way for.</p>
          <button className="hero-cta" onClick={scrollToJourney}>Start exploring <span>↗</span></button>
          <div className="hero-stats">
            <span><strong>01</strong> Choose a region</span>
            <span><strong>02</strong> Follow your curiosity</span>
          </div>
        </div>
        <div className="floating-place floating-place-top"><span>✦</span><div><strong>Spiti Valley</strong><small>Himachal Pradesh</small></div></div>
        <div className="floating-place floating-place-bottom"><span>◉</span><div><strong>Secret coastlines</strong><small>Goa · 12 hidden spots</small></div></div>
        <div className="hero-stamp"><span>DISCOVER</span><strong>OFF<br />BEAT</strong><span>TRAVEL</span></div>
      </section>

      <div className="content-wrap" id="journey">
        <div className="journey-head">
          <div>
            <p className="eyebrow">Build your escape</p>
            <h2>Find your kind of <em>somewhere.</em></h2>
          </div>
          <div className="progress-wrap">
            <div className="progress-label"><span>YOUR JOURNEY</span><strong>{step} / 4</strong></div>
            <div className="progress-track"><span style={{ width: `${step * 25}%` }} /></div>
          </div>
        </div>

        <section className="discovery-section">
          <div className="section-heading">
            <div className="step-number">01</div>
            <div><p className="eyebrow">Start with a feeling</p><h3>Pick a state to explore</h3></div>
            {selectedState && <span className="selected-pill">✓ {selectedState.name}</span>}
          </div>
          {statesLoading ? <div className="loading-row"><Spinner /> Loading destinations...</div> : (
            <div className="state-grid">
              {states.map((state, index) => (
                <button key={state.id} onClick={() => handleStateClick(state)} className={`state-card ${selectedState?.id === state.id ? "is-selected" : ""}`} style={{ backgroundImage: `url(${state.image_url || state.photo_url || imageFor(index, state.name)})` }}>
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
          <section className="discovery-section reveal">
            <div className="section-heading">
              <div className="step-number">02</div>
              <div><p className="eyebrow">Narrow it down</p><h3>Around {selectedState.name}</h3></div>
            </div>
            {districtsLoading ? <div className="loading-row"><Spinner /> Finding the good stuff...</div> : (
              <div className="district-grid">
                {districts.map((district) => (
                  <button key={district.id} onClick={() => handleDistrictClick(district)} className={`district-card ${selectedDistrict?.id === district.id ? "is-selected" : ""}`} style={{ backgroundImage: `url(${entityImage(20, district)})` }}>
                    <span className="district-shade" /><span className="district-name">{district.name}</span><span className="district-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedDistrict && (
          <section className="discovery-section reveal">
            <div className="section-heading">
              <div className="step-number">03</div>
              <div><p className="eyebrow">Make it yours</p><h3>Places in {selectedDistrict.name}</h3></div>
            </div>
            {placesLoading ? <div className="loading-row"><Spinner /> Uncovering destinations...</div> : places.length === 0 ? (
              <div className="empty-state">No places found here yet. Try another district.</div>
            ) : (
              <div className="place-grid">
                {places.map((place, index) => (
                  <button key={place.id} onClick={() => handlePlaceClick(place)} className={`place-card ${selectedPlace?.id === place.id ? "is-selected" : ""}`}>
                    <span className="place-image" style={{ backgroundImage: `url(${imageForPlace(index + 2, place)})` }} />
                    <span className="place-number">0{index + 1}</span>
                    <span className="place-content"><strong>{place.name}</strong><span>{place.description}</span></span>
                    <span className="place-details"><span>✦ Local pick</span><span>{selectedPlace?.id === place.id ? "Selected ✓" : "Explore →"}</span></span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* --- MAP & EXPLORATION HUB SPLIT LAYOUT --- */}
        {selectedPlace && (
          <section className="explore-panel reveal">
            <div className="panel-heading">
              <div><p className="eyebrow eyebrow-light">Your personal shortlist</p><h2>Worth the detour<span>.</span></h2><p>Little places that make {selectedPlace.name} memorable.</p></div>
              <div className="panel-badge">✦<span>EDITOR&apos;S<br />PICK</span></div>
            </div>
            
            {subplacesLoading ? <div className="loading-row loading-row-light"><Spinner light /> Curating your shortlist...</div> : !subplaces || Object.keys(subplaces).length === 0 ? (
              <div className="empty-state empty-state-dark">No hidden gems recorded for this location yet.</div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start mt-8">
                
                {/* Left Side: Places List */}
                <div className="w-full lg:w-3/5 flex-shrink-0">
                  <div className="tab-row">
                    {categories.map(({ key, label, icon }) => subplaces[key] && (
                      <button key={key} onClick={() => setActiveTab(key)} className={activeTab === key ? "active" : ""}>{icon} {label} <small>{subplaces[key].length}</small></button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {subplaces[activeTab]?.map((item, index) => {
                      const isAdded = addedItems.has(item.id);
                      return (
                        <article key={item.id} className="subplace-card bg-[#111] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="subplace-image h-32 rounded-xl mb-4" style={{ backgroundImage: `url(${entityImage(index + 3, item)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-bold text-lg">{item.name}</h4>
                            <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">{item.distance_km} km</span>
                          </div>
                          <p className="text-white/60 text-sm mb-4 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                            <button 
                              onClick={() => handleOpenReviews(item)}
                              className="text-xs font-bold px-3 py-1.5 rounded bg-white/5 text-white/80 hover:bg-white/10 transition flex items-center gap-1"
                            >
                              💬 Reviews
                            </button>
                            
                            <button 
                              onClick={() => handleAddToTrip(item)}
                              disabled={isAdded}
                              className={`text-sm font-bold px-3 py-1.5 rounded transition ${isAdded ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                              {isAdded ? "✓ Added" : "+ Add"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Mapbox Map */}
                <div className="w-full lg:w-2/5 h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5 sticky top-8 bg-slate-900 relative">
                  {!selectedPlace.lat ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 p-6 text-center">
                      <span className="text-4xl mb-3">🗺️</span>
                      <p>Map data isn't available for this region yet.</p>
                      <p className="text-xs mt-2 opacity-70">Try viewing Kasol in Himachal Pradesh to see the map in action!</p>
                    </div>
                  ) : (
                    <Map
                      {...viewState}
                      onMove={evt => setViewState(evt.viewState)}
                      mapStyle="mapbox://styles/mapbox/dark-v11"
                      mapboxAccessToken={MAPBOX_TOKEN}
                    >
                      <Marker longitude={Number(selectedPlace.lng)} latitude={Number(selectedPlace.lat)}>
                        <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce cursor-pointer flex items-center gap-2">
                           <span className="font-bold text-xs uppercase px-1">{selectedPlace.name}</span>
                        </div>
                      </Marker>

                      {subplaces[activeTab]?.map((item) => (
                        item.lat && item.lng && (
                          <Marker key={item.id} longitude={Number(item.lng)} latitude={Number(item.lat)}>
                            <div className="bg-slate-800 text-white w-8 h-8 rounded-full shadow-lg border-2 border-indigo-500 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform hover:z-50 group">
                              <span className="text-sm">{categories.find(c => c.key === activeTab)?.icon || '📍'}</span>
                              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl">
                                {item.name}
                              </div>
                            </div>
                          </Marker>
                        )
                      ))}
                    </Map>
                  )}
                </div>

              </div>
            )}
          </section>
        )}
      </div>

      {/* --- TRIP DASHBOARD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{activeTrip?.title || "My Trip"}</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">{activeTrip?.itinerary_items?.length || 0} stops planned</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-slate-200 font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {(!activeTrip?.itinerary_items || activeTrip.itinerary_items.length === 0) ? (
                 <div className="text-center py-12 text-slate-500">No stops added yet. Start exploring!</div>
              ) : (
                <div className="space-y-4">
                  {activeTrip.itinerary_items.map((stop, i) => (
                    <div key={stop.item_id || i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition text-slate-800">
                      <div className="bg-indigo-100 text-indigo-700 font-bold h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 text-lg">{stop.name}</h4>
                          {stop.distance_km && <span className="text-xs font-bold text-slate-400">{stop.distance_km} km away</span>}
                        </div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded mt-1 inline-block">
                          {stop.category?.replace('_', ' ')}
                        </span>
                        {stop.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 flex gap-2 border border-slate-100">
                            <span>📝</span> {stop.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
                <button 
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-md" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Back to Map
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REVIEWS & PHOTO UPLOAD MODAL --- */}
      {isReviewModalOpen && selectedSubPlace && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-white">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181818]">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Traveler Community</span>
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
                <h4 className="font-bold text-sm text-indigo-300">Leave your review & photos</h4>
                
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
                <h4 className="font-bold text-sm text-white/60">Traveler Reviews ({reviews.length})</h4>
                
                {reviewsLoading ? (
                  <div className="text-center py-8 text-white/40">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/5">No reviews yet. Be the first traveler to share your experience!</div>
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

      <footer className="footer"><span>WANDERWISE</span><span>Take the scenic route.</span></footer>
    </main>
  );
}