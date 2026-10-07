import React, { useEffect, useState } from 'react';
import { Building2, MapPin, X } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';

interface AddVacantFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVacantFlatModal: React.FC<AddVacantFlatModalProps> = ({ isOpen, onClose }) => {
  const { societies, currentSocietyName, addApartment } = useSociety();
  const [societyName, setSocietyName] = useState(currentSocietyName);
  const [flatNumber, setFlatNumber] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState(1);
  const [flatType, setFlatType] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const selectedSociety = societies.find((society) => society.name === societyName);
  const blockOptions = selectedSociety?.wingBlock.split(',').map((block) => block.trim()).filter(Boolean) || [];

  useEffect(() => {
    if (!selectedSociety) return;
    const firstBlock = selectedSociety.wingBlock.split(',').map((block) => block.trim()).find(Boolean);
    setWing(firstBlock || selectedSociety.wingBlock);
    setFloor(selectedSociety.floors || 1);
    setFlatType(selectedSociety.flatType);
    setPropertyAddress(selectedSociety.propertyAddress);
  }, [societyName, selectedSociety]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const result = addApartment({ societyName, flatNumber, wing, floor, flatType, propertyAddress });
    if (!result.success) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <section aria-labelledby="add-vacant-flat-title" aria-modal="true" className="my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Building2 className="h-5 w-5" /></div>
            <div>
              <h2 id="add-vacant-flat-title" className="text-base font-bold text-slate-950">Add flat</h2>
              <p className="mt-0.5 text-xs text-slate-500">Add an available unit to a society’s inventory.</p>
            </div>
          </div>
          <button aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        </div>

        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}
          <label className="block text-xs font-semibold text-slate-700">
            Society *
            <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setSocietyName(event.target.value)} required value={societyName}>
              {societies.map((society) => <option key={society.id} value={society.name}>{society.name}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Apartment / unit number *
              <input autoFocus className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setFlatNumber(event.target.value.toUpperCase())} placeholder="e.g. A-105" required value={flatNumber} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Wing / block *
              {blockOptions.length > 1 ? (
                <select className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setWing(event.target.value)} required value={wing}>
                  {blockOptions.map((block) => <option key={block} value={block}>{block}</option>)}
                </select>
              ) : (
                <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setWing(event.target.value)} placeholder="e.g. A Wing" required value={wing} />
              )}
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Floor *
              <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" max="100" min="0" onChange={(event) => setFloor(Number(event.target.value))} required type="number" value={floor} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Flat type
              <input className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setFlatType(event.target.value)} placeholder="e.g. 2 BHK" value={flatType} />
            </label>
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
              Property address *
              <span className="relative mt-1.5 block">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea className="min-h-20 w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" onChange={(event) => setPropertyAddress(event.target.value)} placeholder="Building, street, locality, city, and postal code" required rows={3} value={propertyAddress} />
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Cancel</button>
            <button className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Add as vacant</button>
          </div>
        </form>
      </section>
    </div>
  );
};
