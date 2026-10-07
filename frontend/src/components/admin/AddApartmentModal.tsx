import React, { useState } from 'react';
import { Building2, X } from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';

interface AddApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export const AddApartmentModal: React.FC<AddApartmentModalProps> = ({ isOpen, onClose }) => {
  const { addSociety } = useSociety();
  const [name, setName] = useState('');
  const [totalFlats, setTotalFlats] = useState('');
  const [numberOfBlocks, setNumberOfBlocks] = useState('');
  const [wingBlock, setWingBlock] = useState('');
  const [floors, setFloors] = useState('');
  const [flatType, setFlatType] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = addSociety({
      name,
      totalFlats: Number(totalFlats),
      numberOfBlocks: Number(numberOfBlocks),
      wingBlock: wingBlock.trim(),
      floors: Number(floors),
      flatType,
      ownerName: ownerName.trim(),
      mobileNumber: mobileNumber.trim(),
      propertyAddress: propertyAddress.trim(),
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="add-apartment-title"
        aria-modal="true"
        className="my-8 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="add-apartment-title" className="text-base font-bold text-slate-950">Add Apartment</h2>
              <p className="mt-0.5 text-xs text-slate-500">Create a society profile. Add its individual flats separately.</p>
            </div>
          </div>
          <button aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Society Name <span className="text-rose-600">*</span>
              <input autoFocus className={inputClassName} onChange={(event) => setName(event.target.value)} placeholder="e.g. Green Valley Residency" required value={name} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Total Flats <span className="text-rose-600">*</span>
              <input className={inputClassName} min="1" onChange={(event) => setTotalFlats(event.target.value)} placeholder="e.g. 120" required type="number" value={totalFlats} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Number of Blocks <span className="text-rose-600">*</span>
              <input className={inputClassName} min="1" onChange={(event) => setNumberOfBlocks(event.target.value)} placeholder="e.g. 3" required type="number" value={numberOfBlocks} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Wing / Block <span className="text-rose-600">*</span>
              <input className={inputClassName} onChange={(event) => setWingBlock(event.target.value)} placeholder="e.g. A, B, C" required value={wingBlock} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Floor <span className="text-rose-600">*</span>
              <input className={inputClassName} min="1" onChange={(event) => setFloors(event.target.value)} placeholder="e.g. 1" required type="number" value={floors} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Flat Type <span className="text-rose-600">*</span>
              <select className={inputClassName} onChange={(event) => setFlatType(event.target.value)} required value={flatType}>
                <option disabled value="">Select Flat Type</option>
                <option value="Studio">Studio</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Owner Name <span className="text-rose-600">*</span>
              <input className={inputClassName} onChange={(event) => setOwnerName(event.target.value)} placeholder="e.g. Ramesh Kumar" required value={ownerName} />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Mobile Number <span className="text-rose-600">*</span>
              <input className={inputClassName} onChange={(event) => setMobileNumber(event.target.value)} placeholder="e.g. 98765 43210" required type="tel" value={mobileNumber} />
            </label>
            <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
              Property Address <span className="text-rose-600">*</span>
              <textarea className={`${inputClassName} min-h-20`} onChange={(event) => setPropertyAddress(event.target.value)} placeholder="Building, street, locality, city, and postal code..." required rows={3} value={propertyAddress} />
            </label>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500"><span className="font-semibold text-emerald-700">Required fields</span> · All fields marked * are mandatory.</p>
            <div className="flex justify-end gap-3">
              <button className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose} type="button">Cancel</button>
              <button className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Add Apartment</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};
