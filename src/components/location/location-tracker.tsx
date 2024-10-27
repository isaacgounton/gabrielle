"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Copy, Check, Compass, Navigation } from 'lucide-react';

const LocationTracker = () => {
  // Moved all state initialization into useEffect to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [history, setHistory] = useState<Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  }>>([]);
  const [copied, setCopied] = useState(false);

  // Add mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let watchId: number;

    const startWatching = () => {
      if (typeof window !== 'undefined' && "geolocation" in navigator) {
        setWatching(true);
        
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading,
              timestamp: position.timestamp
            };
            
            setLocation(newLocation);
            setHistory(prev => [...prev, newLocation].slice(-50));
            setError(null);
          },
          (err) => {
            setError(`Error: ${err.message}`);
            setWatching(false);
          },
          options
        );
      } else {
        setError("Geolocation is not supported by your browser");
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatching(false);
      }
    };
  }, [mounted]); // Added mounted to dependencies

  const copyCoordinates = async () => {
    if (location) {
      const text = `${location.latitude}, ${location.longitude}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Return null or loading state before mounting
  if (!mounted) {
    return null;
  }

  // Format date safely with a stable output
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GPS Location Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${watching ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">
                  {watching ? 'Tracking active' : 'Tracking inactive'}
                </span>
              </div>
              
              {location && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">Latitude</div>
                      <div className="text-lg flex items-center gap-2">
                        {location.latitude.toFixed(6)}°
                        <button
                          onClick={copyCoordinates}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy coordinates"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">Longitude</div>
                      <div className="text-lg">{location.longitude.toFixed(6)}°</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-1">
                          <Navigation className="h-4 w-4" />
                          Speed
                        </div>
                      </div>
                      <div>{location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-1">
                          <Compass className="h-4 w-4" />
                          Heading
                        </div>
                      </div>
                      <div>{location.heading ? `${location.heading.toFixed(1)}°` : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Accuracy</div>
                    <div>{location.accuracy.toFixed(1)} meters</div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Last updated: {formatTime(location.timestamp)}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {location && (
        <>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Location History
                </div>
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {history.slice().reverse().map((pos) => (
                  <div key={pos.timestamp} className="text-sm flex justify-between p-2 hover:bg-gray-50 rounded">
                    <div>
                      {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}
                    </div>
                    <div className="text-gray-500">
                      {formatTime(pos.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <iframe
                  title="Location Map"
                  width="100%"
                  height="300"
                  frameBorder="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                  className="rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default LocationTracker;