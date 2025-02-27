'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Map as LeafletMap, LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

interface MapDataItem {
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
}

interface MapProps {
  data: MapDataItem[];
  selectedLocation: [number, number] | null;
}

function createCustomIcon(name: string) {
  return divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-label">${name}</div>
        <div class="map-pin">
          <div class="pin-head">
            <span>${name.charAt(0).toUpperCase()}</span>
          </div>
          <div class="pin-tail"></div>
          <div class="pin-dot"></div>
        </div>
      </div>
    `,
    iconSize: [34, 54],
    iconAnchor: [17, 54],
    popupAnchor: [0, -50]
  });
}

export default function Map({ data, selectedLocation }: MapProps) {
  const mapRef = useRef<LeafletMap>(null);
  const defaultCenter: LatLngExpression = [0, 0];

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.setView(selectedLocation, 13);
    }
  }, [selectedLocation]);

  return (
    <div className="relative">
      <style jsx global>{`
        .marker-container {
          position: relative;
          cursor: pointer;
        }

        .marker-label {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 1000;
        }

        .marker-container:hover .marker-label {
          opacity: 1;
        }

        .map-pin {
          position: relative;
          width: 34px;
          height: 54px;
          cursor: pointer;
        }

        .pin-head {
          position: absolute;
          top: 0;
          left: 0;
          width: 34px;
          height: 34px;
          background: #DB4437;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .pin-head span {
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: 500;
          margin-top: -2px;
          margin-left: -2px;
        }

        .pin-tail {
          position: absolute;
          top: 24px;
          left: 17px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 30px 3px 0 3px;
          border-color: #DB4437 transparent transparent transparent;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
        }

        .pin-dot {
          position: absolute;
          bottom: 0;
          left: 13px;
          width: 8px;
          height: 8px;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
        }

        .marker-container:hover .pin-head {
          transform: rotate(-45deg) scale(1.1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        }

        /* Update popup styles for better visibility */
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          color: #333;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 3px 14px rgba(0,0,0,0.3);
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        .custom-popup .leaflet-popup-content {
          margin: 8px 12px;
          line-height: 1.4;
        }
      `}</style>
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={2}
        scrollWheelZoom={true}
        className="h-[600px] w-full rounded-lg"
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((item, index) => (
          <Marker 
            key={index} 
            position={item.coordinates}
            icon={createCustomIcon(item.name)}
          >
            <Popup className="custom-popup">
              <div className="text-center">
                <p className="font-bold text-lg">{item.name}</p>
                <p className="text-sm">{`${item.city}, ${item.country}`}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
