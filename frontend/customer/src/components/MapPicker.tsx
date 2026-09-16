import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  onLocationSelect: (addressData: { address: string; city: string; state: string; zip: string; country: string }) => void;
}

// Center initially on India / Mumbai or user's location
const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 }; 

const LocationMarker = ({ position, setPosition, onLocationSelect }: any) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Construct street address
        const streetParts = [];
        if (addr.house_number) streetParts.push(addr.house_number);
        if (addr.road) streetParts.push(addr.road);
        if (addr.suburb) streetParts.push(addr.suburb);
        
        const street = streetParts.join(', ') || data.display_name.split(',')[0];
        
        onLocationSelect({
          address: street,
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          zip: addr.postcode || '',
          country: addr.country || 'India'
        });
      }
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  return position === null ? null : (
    <Marker position={position} />
  );
};

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    // Attempt to get user's current location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(latlng);
          // Don't auto-fetch address for user's initial load to save API calls, wait for them to click
        },
        () => {
          // Fallback to default
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0 relative">
      <MapContainer 
        center={DEFAULT_CENTER} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-none shadow-lg">
        Tap anywhere to drop pin
      </div>
    </div>
  );
};

export default MapPicker;
