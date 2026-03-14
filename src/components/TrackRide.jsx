import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from '../api/axios';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000');

export default function CustomerTrackRide({ orderId }) {
  const [order, setOrder] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // 1. Fetch order details to get driver info
    axios.get(`/api/orders/${orderId}/`).then((res) => {
        setOrder(res.data);
        if (res.data.status === 'completed') setShowRating(true);
    });

    // 2. Connect to Socket Room
    socket.emit('join_order', { order_id: orderId });

    // 3. Listen for Real-Time Events
    socket.on('ride_accepted_event', () => {
       // Refresh order details to get assigned driver info
       axios.get(`/api/orders/${orderId}/`).then(res => setOrder(res.data));
    });

    socket.on('ride_completed_event', () => {
      // Trigger the rating form to pop up
      setShowRating(true); 
    });

    return () => {
      socket.off('ride_accepted_event');
      socket.off('ride_completed_event');
      socket.disconnect();
    };
  }, [orderId]);

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/orders/${orderId}/rate_driver/`, { rating, feedback });
      alert("Thanks for your feedback!");
      setShowRating(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold">Ride Tracking</h2>

      {/* SHOW DRIVER DETAILS TO CUSTOMER */}
      {order.driver_name ? (
        <div className="my-4 p-3 bg-blue-50 rounded">
          <p><strong>Driver:</strong> {order.driver_name}</p>
          <p><strong>Phone:</strong> {order.driver_phone || "Not provided"}</p>
        </div>
      ) : (
        <p className="my-4">Waiting for a driver to accept...</p>
      )}

      {/* RATING FORM (Triggered when driver completes delivery) */}
      {showRating && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Rate Your Delivery</h3>
          <form onSubmit={submitRating}>
            <label className="block mb-2">
              Rating (1-5):
              <input 
                type="number" min="1" max="5" 
                value={rating} onChange={(e) => setRating(e.target.value)} 
                className="ml-2 border p-1 rounded" 
              />
            </label>
            <label className="block mb-2">
              Feedback:
              <textarea 
                value={feedback} onChange={(e) => setFeedback(e.target.value)} 
                className="w-full border p-2 rounded mt-1" rows="3"
                placeholder="How was your ride?"
              />
            </label>
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded mt-2">
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
}