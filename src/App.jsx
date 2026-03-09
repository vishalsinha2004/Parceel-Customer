import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndoraMap from './components/IndoraMap';
import api from './api/axios';
import Login from './components/Login'; 
import Signup from './components/Signup';
import io from 'socket.io-client';

// --- CUSTOM CLAYMORPHISM SVG ICONS ---
const Icons = {
  TwoWheeler: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 17h5l2-5h-9l-2-5H3l2 5h4"/>
    </svg>
  ),
  Truck: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Package: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
    </svg>
  ),
  Key: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>
    </svg>
  ),
  NavHome: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  NavOrders: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  NavProfile: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  NavHelp: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
};
// Helper to auto-scroll banners
const AutoScroller = () => {
  useEffect(() => {
    let currentBanner = 1;
    const totalBanners = 3;
    
    const interval = setInterval(() => {
      currentBanner = currentBanner >= totalBanners ? 1 : currentBanner + 1;
      const element = document.getElementById(`banner-${currentBanner}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 3000); // Changes every 3 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return null; // Renders nothing
};

function CustomerHome({ onLogout }) {
  const [currentTab, setCurrentTab] = useState('home'); 
  const [profileView, setProfileView] = useState('main'); 
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('indora_customer_username') || "Customer",
    phone: localStorage.getItem('indora_customer_phone') || "+91 9876543210",
    email: localStorage.getItem('indora_customer_email') || "customer@indora.in"
  });

  const savedStep = localStorage.getItem('indora_step') || 'selection';
  const savedOrderId = localStorage.getItem('indora_order_id') || null;

  const [step, setStep] = useState(savedStep);
  const [orderId, setOrderId] = useState(savedOrderId);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [driverName, setDriverName] = useState(""); 
  const [driverPhone, setDriverPhone] = useState(""); 
  const [rating, setRating] = useState(0);            
  const [feedback, setFeedback] = useState("");       
  const [isRated, setIsRated] = useState(false);      
  const [offer, setOffer] = useState(null);
  const [status, setStatus] = useState('requested');
  const [vehicleType, setVehicleType] = useState(null);

  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => { localStorage.setItem('indora_step', step); }, [step]);
  useEffect(() => {
    if (orderId) localStorage.setItem('indora_order_id', orderId);
    else localStorage.removeItem('indora_order_id');
  }, [orderId]);

  useEffect(() => {
    if (currentTab !== 'profile') setProfileView('main');
    if (currentTab !== 'help') setExpandedFaq(null);
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'orders') {
      setLoadingHistory(true);
      api.get('rides/')
        .then(res => setOrderHistory(res.data.sort((a, b) => b.id - a.id)))
        .catch(err => console.error(err))
        .finally(() => setLoadingHistory(false));
    }
  }, [currentTab]);

  const services = [
    { id: '2-wheeler', name: '2 Wheeler', icon: <Icons.TwoWheeler />, active: true, desc: 'Fast & Pocket Friendly' },
    { id: 'trucks', name: 'Trucks', icon: <Icons.Truck />, active: true, desc: 'Heavy Duty Moving' },
    { id: 'packers', name: 'Packers & Movers', icon: <Icons.Package />, active: true, desc: 'Professional Relocation' },
    { id: 'rent', name: 'Rent Vehicle', icon: <Icons.Key />, active: false, desc: 'Coming Soon' },
  ];

  const handleServiceSelect = (service) => {
    if (service.active) {
      setVehicleType(service.id);
      setStep('pickup');
    }
  };

  const fetchPrice = async () => {
    try {
      const response = await api.post('rides/', {
        pickup_lat: pickup[0], pickup_lng: pickup[1],
        dropoff_lat: dropoff[0], dropoff_lng: dropoff[1],
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        vehicle_type: vehicleType
      });
      setOffer(response.data);
    } catch (error) { alert(`❌ Error: ${error.response?.data?.detail || "Could not calculate price"}`); }
  };

  const payAndBook = async () => {
    if (!offer) return;
    const options = {
      key: "rzp_test_SHfqRqFecIslSG", 
      amount: offer.price * 100, 
      currency: "INR",
      name: "Indora Rides",
      order_id: offer.razorpay_order_id,
      handler: async function (res) {
        await api.post(`rides/${offer.id}/verify_payment/`, {
          razorpay_order_id: res.razorpay_order_id,
          razorpay_payment_id: res.razorpay_payment_id,
          razorpay_signature: res.razorpay_signature
        });
        setOrderId(offer.id);
        setStep('finished');
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (!orderId || step !== 'finished') return;
    const socket = io('http://localhost:8000'); 
    socket.emit('join_order', { order_id: orderId });

    const fetchCurrentStatus = async () => {
      try {
        const response = await api.get(`rides/${orderId}/`);
        setStatus(response.data.status.toLowerCase());
        if (response.data.driver_name) setDriverName(response.data.driver_name);
        if (response.data.driver_phone) setDriverPhone(response.data.driver_phone);
        if (response.data.driver_lat) setDriverLocation([response.data.driver_lat, response.data.driver_lng]);
        if (response.data.rating) {
          setIsRated(true); setRating(response.data.rating); setFeedback(response.data.feedback || "");
        }
      } catch (error) {}
    };

    fetchCurrentStatus();
    socket.on('ride_accepted_event', fetchCurrentStatus);
    socket.on('ride_completed_event', fetchCurrentStatus);
    socket.on('driver_location_update', (data) => {
        if (data.lat && data.lng) setDriverLocation([data.lat, data.lng]);
    });

    const interval = setInterval(fetchCurrentStatus, 3000); 
    return () => {
      clearInterval(interval);
      socket.off('ride_accepted_event'); socket.off('ride_completed_event'); socket.off('driver_location_update');
      socket.disconnect();
    };
  }, [orderId, step]);

  const submitRating = async () => {
    if (rating === 0) return alert("Please select a star rating");
    try {
      await api.post(`rides/${orderId}/rate_driver/`, { rating: rating, feedback: feedback });
      setIsRated(true);
    } catch (error) {}
  };

  const handleProfileSave = () => {
    localStorage.setItem('indora_customer_username', userInfo.name);
    localStorage.setItem('indora_customer_phone', userInfo.phone);
    localStorage.setItem('indora_customer_email', userInfo.email);
    alert("Profile Updated Successfully!");
    setProfileView('main');
  };

  // Shared classes for beautifully hiding scrollbars while retaining scroll functionality
  const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

  // Desktop Navigation Pill
  const DesktopNavBtn = ({ id, label }) => (
    <button 
      onClick={() => setCurrentTab(id)}
      className={`px-5 py-2 rounded-full text-sm font-black transition-all duration-300 ${currentTab === id ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
    >
      {label}
    </button>
  );

  // Mobile Navigation Icon
  const MobileNavBtn = ({ id, icon, label }) => (
    <button 
      onClick={() => setCurrentTab(id)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${currentTab === id ? 'text-blue-600' : 'text-slate-400 hover:text-blue-400'}`}
    >
      <div className={`mb-1 transition-transform ${currentTab === id ? 'scale-110 drop-shadow-md' : 'scale-100'}`}>{icon}</div>
      <span className={`text-[10px] font-black uppercase tracking-wider ${currentTab === id ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen bg-slate-50 font-sans flex overflow-hidden relative">
      
      {/* ========================================= */}
      {/* BACKGROUND MAP (Always full bleed) */}
      {/* ========================================= */}
      <div className="absolute inset-0 z-0 md:left-[420px] md:w-[calc(100vw-420px)] w-full transition-all duration-500">
        <IndoraMap 
          pickup={pickup} setPickup={setPickup} dropoff={dropoff} setDropoff={setDropoff}
          driverLocation={driverLocation} pickupAddress={pickupAddress} dropoffAddress={dropoffAddress}
          setPickupAddress={setPickupAddress} setDropoffAddress={setDropoffAddress}
          step={step} setStep={setStep} routeGeometry={offer ? offer.route_geometry : null}
        />
      </div>

      {/* MOBILE MAP FLOATING CONTROLS */}
      <div className="md:hidden absolute top-6 left-6 right-6 flex justify-between items-center z-[1000] pointer-events-auto">
         {step === 'selection' && currentTab === 'home' && (
            <h1 className="text-3xl font-black text-blue-600 italic drop-shadow-md bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl">PARCEEL</h1>
         )}
         {step !== 'selection' && currentTab === 'home' && (
           <button onClick={() => { setStep('selection'); setOrderId(null); setOffer(null); setDropoff(null); }} className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-slate-700 active:scale-90 transition-all">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
           </button>
         )}
      </div>

      {/* ========================================= */}
      {/* THE INTERACTIVE UI PANEL (Left Desktop / Bottom Mobile) */}
      {/* ========================================= */}
      <div className={`
        fixed bottom-0 left-0 w-full z-[2000] flex flex-col pointer-events-auto
        md:relative md:w-[420px] md:h-full md:max-h-full
        bg-white/95 backdrop-blur-2xl md:bg-white
        rounded-t-[40px] md:rounded-none
        shadow-[0_-15px_40px_rgba(0,0,0,0.1)] md:shadow-[10px_0_40px_rgba(0,0,0,0.05)]
        border-r border-slate-200 transition-all duration-500
        ${step === 'selection' && currentTab === 'home' ? 'h-[90vh]' : 'max-h-[85vh]'} 
      `}>
        
        {/* MOBILE DRAG HANDLE */}
        <div className="md:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-4 shrink-0"></div>

        {/* DESKTOP HEADER & NAVIGATION */}
        <div className="hidden md:flex flex-col p-8 pb-4 shrink-0 border-b border-slate-100">
           <h1 className="text-4xl font-black text-blue-600 italic tracking-tighter mb-6 cursor-pointer" onClick={() => {setCurrentTab('home'); setStep('selection');}}>PARCEEL</h1>
           <div className="flex flex-wrap gap-2">
              <DesktopNavBtn id="home" label="Book" />
              <DesktopNavBtn id="orders" label="Trips" />
              <DesktopNavBtn id="profile" label="Profile" />
              <DesktopNavBtn id="help" label="Help" />
           </div>
        </div>

        {/* ========================================= */}
        {/* SCROLLABLE CONTENT AREA */}
        {/* ========================================= */}
        <div className={`flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-6 pb-[100px] md:pb-8 ${hideScrollbar}`}>
          
          {/* TAB 1: HOME (BOOKING FLOW) */}
          {currentTab === 'home' && (
            <div className="animate-fade-in">
              {/* --- STEP: SELECTION --- */}
              {step === 'selection' && (
                <div className="flex flex-col h-full">
                  
                  {/* Auto-scrolling Banners */}
                  <div 
                    className="flex overflow-x-auto gap-4 mb-8 pb-2 snap-x snap-mandatory shrink-0 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hides scrollbar
                  >
                    <style>{`
                      /* Hides scrollbar for Webkit/Chrome/Safari */
                      div::-webkit-scrollbar { display: none; }
                    `}</style>
                    
                    {/* Banner 1 */}
                    <div className="min-w-[85%] flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-[24px] text-white snap-center relative overflow-hidden shadow-lg" id="banner-1">
                      <div className="relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">First Ride</span>
                        <h3 className="text-3xl font-black mt-3">50% OFF</h3>
                        <p className="text-sm font-bold text-blue-100 mb-3">On two-wheelers.</p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>
                    
                    {/* Banner 2 */}
                    <div className="min-w-[85%] flex-1 bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-[24px] text-white snap-center relative overflow-hidden shadow-lg" id="banner-2">
                      <div className="relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">Premium</span>
                        <h3 className="text-3xl font-black mt-3">Packers</h3>
                        <p className="text-sm font-bold text-teal-50 mb-3">Home relocation.</p>
                      </div>
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>

                    {/* Banner 3 */}
                    <div className="min-w-[85%] flex-1 bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-[24px] text-white snap-center relative overflow-hidden shadow-lg" id="banner-3">
                      <div className="relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">Speed</span>
                        <h3 className="text-3xl font-black mt-3">Lightning</h3>
                        <p className="text-sm font-bold text-pink-50 mb-3">Fast document delivery.</p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Auto-scroll Logic Component */}
                  <AutoScroller />
                  
                  <p className="text-xl font-black text-slate-800 mb-5">What are you moving?</p>
                  <div className="grid grid-cols-2 gap-4 pb-4">
                    {services.map((service) => (
                      <div 
                        key={service.id} onClick={() => handleServiceSelect(service)}
                        className={`p-5 rounded-[24px] bg-slate-50 transition-all duration-200 transform border border-slate-100
                          ${service.active ? 'cursor-pointer hover:bg-white hover:border-blue-200 hover:shadow-md active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="mb-4 p-3 bg-white w-fit rounded-2xl shadow-sm">{service.icon}</div>
                        <div className="font-black text-lg text-slate-800">{service.name}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1">{service.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- STEP: PICKUP / DROPOFF / ACTIVE --- */}
              {step !== 'selection' && (
                <div className="flex flex-col h-full">

                  {/* DESKTOP BACK BUTTON */}
                  <button 
                    onClick={() => { setStep('selection'); setOrderId(null); setOffer(null); setDropoff(null); }} 
                    className="hidden md:flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors mb-6 w-fit"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
                    Back to Services
                  </button>

                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="p-3 bg-blue-50 rounded-2xl shadow-inner">{services.find(s => s.id === vehicleType)?.icon}</div>
                      <span className="font-black text-2xl text-slate-800">{services.find(s => s.id === vehicleType)?.name}</span>
                  </div>

                  {status !== 'completed' && (
                    <div className="space-y-4 mb-8">
                      <div className="relative pl-6 border-l-4 border-green-400">
                        <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Pickup</div>
                        <div className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight mt-1">{pickupAddress || "Select on map..."}</div>
                      </div>
                      <div className="relative pl-6 border-l-4 border-red-400">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Dropoff</div>
                        <div className="text-sm font-bold text-slate-700 line-clamp-2 leading-tight mt-1">{dropoffAddress || "Select on map..."}</div>
                      </div>
                    </div>
                  )}

                  {step === 'pickup' && (
                    <div className="space-y-4 mt-auto">
                      <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all shadow-inner">
                        <input type="text" placeholder="Search pickup location..." value={pickupAddress} onChange={(e) => { setPickupAddress(e.target.value); setPickup(null); }} className="bg-transparent border-none flex-1 p-3 outline-none font-bold text-slate-700 placeholder:text-slate-400" />
                        <button onClick={async () => {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupAddress)}`);
                            const data = await res.json();
                            if (data.length > 0) setPickup([parseFloat(data[0].lat), parseFloat(data[0].lon)]); 
                          }} className="p-3 bg-white rounded-xl shadow-sm text-xl active:scale-90"
                        >🔍</button>
                      </div>

                      <button onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                              const lat = pos.coords.latitude; const lng = pos.coords.longitude; setPickup([lat, lng]);
                              try {
                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                const data = await res.json();
                                setPickupAddress(data.display_name.split(",")[0] + ", " + data.display_name.split(",")[1]);
                              } catch (e) { setPickupAddress("GPS Location Selected"); }
                            });
                          }
                        }} className="w-full p-4 rounded-2xl bg-blue-50 text-blue-600 font-black flex items-center justify-center gap-2 active:scale-95 transition-all border border-blue-100">
                        📍 Use Current Location
                      </button>

                      {pickup && (
                        <button className="w-full p-5 mt-2 rounded-2xl bg-slate-800 text-white font-black text-lg shadow-xl hover:bg-slate-700 active:scale-95 transition-all animate-fade-in-up" onClick={() => setStep('dropoff')}>
                          Confirm Pickup
                        </button>
                      )}
                    </div>
                  )}

                  {step === 'dropoff' && (
                    <div className="space-y-4 mt-auto">
                      <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all shadow-inner">
                        <input type="text" placeholder="Search destination..." value={dropoffAddress} onChange={(e) => { setDropoffAddress(e.target.value); setOffer(null); setDropoff(null); }} className="bg-transparent border-none flex-1 p-3 outline-none font-bold text-slate-700 placeholder:text-slate-400" />
                        <button onClick={async () => {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoffAddress)}`);
                            const data = await res.json();
                            if (data.length > 0) { setDropoff([parseFloat(data[0].lat), parseFloat(data[0].lon)]); setOffer(null); }
                          }} className="p-3 bg-white rounded-xl shadow-sm text-xl active:scale-90"
                        >🔍</button>
                      </div>
                      
                      {dropoff && !offer && (
                        <button className="w-full p-5 rounded-2xl bg-slate-800 text-white font-black text-lg shadow-xl hover:bg-slate-700 active:scale-95 transition-all" onClick={fetchPrice}>Calculate Fare</button>
                      )}

                      {offer && (
                        <div className="animate-fade-in-up mt-4">
                          <div className="bg-green-50 rounded-2xl p-6 mb-4 border border-green-200 text-center shadow-inner">
                            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{offer.price}</p>
                          </div>
                          <button className="w-full p-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-95 transition-all" onClick={payAndBook}>Pay & Book Now</button>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'finished' && status === 'requested' && (
                    <div className="text-center py-10 mt-auto">
                      <div className="w-14 h-14 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                      <h3 className="font-black text-2xl text-slate-800">Finding Drivers...</h3>
                      <p className="text-slate-400 font-bold mt-2 text-sm">Connecting to nearby partners</p>
                    </div>
                  )}

                  {status === 'accepted' && (
                    <div className="p-6 mt-auto bg-green-50 rounded-[24px] border border-green-100 text-center animate-fade-in shadow-sm">
                      <h3 className="text-green-600 font-black text-xl mb-4">Driver Arriving!</h3>
                      <div className="p-5 bg-white rounded-2xl shadow-sm text-center border border-slate-100">
                        <p className="font-black text-slate-800 text-xl">{driverName || "Your Driver"}</p>
                        <p className="font-bold text-blue-600 mt-2 text-lg">📞 {driverPhone || "No phone"}</p>
                      </div>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="text-center w-full mt-auto bg-white p-6 rounded-[30px] border border-slate-100 shadow-xl">
                      <h2 className="text-3xl font-black text-green-500 mb-6 italic">🏁 Finished!</h2>
                      {!isRated ? (
                        <div className="mb-6 p-6 bg-slate-50 rounded-[24px] text-center border border-slate-100 shadow-inner">
                          <h4 className="font-black text-slate-700 mb-4 text-sm uppercase tracking-wider">Rate your ride</h4>
                          <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button key={star} onClick={() => setRating(star)} className={`text-4xl transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}>★</button>
                            ))}
                          </div>
                          <textarea placeholder="Leave feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none h-20 font-bold resize-none"/>
                          <button onClick={submitRating} className="w-full mt-4 p-4 rounded-xl bg-blue-600 text-white font-black active:scale-95 transition-all shadow-md">Submit Feedback</button>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-green-50 rounded-2xl text-green-700 font-black text-sm border border-green-100">Feedback received ✓</div>
                      )}
                      <button className="w-full p-5 rounded-2xl bg-slate-800 text-white font-black hover:bg-slate-700 active:scale-95 transition-all shadow-lg" onClick={() => { localStorage.removeItem('indora_step'); localStorage.removeItem('indora_order_id'); window.location.reload(); }}>New Booking</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {currentTab === 'orders' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-black text-slate-800 mb-6">My Trips</h2>
              {loadingHistory ? (
                <div className="text-center p-10 text-slate-400 font-bold">Loading...</div>
              ) : orderHistory.length === 0 ? (
                <div className="text-center p-10 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-slate-500 font-bold">No past trips found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orderHistory.map(order => (
                    <div key={order.id} className="p-5 bg-slate-50 rounded-[24px] border border-slate-200 flex flex-col gap-3 hover:bg-white transition-colors cursor-pointer shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                        <span className="font-black text-slate-700">Order #{order.id}</span>
                        <span className={`font-black px-3 py-1 rounded-md text-[10px] uppercase tracking-wider ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-500 flex flex-col gap-2 py-1">
                        <p className="line-clamp-1"><span className="text-green-500 mr-2 text-sm">●</span>{order.pickup_address || "GPS Location Saved"}</p>
                        <p className="line-clamp-1"><span className="text-red-500 mr-2 text-sm">●</span>{order.dropoff_address || "GPS Location Saved"}</p>
                      </div>
                      <div className="mt-1 text-right font-black text-xl text-slate-800">₹{order.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {currentTab === 'profile' && (
            <div className="flex flex-col items-center w-full animate-fade-in-up">
              {profileView === 'main' && (
                <div className="w-full flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-full mb-4 flex items-center justify-center text-3xl shadow-inner border-4 border-white">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{userInfo.name}</h3>
                  <p className="text-slate-500 font-bold mb-8 text-sm">{userInfo.phone}</p>
                  
                  <div className="w-full space-y-3 mb-8">
                    <div onClick={() => setProfileView('edit_info')} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                      <span className="font-bold text-slate-700">Edit Personal Info</span><span className="text-slate-400 font-bold">➔</span>
                    </div>
                    <div onClick={() => setProfileView('saved_addresses')} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                      <span className="font-bold text-slate-700">Saved Addresses</span><span className="text-slate-400 font-bold">➔</span>
                    </div>
                    <div onClick={() => setProfileView('payment_methods')} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100">
                      <span className="font-bold text-slate-700">Payment Methods</span><span className="text-slate-400 font-bold">➔</span>
                    </div>
                  </div>
                  <button onClick={onLogout} className="w-full p-4 rounded-2xl bg-red-50 text-red-600 font-black hover:bg-red-100 transition-colors">Log Out</button>
                </div>
              )}

              {profileView === 'edit_info' && (
                <div className="w-full animate-fade-in-up">
                  <button onClick={() => setProfileView('main')} className="mb-6 font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all"><span>←</span> Back</button>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">Edit Info</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Full Name</label>
                      <input type="text" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Phone</label>
                      <input type="text" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Email</label>
                      <input type="email" value={userInfo.email} onChange={e => setUserInfo({...userInfo, email: e.target.value})} className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 outline-none font-bold text-slate-700 transition-all" />
                    </div>
                    <button onClick={handleProfileSave} className="w-full mt-6 p-4 rounded-2xl bg-blue-600 text-white font-black shadow-lg active:scale-95 transition-all">Save Changes</button>
                  </div>
                </div>
              )}

              {profileView === 'saved_addresses' && (
                <div className="w-full animate-fade-in-up">
                  <button onClick={() => setProfileView('main')} className="mb-6 font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all"><span>←</span> Back</button>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">Saved Addresses</h2>
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl shadow-inner">🏠</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-slate-800">Home</p>
                        <p className="font-bold text-slate-400 text-xs truncate">123 Maninagar St, Ahmedabad</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full p-4 rounded-2xl bg-slate-800 text-white font-black shadow-lg active:scale-95 transition-all" onClick={() => alert("Coming soon!")}>+ Add New</button>
                </div>
              )}

              {profileView === 'payment_methods' && (
                <div className="w-full animate-fade-in-up">
                  <button onClick={() => setProfileView('main')} className="mb-6 font-bold text-blue-600 flex items-center gap-2 hover:scale-105 transition-all"><span>←</span> Back</button>
                  <h2 className="text-2xl font-black text-slate-800 mb-6">Payment Methods</h2>
                  <div className="space-y-4 mb-6">
                    <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl shadow-md flex justify-between items-center">
                      <div>
                        <p className="font-black tracking-widest">•••• 4242</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Visa • 12/26</p>
                      </div>
                      <div className="text-xl font-black italic text-slate-400">VISA</div>
                    </div>
                  </div>
                  <button className="w-full p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 font-black active:scale-95 transition-all" onClick={() => alert("Coming soon!")}>+ Add Card</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HELP */}
          {currentTab === 'help' && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-black text-slate-800 mb-6">Support</h2>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6 rounded-[24px] shadow-lg mb-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">Need immediate help?</h3>
                  <p className="text-sm font-bold text-blue-100 mb-6">Available 24/7 in Ahmedabad.</p>
                  <a href="tel:6354327209" className="inline-block bg-white text-blue-600 font-black text-sm px-6 py-3 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all">
                    📞 Call 6354327209
                  </a>
                </div>
                <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
              </div>
              
              <h3 className="text-lg font-black text-slate-700 mb-4">FAQ</h3>
              <div className="space-y-3">
                {[
                  { q: 'How are prices calculated?', a: 'Prices are calculated based on the total distance, vehicle type, and live demand.' },
                  { q: 'Can I cancel my booking?', a: 'Yes, you can cancel before the driver arrives. A small fee may apply if they are near.' },
                  { q: 'What items are restricted?', a: 'We strictly prohibit hazardous materials, illegal substances, weapons, and live animals.' }
                ].map((faq, i) => (
                  <div key={i} onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-700 text-sm pr-4">{faq.q}</p>
                      <span className={`text-slate-400 font-black transition-transform duration-300 ${expandedFaq === i ? 'rotate-180 text-blue-600' : ''}`}>↓</span>
                    </div>
                    {expandedFaq === i && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs font-bold text-slate-500 animate-fade-in-up leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION */}
      {/* ========================================= */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] z-[3000] pointer-events-auto transition-transform duration-300 ${step !== 'selection' && currentTab === 'home' ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          <MobileNavBtn id="home" icon={<Icons.NavHome />} label="Book" />
          <MobileNavBtn id="orders" icon={<Icons.NavOrders />} label="Trips" />
          <MobileNavBtn id="profile" icon={<Icons.NavProfile />} label="Profile" />
          <MobileNavBtn id="help" icon={<Icons.NavHelp />} label="Help" />
        </div>
      </div>
      
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = (username, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('indora_customer_username', username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('indora_step');
    localStorage.removeItem('indora_order_id');
    localStorage.removeItem('indora_customer_username');
    setIsLoggedIn(false);
    window.location.reload();
  };

  if (!isLoggedIn) {
    return showLogin ? 
      <Login onLoginSuccess={handleLoginSuccess} switchToSignup={() => setShowLogin(false)} /> : 
      <Signup onSignupSuccess={() => setShowLogin(true)} switchToLogin={() => setShowLogin(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerHome onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;