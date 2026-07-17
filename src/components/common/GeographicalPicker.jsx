import React, { useState, useEffect } from 'react';
import geoService from '../../services/geoService';

export default function GeographicalPicker({ onChange, value = {} }) {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [areaType, setAreaType] = useState(value.areaType || 'Rural'); // 'Rural' or 'Urban'
  const [blocks, setBlocks] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedDivision, setSelectedDivision] = useState(value.divisionId || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value.districtId || '');
  const [selectedBlock, setSelectedBlock] = useState(value.blockId || '');
  const [selectedPanchayat, setSelectedPanchayat] = useState(value.panchayatId || '');
  const [selectedMunicipality, setSelectedMunicipality] = useState(value.municipalityId || '');
  const [selectedWard, setSelectedWard] = useState(value.wardId || '');

  // Load Divisions
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const data = await geoService.getDivisions();
        setDivisions(data || []);
      } catch (err) {
        console.error('Failed to load divisions:', err);
      }
    };
    fetchDivisions();
  }, []);

  // Load Districts when Division changes
  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }
    const fetchDistricts = async () => {
      try {
        const data = await geoService.getDistricts(selectedDivision);
        setDistricts(data || []);
        setSelectedDistrict('');
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    fetchDistricts();
  }, [selectedDivision]);

  // Load Blocks or Municipalities when District or AreaType changes
  useEffect(() => {
    if (!selectedDistrict) {
      setBlocks([]);
      setMunicipalities([]);
      setSelectedBlock('');
      setSelectedMunicipality('');
      return;
    }

    const fetchDistrictSubData = async () => {
      try {
        if (areaType === 'Rural') {
          const data = await geoService.getBlocks(selectedDistrict);
          setBlocks(data || []);
          setMunicipalities([]);
          setSelectedBlock('');
          setSelectedMunicipality('');
        } else {
          const data = await geoService.getMunicipalities(selectedDistrict);
          setMunicipalities(data || []);
          setBlocks([]);
          setSelectedBlock('');
          setSelectedMunicipality('');
        }
      } catch (err) {
        console.error('Failed to load district details:', err);
      }
    };
    fetchDistrictSubData();
  }, [selectedDistrict, areaType]);

  // Load Panchayats when Block changes
  useEffect(() => {
    if (!selectedBlock) {
      setPanchayats([]);
      setSelectedPanchayat('');
      return;
    }
    const fetchPanchayats = async () => {
      try {
        const data = await geoService.getPanchayats(selectedBlock);
        setPanchayats(data || []);
        setSelectedPanchayat('');
      } catch (err) {
        console.error('Failed to load panchayats:', err);
      }
    };
    fetchPanchayats();
  }, [selectedBlock]);

  // Load Wards when Municipality changes
  useEffect(() => {
    if (!selectedMunicipality) {
      setWards([]);
      setSelectedWard('');
      return;
    }
    const fetchWards = async () => {
      try {
        const data = await geoService.getWards(selectedMunicipality);
        setWards(data || []);
        setSelectedWard('');
      } catch (err) {
        console.error('Failed to load wards:', err);
      }
    };
    fetchWards();
  }, [selectedMunicipality]);

  // Notify parent component of changes
  useEffect(() => {
    const selectedDivisionObj = divisions.find(d => d.id === parseInt(selectedDivision));
    const selectedDistrictObj = districts.find(d => d.id === parseInt(selectedDistrict));
    const selectedBlockObj = blocks.find(b => b.id === parseInt(selectedBlock));
    const selectedPanchayatObj = panchayats.find(p => p.id === parseInt(selectedPanchayat));
    const selectedMunicipalityObj = municipalities.find(m => m.id === parseInt(selectedMunicipality));
    const selectedWardObj = wards.find(w => w.id === parseInt(selectedWard));

    onChange({
      divisionId: selectedDivision,
      divisionName: selectedDivisionObj?.name || '',
      districtId: selectedDistrict,
      districtName: selectedDistrictObj?.name || '',
      areaType,
      blockId: areaType === 'Rural' ? selectedBlock : '',
      blockName: areaType === 'Rural' ? selectedBlockObj?.name : '',
      panchayatId: areaType === 'Rural' ? selectedPanchayat : '',
      panchayatName: areaType === 'Rural' ? selectedPanchayatObj?.name : '',
      municipalityId: areaType === 'Urban' ? selectedMunicipality : '',
      municipalityName: areaType === 'Urban' ? selectedMunicipalityObj?.name : '',
      wardId: areaType === 'Urban' ? selectedWard : '',
      wardName: areaType === 'Urban' ? selectedWardObj?.name : '',
    });
  }, [
    selectedDivision,
    selectedDistrict,
    areaType,
    selectedBlock,
    selectedPanchayat,
    selectedMunicipality,
    selectedWard,
    divisions,
    districts,
    blocks,
    panchayats,
    municipalities,
    wards
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Division</label>
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Division</option>
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>{div.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">District</label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedDivision}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">Select District</option>
          {districts.map((dist) => (
            <option key={dist.id} value={dist.id}>{dist.name}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Area Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="areaType"
              value="Rural"
              checked={areaType === 'Rural'}
              onChange={() => setAreaType('Rural')}
              className="accent-indigo-600"
            />
            Rural (Block / Panchayat)
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-300 cursor-pointer">
            <input
              type="radio"
              name="areaType"
              value="Urban"
              checked={areaType === 'Urban'}
              onChange={() => setAreaType('Urban')}
              className="accent-indigo-600"
            />
            Urban (Municipality / Ward)
          </label>
        </div>
      </div>

      {areaType === 'Rural' ? (
        <>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Panchayat</label>
            <select
              value={selectedPanchayat}
              onChange={(e) => setSelectedPanchayat(e.target.value)}
              disabled={!selectedBlock}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Panchayat</option>
              {panchayats.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Municipality</label>
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Municipality</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedMunicipality}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select Ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
