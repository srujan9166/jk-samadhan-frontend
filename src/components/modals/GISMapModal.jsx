import React, { useState, useEffect } from 'react';
import { X, MapPin, Compass, Navigation } from 'lucide-react';
import geoService from '../../services/geoService';

export default function GISMapModal({ isOpen, onClose, onLocationSelect, currentDistrictName }) {
  const [districtId, setDistrictId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockId, setBlockId] = useState('');
  const [panchayats, setPanchayats] = useState([]);
  const [panchayatId, setPanchayatId] = useState('');

  // Coordinates
  const [lat, setLat] = useState('34.0837');
  const [lng, setLng] = useState('74.7973');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDistricts = async () => {
      try {
        const divs = await geoService.getDivisions();
        const allDists = [];
        for (const div of divs) {
          const distData = await geoService.getDistricts(div.id);
          allDists.push(...distData);
        }
        if (active) {
          setDistricts(allDists);
          if (currentDistrictName) {
            const matched = allDists.find(d => d.name.toLowerCase() === currentDistrictName.toLowerCase());
            if (matched) {
              setDistrictId(matched.id.toString());
            }
          }
        }
      } catch (err) {
        console.error('Error loading districts in GIS map:', err);
      }
    };
    if (isOpen) {
      loadDistricts();
    }
    return () => { active = false; };
  }, [isOpen, currentDistrictName]);

  // Load blocks when district changes
  useEffect(() => {
    let active = true;
    const loadBlocks = async () => {
      if (districtId) {
        try {
          const data = await geoService.getBlocks(Number(districtId));
          if (active) {
            setBlocks(data);
            setBlockId('');
            setPanchayats([]);
            setPanchayatId('');
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        if (active) setBlocks([]);
      }
    };
    loadBlocks();
    return () => { active = false; };
  }, [districtId]);

  // Load panchayats when block changes
  useEffect(() => {
    let active = true;
    const loadPanchayats = async () => {
      if (blockId) {
        try {
          const data = await geoService.getPanchayats(Number(blockId));
          if (active) {
            setPanchayats(data || []);
            setPanchayatId('');
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        if (active) setPanchayats([]);
      }
    };
    loadPanchayats();
    return () => { active = false; };
  }, [blockId]);

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const computedLat = (34.5 - (y / rect.height) * 1.5).toFixed(6);
    const computedLng = (74.2 + (x / rect.width) * 1.8).toFixed(6);
    
    setLat(computedLat);
    setLng(computedLng);
    setPinned(true);
  };

  const handleSave = () => {
    const selectedDistrict = districts.find(d => d.id.toString() === districtId)?.name || '';
    const selectedBlock = blocks.find(b => b.id.toString() === blockId)?.name || '';
    const selectedPanchayat = panchayats.find(p => p.id.toString() === panchayatId)?.name || '';

    onLocationSelect({
      latitude: lat,
      longitude: lng,
      district: selectedDistrict,
      block: selectedBlock,
      panchayat: selectedPanchayat
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col h-[85vh] border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#164581] text-white px-6 py-4 flex justify-between items-center relative font-sans">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
          <div className="flex items-center gap-2.5 mt-1">
            <Compass className="h-5 w-5 text-orange-400" />
            <div className="text-left font-sans">
              <h3 className="font-bold text-sm">Grievance GIS Location Marker</h3>
              <p className="text-[10px] text-slate-350">Interact with the map to pin the geographic location of your concern</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer bg-transparent border-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
          <div className="space-y-1">
            <label className="block font-bold text-slate-650 uppercase">District</label>
            <select 
              value={districtId} 
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full border border-slate-300 rounded bg-white px-2.5 py-1.5 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
            >
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block font-bold text-slate-650 uppercase">Block / Tehsil</label>
            <select 
              value={blockId} 
              disabled={!districtId}
              onChange={(e) => setBlockId(e.target.value)}
              className="w-full border border-slate-300 rounded bg-white px-2.5 py-1.5 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            >
              <option value="">Select Block</option>
              {blocks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block font-bold text-slate-655 uppercase">Village / Panchayat</label>
            <select 
              value={panchayatId} 
              disabled={!blockId}
              onChange={(e) => setPanchayatId(e.target.value)}
              className="w-full border border-slate-300 rounded bg-white px-2.5 py-1.5 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            >
              <option value="">Select Panchayat</option>
              {panchayats.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Canvas and Info panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Map Area */}
          <div 
            className="flex-1 bg-slate-200 relative overflow-hidden cursor-crosshair select-none"
            onClick={handleMapClick}
          >
            {/* Mock Vector Map of J&K with topographic styling */}
            <div className="absolute inset-0 bg-[#cbdcf0] flex items-center justify-center">
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'radial-gradient(#1e293b 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
              
              <svg className="absolute w-[120%] h-[120%] opacity-20 text-slate-700 pointer-events-none" viewBox="0 0 100 100">
                <path d="M10,20 Q30,40 50,20 T90,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M5,40 Q25,60 55,30 T85,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M20,60 Q40,80 60,60 T100,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,80 Q20,100 50,80 T90,90" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
              
              <div className="absolute font-sans font-black text-slate-450 uppercase tracking-widest pointer-events-none select-none text-2xl opacity-15">
                Jammu & Kashmir GIS
              </div>
            </div>

            {/* Pinned Marker */}
            {pinned && (
              <div 
                className="absolute text-red-650 drop-shadow-md select-none pointer-events-none -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5 animate-bounce"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <MapPin className="h-8 w-8 fill-red-500 stroke-white stroke-[1.5]" />
                <span className="bg-slate-900/90 text-white font-bold font-mono px-2 py-0.5 rounded text-[8px] tracking-wide uppercase select-none">Pinned</span>
              </div>
            )}
            
            <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-[10px] font-bold text-slate-505 pointer-events-none select-none flex items-center gap-1.5 uppercase font-sans">
              <Navigation className="h-3 w-3 text-indigo-650 animate-pulse" />
              <span>Click anywhere on the map grid to pin location coordinates</span>
            </div>
          </div>

          {/* Coordinates Details Side Panel */}
          <div className="w-full md:w-64 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between text-left">
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-805 uppercase tracking-wider border-b border-slate-200 pb-2">Coordinates Log</h4>
              
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5 font-mono text-[11px] shadow-2xs">
                <div>
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Latitude</span>
                  <span className="font-bold text-slate-800">{lat}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Longitude</span>
                  <span className="font-bold text-slate-800">{lng}</span>
                </div>
              </div>

              {districtId && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px] shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Bound Area</span>
                  <div className="font-bold text-slate-655 space-y-0.5 font-sans">
                    <p>Dist: {districts.find(d => d.id.toString() === districtId)?.name}</p>
                    {blockId && <p>Block: {blocks.find(b => b.id.toString() === blockId)?.name}</p>}
                    {panchayatId && <p>Panch: {panchayats.find(p => p.id.toString() === panchayatId)?.name}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-6 font-sans">
              <button 
                onClick={handleSave}
                disabled={!pinned || !districtId}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all border-0 shadow-sm"
              >
                Apply Pinned Location
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 border border-slate-350 hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs cursor-pointer transition-all bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
