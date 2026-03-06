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
  Settings: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  // New Nav Icons
  NavHome: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  NavOrders: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  NavProfile: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  NavHelp: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
};

function CustomerHome({ onLogout }) {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'orders', 'profile', 'help'
  
  // Booking State
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

  // User History State
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('indora_step', step);
  }, [step]);

  useEffect(() => {
    if (orderId) {
      localStorage.setItem('indora_order_id', orderId);
    } else {
      localStorage.removeItem('indora_order_id');
    }
  }, [orderId]);

  // Fetch Order History when 'orders' tab is opened
  useEffect(() => {
    if (currentTab === 'orders') {
      setLoadingHistory(true);
      api.get('rides/')
        .then(res => {
          // Sort newest first
          const sorted = res.data.sort((a, b) => b.id - a.id);
          setOrderHistory(sorted);
        })
        .catch(err => console.error("Error fetching history", err))
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
    } catch (error) {
      console.error("Pricing Error:", error);
      alert(`❌ Error: ${error.response?.data?.detail || "Could not calculate price"}`);
    }
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
        const currentStatus = response.data.status.toLowerCase();
        
        setStatus(currentStatus);
        
        if (response.data.driver_name) setDriverName(response.data.driver_name);
        if (response.data.driver_phone) setDriverPhone(response.data.driver_phone);
        if (response.data.driver_lat) setDriverLocation([response.data.driver_lat, response.data.driver_lng]);
        
        if (response.data.rating) {
          setIsRated(true);
          setRating(response.data.rating);
          setFeedback(response.data.feedback || "");
        }
      } catch (error) { 
        console.error("Error fetching order status:", error); 
      }
    };

    fetchCurrentStatus();
    socket.on('ride_accepted_event', fetchCurrentStatus);
    socket.on('ride_completed_event', fetchCurrentStatus);

    socket.on('driver_location_update', (data) => {
        if (data.lat && data.lng) {
            setDriverLocation([data.lat, data.lng]);
        }
    });

    const interval = setInterval(fetchCurrentStatus, 3000); 

    return () => {
      clearInterval(interval);
      socket.off('ride_accepted_event');
      socket.off('ride_completed_event');
      socket.off('driver_location_update');
      socket.disconnect();
    };
  }, [orderId, step]);

  const submitRating = async () => {
    if (rating === 0) return alert("Please select a star rating");
    try {
      await api.post(`rides/${orderId}/rate_driver/`, { rating: rating, feedback: feedback });
      setIsRated(true);
    } catch (error) {
      console.error("Rating Error:", error);
    }
  };

  // Nav Item helper
  const NavItem = ({ id, icon, label }) => (
    <button 
      onClick={() => setCurrentTab(id)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all ${currentTab === id ? 'text-blue-600 font-black' : 'text-slate-400 font-bold hover:text-blue-400'}`}
    >
      <div className={`mb-1 ${currentTab === id ? 'scale-110 drop-shadow-md' : 'scale-100'}`}>{icon}</div>
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-screen relative bg-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* ========================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================= */}
      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* TAB 1: HOME (Booking Flow) */}
        {currentTab === 'home' && (
          <>
            {step === 'selection' && (
              <div className="p-6 md:p-8 max-w-2xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0 mt-4">
                  <h1 className="text-4xl font-black text-blue-600 tracking-tighter italic">INDORA</h1>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-blue-600 cursor-pointer" onClick={() => setCurrentTab('profile')}>
                    <Icons.NavProfile />
                  </div>
                </div>

                {/* Promotional Banners */}
                <div className="flex overflow-x-auto gap-4 mb-8 pb-4 snap-x shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="min-w-[85%] md:min-w-[48%] bg-gradient-to-br from-blue-600 to-indigo-500 p-6 rounded-[30px] shadow-[8px_8px_20px_rgba(37,99,235,0.2)] text-white snap-center relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">First Ride</span>
                      <h3 className="text-3xl font-black mt-3 mb-1 tracking-tight">50% OFF</h3>
                      <p className="text-sm font-bold text-blue-100 mb-5">On your first two-wheeler delivery.</p>
                      <button className="bg-white text-blue-600 font-black text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all">Claim Offer</button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  </div>

                  <div className="min-w-[85%] md:min-w-[48%] bg-gradient-to-br from-emerald-500 to-teal-400 p-6 rounded-[30px] shadow-[8px_8px_20px_rgba(16,185,129,0.2)] text-white snap-center relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">Premium</span>
                      <h3 className="text-3xl font-black mt-3 mb-1 tracking-tight">Moving?</h3>
                      <p className="text-sm font-bold text-teal-50 mb-5">Stress-free home relocation.</p>
                      <button className="bg-white text-teal-600 font-black text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all">Book Now</button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Services Section */}
                <p className="text-xl font-black text-slate-500 mb-6 shrink-0">What are you moving today?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                  {services.map((service) => (
                    <div 
                      key={service.id} onClick={() => handleServiceSelect(service)}
                      className={`p-6 md:p-8 rounded-[40px] bg-white transition-all duration-300 transform
                        ${service.active ? 'cursor-pointer shadow-[20px_20px_40px_#e2e8f0,-20px_-20px_40px_#ffffff] hover:scale-[1.03] active:scale-[0.97]' : 'opacity-50 cursor-not-allowed border-4 border-dashed border-slate-200 shadow-none'}`}
                    >
                      <div className="mb-4 p-4 bg-slate-50 w-fit rounded-3xl shadow-inner">{service.icon}</div>
                      <div className="font-black text-2xl text-slate-800">{service.name}</div>
                      <div className="text-sm font-bold text-slate-400 mt-1">{service.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step !== 'selection' && (
              <div className="relative h-full w-full">
                <div className="absolute top-6 left-6 z-[2000]">
                  <button onClick={() => { setStep('selection'); setOrderId(null); setOffer(null); setDropoff(null); }} className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-slate-700 shadow-[8px_8px_16px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] hover:bg-white transition-all flex items-center gap-2">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
                    Back
                  </button>
                </div>

                <IndoraMap 
                  pickup={pickup} setPickup={setPickup} dropoff={dropoff} setDropoff={setDropoff}
                  driverLocation={driverLocation} pickupAddress={pickupAddress} dropoffAddress={dropoffAddress}
                  setPickupAddress={setPickupAddress} setDropoffAddress={setDropoffAddress}
                  step={step} setStep={setStep} routeGeometry={offer ? offer.route_geometry : null}
                />

                {/* Bottom Booking Card */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                      <div className="p-3 bg-blue-50 rounded-2xl shadow-inner">{services.find(s => s.id === vehicleType)?.icon}</div>
                      <span className="font-black text-2xl text-slate-800">{services.find(s => s.id === vehicleType)?.name}</span>
                  </div>

                  {status !== 'completed' && (
                    <div className="space-y-5 mb-8">
                      <div className="relative pl-6 border-l-4 border-green-400">
                        <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Pickup</div>
                        <div className="text-sm font-black text-slate-700 line-clamp-1 truncate">{pickupAddress || "Select on map..."}</div>
                      </div>
                      <div className="relative pl-6 border-l-4 border-red-400">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Dropoff</div>
                        <div className="text-sm font-black text-slate-700 line-clamp-1 truncate">{dropoffAddress || "Select on map..."}</div>
                      </div>
                    </div>
                  )}

                  {step === 'pickup' && (
                    <button className="w-full p-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-[8px_8px_20px_rgba(37,99,235,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2)] hover:bg-blue-700 active:scale-95 transition-all" onClick={() => setStep('dropoff')}>
                      Confirm Pickup
                    </button>
                  )}

                  {step === 'dropoff' && (
                    <div className="space-y-4">
                      <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl shadow-inner border border-slate-100">
                        <input type="text" placeholder="Search destination..." value={dropoffAddress} onChange={(e) => { setDropoffAddress(e.target.value); setOffer(null); setDropoff(null); }} className="bg-transparent border-none flex-1 p-3 outline-none font-black text-slate-700 placeholder:text-slate-300" />
                        <button onClick={async () => {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoffAddress)}`);
                            const data = await res.json();
                            if (data.length > 0) { setDropoff([parseFloat(data[0].lat), parseFloat(data[0].lon)]); setOffer(null); }
                          }} className="p-3 bg-white rounded-xl shadow-md text-xl"
                        >🔍</button>
                      </div>
                      
                      {dropoff && !offer && (
                        <button className="w-full p-5 rounded-2xl bg-slate-800 text-white font-black text-lg shadow-xl active:scale-95 transition-all" onClick={fetchPrice}>Calculate Fare</button>
                      )}

                      {offer && (
                        <div className="animate-fade-in-up mt-2">
                          <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200 text-center shadow-inner">
                            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Estimated Fare</p>
                            <p className="text-4xl font-black text-slate-800 tracking-tighter">₹{offer.price}</p>
                          </div>
                          <button className="w-full p-5 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-[8px_8px_20px_rgba(37,99,235,0.3),inset_-4px_-4px_8px_rgba(0,0,0,0.2)] hover:bg-blue-700 active:scale-95 transition-all" onClick={payAndBook}>Pay & Book Now</button>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'finished' && status === 'requested' && (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                      <h3 className="font-black text-2xl text-slate-800">Finding Drivers...</h3>
                    </div>
                  )}

                  {status === 'accepted' && (
                    <div className="p-8 bg-green-50 rounded-[40px] shadow-inner border border-green-100 text-center animate-pulse w-full">
                      <h3 className="text-green-600 font-black text-2xl">Driver Found!</h3>
                      <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 w-full text-center">
                        <p className="font-bold text-slate-600 text-lg">Driver: {driverName || "Your Driver"}</p>
                        <p className="font-bold text-blue-600">📞 {driverPhone || "No phone provided"}</p>
                      </div>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="text-center w-full">
                      <h2 className="text-3xl font-black text-green-500 mb-4 italic">🏁 Trip Finished!</h2>
                      {!isRated ? (
                        <div className="mb-6 p-6 bg-slate-50 rounded-[30px] shadow-inner text-center">
                          <h4 className="font-black text-slate-700 mb-4">How was your ride?</h4>
                          <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button key={star} onClick={() => setRating(star)} className={`text-5xl transition-all ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</button>
                            ))}
                          </div>
                          <textarea placeholder="Leave feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full p-4 rounded-2xl bg-white border outline-none h-24 font-bold resize-none"/>
                          <button onClick={submitRating} className="w-full mt-4 p-5 rounded-2xl bg-blue-600 text-white font-black shadow-lg">Submit Feedback</button>
                        </div>
                      ) : (
                        <div className="mb-6 p-6 bg-green-50 rounded-[30px] text-green-700 font-black shadow-inner">Feedback received ✓</div>
                      )}
                      <button className="w-full p-4 rounded-2xl bg-slate-200 text-slate-700 font-black hover:bg-slate-300" onClick={() => { localStorage.removeItem('indora_step'); localStorage.removeItem('indora_order_id'); window.location.reload(); }}>New Booking</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: ORDERS */}
        {/* TAB 2: ORDERS */}
        {currentTab === 'orders' && (
          <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-6">My Trips</h2>
            {loadingHistory ? (
              <div className="text-center p-10 text-slate-400 font-bold">Loading your trips...</div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-3xl shadow-sm">
                <p className="text-slate-500 font-bold text-lg">No past trips found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map(order => (
                  <div key={order.id} className="p-5 bg-white rounded-2xl shadow-[4px_4px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <span className="font-black text-slate-700">Order #{order.id}</span>
                      <span className={`font-black px-3 py-1 rounded-md text-xs uppercase tracking-wider ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                    </div>
                    
                    {/* ---> ADDED FALLBACKS AND TRUNCATE HERE <--- */}
                    <div className="text-sm font-bold text-slate-500 flex flex-col gap-2">
                      <p className="line-clamp-1 truncate">
                        <span className="text-green-500 mr-2">●</span>
                        {order.pickup_address || "GPS Location Saved"}
                      </p>
                      <p className="line-clamp-1 truncate">
                        <span className="text-red-500 mr-2">●</span>
                        {order.dropoff_address || "GPS Location Saved"}
                      </p>
                    </div>

                    <div className="mt-2 text-right font-black text-lg text-slate-800">₹{order.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {currentTab === 'profile' && (
          <div className="p-6 md:p-8 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-black text-slate-800 mb-8 w-full text-left">Profile</h2>
            
            <div className="w-32 h-32 bg-slate-200 rounded-full mb-6 flex items-center justify-center shadow-inner border-4 border-white">
              <Icons.NavProfile />
            </div>
            
            <h3 className="text-2xl font-black text-slate-700 mb-2">My Account</h3>
            <p className="text-slate-500 font-bold mb-10">Manage your details and preferences.</p>

            <div className="w-full space-y-4 mb-10">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                <span className="font-bold text-slate-600">Edit Personal Info</span>
                <span className="text-slate-400">➔</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                <span className="font-bold text-slate-600">Saved Addresses</span>
                <span className="text-slate-400">➔</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                <span className="font-bold text-slate-600">Payment Methods</span>
                <span className="text-slate-400">➔</span>
              </div>
            </div>

            <button 
              onClick={onLogout} 
              className="w-full p-5 rounded-2xl bg-red-50 text-red-600 font-black text-lg border border-red-100 hover:bg-red-100 transition-all active:scale-95"
            >
              Log Out
            </button>
          </div>
        )}

        {/* TAB 4: HELP */}
        {currentTab === 'help' && (
          <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-6">Support & FAQ</h2>
            
            <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">Need immediate help?</h3>
                <p className="font-bold text-blue-100 mb-6">Our support team is available 24/7.</p>
                <button className="bg-white text-blue-600 font-black px-6 py-3 rounded-xl shadow-md">Call Support</button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            </div>

            <h3 className="text-xl font-black text-slate-700 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {['How are prices calculated?', 'Can I cancel my booking?', 'What items are restricted?'].map((q, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer">
                  <p className="font-bold text-slate-700">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* BOTTOM NAVIGATION BAR */}
      {/* (Hidden only when actively viewing the map) */}
      {/* ========================================= */}
      {!(currentTab === 'home' && step !== 'selection') && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] z-[3000]">
          <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4">
            <NavItem id="home" icon={<Icons.NavHome />} label="Home" />
            <NavItem id="orders" icon={<Icons.NavOrders />} label="Orders" />
            <NavItem id="profile" icon={<Icons.NavProfile />} label="Profile" />
            <NavItem id="help" icon={<Icons.NavHelp />} label="Help" />
          </div>
        </div>
      )}
      
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
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('indora_step');
    localStorage.removeItem('indora_order_id');
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