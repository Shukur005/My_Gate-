import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowDownToLine,
  Boxes,
  CalendarDays,
  Check,
  CirclePlus,
  Clock3,
  FileText,
  MapPin,
  Package,
  Pencil,
  RefreshCw,
  Tag,
  UploadCloud,
  Wrench,
  X,
} from 'lucide-react';
import { useSociety } from '../../context/SocietyContext';
import type { DailyStaff } from '../../types';

type AssetStatus = 'In Stock' | 'In Use' | 'Under Maintenance' | 'Disposed' | 'Active' | 'Needs Service';
type AssetCondition = 'New' | 'Good' | 'Damaged';

interface SocietyAsset {
  id: string;
  name: string;
  category: string;
  assetType?: string;
  location: string;
  quantity: number;
  unitOfMeasure?: string;
  lowStockThreshold: number;
  status: AssetStatus;
  condition?: AssetCondition;
  assignedTo: string;
  assignedStaffId?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  vendor?: string;
  warrantyExpiry?: string;
  notes?: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  updatedAt: string;
}

interface AssetActivity {
  id: string;
  message: string;
  detail: string;
  createdAt: string;
}

interface InventoryData {
  assets: SocietyAsset[];
  activity: AssetActivity[];
}

type AssetModal = 'asset' | 'inventory' | 'stock' | null;
type AssetForm = {
  name: string;
  category: string;
  assetType: string;
  location: string;
  quantity: string;
  unitOfMeasure: string;
  lowStockThreshold: string;
  status: AssetStatus;
  condition: AssetCondition;
  assignedStaffId: string;
  assignStaff: boolean;
  purchaseDate: string;
  purchaseCost: string;
  vendor: string;
  warrantyExpiry: string;
  notes: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
};

const assetCategories = ['Electrical', 'Plumbing', 'Furniture', 'Security', 'Safety', 'Housekeeping', 'Other'];
const assetTypesByCategory: Record<string, string[]> = {
  Electrical: ['Generator', 'Pump', 'Lighting', 'CCTV Camera', 'Other'],
  Plumbing: ['Water Pump', 'Pipework', 'Water Tank', 'Other'],
  Furniture: ['Chair', 'Table', 'Sofa', 'Other'],
  Security: ['CCTV Camera', 'Access Control', 'Radio', 'Other'],
  Safety: ['Fire Extinguisher', 'First Aid Kit', 'Alarm', 'Other'],
  Housekeeping: ['Cleaning Equipment', 'Cleaning Supplies', 'Other'],
  Other: ['Other'],
};
const unitsOfMeasure = ['Piece', 'Set', 'Box', 'Litre', 'Kilogram', 'Meter', 'Unit'];
const emptyInventory: InventoryData = { assets: [], activity: [] };
const emptyAssetForm: AssetForm = {
  name: '',
  category: 'Electrical',
  assetType: 'Generator',
  location: '',
  quantity: '1',
  unitOfMeasure: 'Piece',
  lowStockThreshold: '2',
  status: 'In Stock',
  condition: 'New',
  assignedStaffId: '',
  assignStaff: true,
  purchaseDate: '',
  purchaseCost: '',
  vendor: '',
  warrantyExpiry: '',
  notes: '',
  attachmentName: '',
  attachmentDataUrl: '',
};

const createAssetId = () => `AST-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;

const storageKey = (societyName: string) => `mygate-assets-inventory-${encodeURIComponent(societyName)}`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const isSocietyAsset = (value: unknown): value is SocietyAsset => {
  if (typeof value !== 'object' || value === null) return false;
  const asset = value as Record<string, unknown>;
  return typeof asset.id === 'string' &&
    typeof asset.name === 'string' &&
    typeof asset.category === 'string' &&
    typeof asset.location === 'string' &&
    typeof asset.quantity === 'number' &&
    typeof asset.lowStockThreshold === 'number' &&
    (asset.status === 'In Use' || asset.status === 'Active' || asset.status === 'Needs Service' ||
      asset.status === 'In Stock' || asset.status === 'Under Maintenance' || asset.status === 'Disposed') &&
    typeof asset.assignedTo === 'string' &&
    (asset.assignedStaffId === undefined || typeof asset.assignedStaffId === 'string') &&
    (asset.purchaseCost === undefined || typeof asset.purchaseCost === 'number') &&
    (asset.attachmentName === undefined || typeof asset.attachmentName === 'string') &&
    (asset.attachmentDataUrl === undefined || typeof asset.attachmentDataUrl === 'string') &&
    typeof asset.updatedAt === 'string';
};

const isAssetActivity = (value: unknown): value is AssetActivity => {
  if (typeof value !== 'object' || value === null) return false;
  const activity = value as Record<string, unknown>;
  return typeof activity.id === 'string' &&
    typeof activity.message === 'string' &&
    typeof activity.detail === 'string' &&
    typeof activity.createdAt === 'string';
};

const loadInventory = (societyName: string): { data: InventoryData; error: string } => {
  try {
    const saved = localStorage.getItem(storageKey(societyName));
    if (!saved) return { data: emptyInventory, error: '' };
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'assets' in parsed &&
      Array.isArray(parsed.assets) &&
      parsed.assets.every(isSocietyAsset) &&
      'activity' in parsed &&
      Array.isArray(parsed.activity) &&
      parsed.activity.every(isAssetActivity)
    ) {
      return { data: { assets: parsed.assets, activity: parsed.activity }, error: '' };
    }
    return { data: emptyInventory, error: 'Saved inventory data is invalid. Add the records again or clear this society’s browser storage.' };
  } catch {
    return { data: emptyInventory, error: 'Saved inventory data could not be read. Check browser storage and reload the page.' };
  }
};

const staffKeywordsByCategory: Record<string, string[]> = {
  Electrical: ['electrician', 'electrical', 'electric'],
  Plumbing: ['plumber', 'plumbing'],
  Furniture: ['carpenter', 'furniture', 'woodwork'],
  Security: ['security', 'guard'],
  Safety: ['safety', 'fire', 'maintenance'],
  Housekeeping: ['housekeeping', 'cleaner', 'cleaning'],
};

const matchesAssetCategory = (staffMember: DailyStaff, category: string) => {
  const keywords = staffKeywordsByCategory[category];
  if (!keywords) return false;
  const staffSkills = `${staffMember.role} ${staffMember.assignedDuties || ''}`.toLowerCase();
  return keywords.some((keyword) => staffSkills.includes(keyword));
};

export const AssetsInventorySection: React.FC<{ societyName: string }> = ({ societyName }) => {
  const { staff } = useSociety();
  const societyStaff = useMemo(
    () => staff
      .filter((person) => person.societyName === societyName)
      .sort((first, second) => first.name.localeCompare(second.name)),
    [staff, societyName]
  );
  const [initialState] = useState(() => loadInventory(societyName));
  const [inventory, setInventory] = useState<InventoryData>(initialState.data);
  const [storageError, setStorageError] = useState(initialState.error);
  const [modal, setModal] = useState<AssetModal>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetIdPreview, setAssetIdPreview] = useState(createAssetId);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const [assetForm, setAssetForm] = useState<AssetForm>(emptyAssetForm);
  const [quantityForm, setQuantityForm] = useState('');

  useEffect(() => {
    if (storageError) return;
    try {
      localStorage.setItem(storageKey(societyName), JSON.stringify(inventory));
    } catch {
      setStorageError('Could not save inventory changes in this browser. Check available local storage and try again.');
    }
  }, [inventory, societyName, storageError]);

  const lowStockAssets = useMemo(
    () => inventory.assets.filter((asset) => asset.quantity > 0 && asset.quantity <= asset.lowStockThreshold),
    [inventory.assets]
  );
  const maintenanceAssets = inventory.assets.filter((asset) => asset.status === 'Needs Service' || asset.status === 'Under Maintenance');
  const totalItems = inventory.assets.reduce((total, asset) => total + asset.quantity, 0);
  const categoryTotals = assetCategories
    .map((category) => ({
      name: category,
      count: inventory.assets.filter((asset) => asset.category === category).length,
    }))
    .filter((category) => category.count > 0);
  const stockCounts = {
    inStock: inventory.assets.filter((asset) => asset.quantity > asset.lowStockThreshold).length,
    lowStock: lowStockAssets.filter((asset) => asset.quantity > 0).length,
    outOfStock: inventory.assets.filter((asset) => asset.quantity === 0).length,
  };
  const selectedAsset = inventory.assets.find((asset) => asset.id === selectedAssetId);
  const lastUpdated = inventory.assets.reduce<string | null>(
    (latest, asset) => !latest || asset.updatedAt > latest ? asset.updatedAt : latest,
    null
  );
  const staffName = (staffId: string | undefined, fallback: string) =>
    societyStaff.find((person) => person.id === staffId)?.name || fallback;

  const updateInventory = (next: InventoryData) => {
    setStorageError('');
    setInventory(next);
  };

  const addActivity = (current: InventoryData, message: string, detail: string): AssetActivity[] => [
    { id: `ACT-${Date.now()}`, message, detail, createdAt: new Date().toISOString() },
    ...current.activity,
  ].slice(0, 20);

  useEffect(() => {
    const assignments = inventory.assets
      .filter((asset) => asset.assignedStaffId === undefined)
      .map((asset) => ({ asset, staffMember: suggestStaff(asset.category) }))
      .filter((entry): entry is { asset: SocietyAsset; staffMember: DailyStaff } => Boolean(entry.staffMember));
    if (!assignments.length) return;

    const assignedIds = new Map(assignments.map(({ asset, staffMember }) => [asset.id, staffMember]));
    const updatedAt = new Date().toISOString();
    const assignedAssets = inventory.assets.map((asset) => {
      const staffMember = assignedIds.get(asset.id);
      return staffMember
        ? { ...asset, assignedStaffId: staffMember.id, assignedTo: staffMember.name, updatedAt }
        : asset;
    });
    const activity = assignments.map(({ asset, staffMember }, index) => ({
      id: `ACT-${Date.now()}-${index}`,
      message: `Staff assigned · ${asset.name}`,
      detail: `${staffMember.name} · ${asset.category}`,
      createdAt: updatedAt,
    }));
    setStorageError('');
    setInventory({ assets: assignedAssets, activity: [...activity, ...inventory.activity].slice(0, 20) });
  }, [inventory, societyStaff]);

  const openModal = (nextModal: AssetModal) => {
    setFormNotice('');
    setModal(nextModal);
    setEditingAssetId(null);
    const firstAsset = inventory.assets[0];
    setSelectedAssetId(firstAsset?.id || '');
    setQuantityForm(nextModal === 'stock' && firstAsset ? String(firstAsset.quantity) : '');
    if (nextModal === 'asset') {
      setAssetIdPreview(createAssetId());
      const suggestedStaff = suggestStaff(emptyAssetForm.category);
      setAssetForm({ ...emptyAssetForm, assignedStaffId: suggestedStaff?.id || '', assignStaff: Boolean(suggestedStaff) });
    }
  };

  const handleAddAsset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(assetForm.quantity);
    const threshold = Number(assetForm.lowStockThreshold);
    const purchaseCost = assetForm.purchaseCost.trim() ? Number(assetForm.purchaseCost) : undefined;
    if (
      !assetForm.name.trim() ||
      !assetForm.location.trim() ||
      !assetForm.purchaseDate ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(threshold) ||
      threshold < 0 ||
      (purchaseCost !== undefined && (!Number.isFinite(purchaseCost) || purchaseCost < 0))
    ) {
      setFormNotice('Complete all required fields and enter valid non-negative quantities and purchase cost.');
      return;
    }
    const assignedStaff = assetForm.assignStaff
      ? societyStaff.find((person) => person.id === assetForm.assignedStaffId)
      : undefined;
    if (assetForm.assignStaff && !assignedStaff) {
      setFormNotice('Select a registered society staff member, or choose Unassigned.');
      return;
    }
    const now = new Date().toISOString();
    const updatedFields: Omit<SocietyAsset, 'id' | 'updatedAt'> = {
      name: assetForm.name.trim(),
      category: assetForm.category,
      assetType: assetForm.assetType,
      location: assetForm.location.trim(),
      quantity,
      unitOfMeasure: assetForm.unitOfMeasure,
      lowStockThreshold: threshold,
      status: assetForm.status,
      condition: assetForm.condition,
      assignedTo: assignedStaff?.name || 'Unassigned',
      assignedStaffId: assignedStaff?.id || '',
      purchaseDate: assetForm.purchaseDate,
      ...(purchaseCost !== undefined ? { purchaseCost } : {}),
      vendor: assetForm.vendor.trim(),
      warrantyExpiry: assetForm.warrantyExpiry,
      notes: assetForm.notes.trim(),
      attachmentName: assetForm.attachmentName || '',
      attachmentDataUrl: assetForm.attachmentDataUrl || '',
    };
    const isEditing = Boolean(editingAssetId);
    const targetId = editingAssetId || assetIdPreview;
    const newAsset: SocietyAsset = { ...updatedFields, id: targetId, updatedAt: now };
    const nextAssets = isEditing
      ? inventory.assets.map((asset) => asset.id === targetId ? newAsset : asset)
      : [newAsset, ...inventory.assets];
    updateInventory({
      assets: nextAssets,
      activity: addActivity(
        inventory,
        `${isEditing ? 'Asset details updated' : 'New asset added'} · ${newAsset.name}`,
        `${newAsset.location} · ${newAsset.category}${assignedStaff ? ` · ${assignedStaff.name}` : ' · Unassigned'}`
      ),
    });
    setAssetForm(emptyAssetForm);
    setEditingAssetId(null);
    setModal(null);
  };

  const editAsset = (asset: SocietyAsset) => {
    setFormNotice('');
    setModal('asset');
    setEditingAssetId(asset.id);
    setAssetIdPreview(asset.id);
    const assigned = societyStaff.some((person) => person.id === asset.assignedStaffId);
    setAssetForm({
      name: asset.name,
      category: asset.category,
      assetType: asset.assetType || asset.name,
      location: asset.location,
      quantity: String(asset.quantity),
      unitOfMeasure: asset.unitOfMeasure || 'Piece',
      lowStockThreshold: String(asset.lowStockThreshold),
      status: asset.status === 'Active' ? 'In Use' : asset.status === 'Needs Service' ? 'Under Maintenance' : asset.status,
      condition: asset.condition || 'Good',
      assignedStaffId: assigned ? asset.assignedStaffId || '' : '',
      assignStaff: assigned,
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost === undefined ? '' : String(asset.purchaseCost),
      vendor: asset.vendor || '',
      warrantyExpiry: asset.warrantyExpiry || '',
      notes: asset.notes || '',
      attachmentName: asset.attachmentName || '',
      attachmentDataUrl: asset.attachmentDataUrl || '',
    });
  };

  const suggestStaff = (category: string) =>
    societyStaff.find((person) => matchesAssetCategory(person, category));

  const handleQuantityUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredQuantity = Number(quantityForm);
    if (!selectedAsset || !Number.isInteger(enteredQuantity) || enteredQuantity < 0) {
      setFormNotice('Choose an item and enter a valid non-negative whole-number quantity.');
      return;
    }
    const quantity = modal === 'inventory' ? selectedAsset.quantity + enteredQuantity : enteredQuantity;
    const updatedAt = new Date().toISOString();
    updateInventory({
      assets: inventory.assets.map((asset) =>
        asset.id === selectedAsset.id ? { ...asset, quantity, updatedAt } : asset
      ),
      activity: addActivity(
        inventory,
        modal === 'inventory' ? `Inventory added · ${selectedAsset.name}` : `Stock updated · ${selectedAsset.name}`,
        modal === 'inventory' ? `Added ${enteredQuantity} · Total stock is ${quantity}` : `Quantity is now ${quantity}`
      ),
    });
    setModal(null);
  };

  const downloadReport = () => {
    const rows = [
      ['Asset ID', 'Name', 'Category', 'Location', 'Quantity', 'Low-stock threshold', 'Status', 'Assigned to', 'Last updated'],
      ...inventory.assets.map((asset) => [
        asset.id,
        asset.name,
        asset.category,
        asset.location,
        String(asset.quantity),
        String(asset.lowStockThreshold),
        asset.status,
        staffName(asset.assignedStaffId, asset.assignedTo),
        formatDate(asset.updatedAt),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${societyName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-assets-inventory.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: 'Total Assets', value: inventory.assets.length, icon: Boxes, color: 'blue' },
    { label: 'Total Inventory Items', value: totalItems, icon: Archive, color: 'emerald' },
    { label: 'Under Maintenance', value: maintenanceAssets.length, icon: Wrench, color: 'rose' },
    { label: 'Low Stock Items', value: lowStockAssets.length, icon: AlertTriangle, color: 'violet' },
  ] as const;
  const cardColors = {
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  };

  return (
    <main className="mx-auto w-full max-w-none space-y-6 px-1 py-2">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-sky-50 px-6 py-5 shadow-sm sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
            <Package className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assets &amp; Inventory</h1>
            <p className="mt-1 text-base text-slate-600">Manage society assets, maintain inventory and track usage</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <span>Last updated<br /><strong className="font-medium text-slate-700">{lastUpdated ? formatDate(lastUpdated) : 'No records yet'}</strong></span>
        </div>
      </header>

      {storageError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{storageError}</p>
      )}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="flex min-h-32 items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${cardColors[color]}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-0.5 text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">For {societyName}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <article className="min-h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-4">
          <h2 className="text-lg font-bold text-slate-800">Assets by Category</h2>
          {categoryTotals.length ? (
            <div className="mt-5 space-y-3">
              {categoryTotals.map((category) => (
                <div key={category.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-600">{category.name}</span>
                    <strong className="text-slate-800">{category.count}</strong>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.round(category.count / inventory.assets.length * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="py-10 text-center text-sm text-slate-500">Add an asset to see category totals.</p>}
        </article>

        <article className="min-h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-4">
          <h2 className="text-lg font-bold text-slate-800">Inventory Stock Status</h2>
          <div className="mt-6 flex h-40 items-end justify-around gap-4 border-b border-slate-200 px-3">
            {[
              { label: 'In Stock', value: stockCounts.inStock, color: 'bg-blue-500' },
              { label: 'Low Stock', value: stockCounts.lowStock, color: 'bg-amber-400' },
              { label: 'Out of Stock', value: stockCounts.outOfStock, color: 'bg-rose-400' },
            ].map((item) => (
              <div key={item.label} className="flex h-full w-1/3 flex-col items-center justify-end gap-2">
                <strong className="text-xs text-slate-600">{item.value}</strong>
                <div className={`w-full max-w-16 rounded-t-md ${item.color}`} style={{ height: `${Math.max(item.value ? 16 : 3, item.value / Math.max(inventory.assets.length, 1) * 100)}%` }} />
                <span className="pb-2 text-[11px] text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="min-h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-800">Low Stock Items</h2>
            <span className="text-xs font-semibold text-blue-700">{lowStockAssets.length} items</span>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockAssets.length ? lowStockAssets.slice(0, 5).map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700"><AlertTriangle className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{asset.name}</p>
                    <p className="text-[10px] text-slate-500">{asset.category}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-rose-600">Stock: {asset.quantity}</span>
              </div>
            )) : <p className="py-8 text-center text-sm text-slate-500">No low-stock items.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-12">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Assets</h2>
              <p className="mt-1 text-sm text-slate-500">{inventory.assets.length} registered assets</p>
            </div>
            <button type="button" onClick={() => openModal('asset')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
              <CirclePlus className="h-4 w-4" /> Add Asset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500">
                <tr>{['Asset ID', 'Name', 'Category', 'Location', 'Stock', 'Status', 'Assigned Staff', 'Last Updated', 'Edit'].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.assets.length ? inventory.assets.slice(0, 8).map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">{asset.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{asset.name}</td>
                    <td className="px-4 py-3 text-slate-600">{asset.category}</td>
                    <td className="px-4 py-3 text-slate-600">{asset.location}</td>
                    <td className="px-4 py-3 text-slate-700">{asset.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        asset.status === 'In Stock'
                          ? 'bg-blue-50 text-blue-700'
                          : asset.status === 'In Use' || asset.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : asset.status === 'Under Maintenance' || asset.status === 'Needs Service'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {asset.status === 'Active' ? 'In Use' : asset.status === 'Needs Service' ? 'Under Maintenance' : asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {asset.assignedStaffId && societyStaff.some((person) => person.id === asset.assignedStaffId) ? (
                        <div>
                          <p className="font-semibold text-slate-800">{staffName(asset.assignedStaffId, asset.assignedTo)}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {societyStaff.find((person) => person.id === asset.assignedStaffId)?.role}
                          </p>
                        </div>
                      ) : (
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          asset.assignedTo === 'Unassigned'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {asset.assignedTo === 'Unassigned' ? 'Unassigned' : staffName(asset.assignedStaffId, asset.assignedTo)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(asset.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => editAsset(asset)} aria-label={`Edit ${asset.name}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                        <Pencil className="h-3.5 w-3.5" />Edit
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">No assets have been added for this society yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-4 xl:col-span-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Recent Activity</h2>
              <Clock3 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {inventory.activity.length ? inventory.activity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="py-2.5">
                  <p className="text-xs font-semibold text-slate-800">{activity.message}</p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                    <span className="truncate">{activity.detail}</span>
                    <span className="shrink-0">{formatDate(activity.createdAt)}</span>
                  </div>
                </div>
              )) : <p className="py-8 text-center text-sm text-slate-500">Asset updates will appear here.</p>}
            </div>
          </article>

          <article className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Quick Actions</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => openModal('asset')} className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <CirclePlus className="h-5 w-5 text-blue-600" />Add Asset
              </button>
              <button type="button" onClick={() => openModal('inventory')} className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <Boxes className="h-5 w-5 text-blue-600" />Add Inventory
              </button>
              <button type="button" onClick={downloadReport} className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <ArrowDownToLine className="h-5 w-5 text-blue-600" />View Reports
              </button>
              <button type="button" onClick={() => openModal('stock')} className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <RefreshCw className="h-5 w-5 text-blue-600" />Stock Update
              </button>
            </div>
          </article>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="asset-inventory-dialog-title" className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="asset-inventory-dialog-title" className="font-bold text-slate-900">
                  {modal === 'asset' ? editingAssetId ? 'Edit Asset' : 'Add Asset' : modal === 'inventory' ? 'Add Inventory' : 'Update Stock'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Changes are saved for {societyName}.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setModal(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </header>
            {modal === 'asset' ? (
              <form onSubmit={handleAddAsset} className="p-5 sm:p-7">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-700">Asset Name <span className="text-rose-600">*</span>
                      <input required maxLength={100} value={assetForm.name} onChange={(event) => setAssetForm({ ...assetForm, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="e.g. Water Pump" />
                      <span className="mt-1 block font-normal text-slate-500">Enter a clear, descriptive name for the asset.</span>
                    </label>

                    <label className="block text-xs font-bold text-slate-700">Asset Code / ID
                      <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 font-mono text-sm font-normal text-slate-500">
                        <Tag className="h-4 w-4" />{editingAssetId || assetIdPreview}
                      </span>
                      <span className="mt-1 block font-normal text-slate-500">Automatically generated and cannot be edited.</span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-bold text-slate-700">Asset Category <span className="text-rose-600">*</span>
                        <select value={assetForm.category} onChange={(event) => {
                          const category = event.target.value;
                          const suggested = suggestStaff(category);
                          setAssetForm({
                            ...assetForm,
                            category,
                            assetType: assetTypesByCategory[category]?.[0] || 'Other',
                            assignedStaffId: suggested?.id || '',
                            assignStaff: Boolean(suggested),
                          });
                        }} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-normal">
                          {assetCategories.map((category) => <option key={category}>{category}</option>)}
                        </select>
                      </label>
                      <label className="block text-xs font-bold text-slate-700">Asset Type <span className="text-rose-600">*</span>
                        <select required value={assetForm.assetType} onChange={(event) => setAssetForm({ ...assetForm, assetType: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-normal">
                          {(assetTypesByCategory[assetForm.category] || ['Other']).map((type) => <option key={type}>{type}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-bold text-slate-700">Initial Quantity <span className="text-rose-600">*</span>
                        <input required type="number" min="0" step="1" value={assetForm.quantity} onChange={(event) => setAssetForm({ ...assetForm, quantity: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" />
                      </label>
                      <label className="block text-xs font-bold text-slate-700">Unit of Measure <span className="text-rose-600">*</span>
                        <select required value={assetForm.unitOfMeasure} onChange={(event) => setAssetForm({ ...assetForm, unitOfMeasure: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-normal">
                          {unitsOfMeasure.map((unit) => <option key={unit}>{unit}</option>)}
                        </select>
                      </label>
                    </div>

                    <label className="block text-xs font-bold text-slate-700">Location / Area <span className="text-rose-600">*</span>
                      <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 px-3">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <input required maxLength={120} value={assetForm.location} onChange={(event) => setAssetForm({ ...assetForm, location: event.target.value })} className="w-full py-3 text-sm font-normal outline-none" placeholder="e.g. Block A - Basement" />
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-bold text-slate-700">Purchase Date <span className="text-rose-600">*</span>
                        <input required type="date" value={assetForm.purchaseDate} onChange={(event) => setAssetForm({ ...assetForm, purchaseDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" />
                      </label>
                      <label className="block text-xs font-bold text-slate-700">Purchase Cost
                        <input type="number" min="0" step="0.01" value={assetForm.purchaseCost} onChange={(event) => setAssetForm({ ...assetForm, purchaseCost: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" placeholder="Enter amount" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-bold text-slate-700">Vendor / Supplier
                        <input maxLength={100} value={assetForm.vendor} onChange={(event) => setAssetForm({ ...assetForm, vendor: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" placeholder="Supplier name" />
                      </label>
                      <label className="block text-xs font-bold text-slate-700">Warranty Expiry
                        <input type="date" value={assetForm.warrantyExpiry} onChange={(event) => setAssetForm({ ...assetForm, warrantyExpiry: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-5 border-slate-100 lg:border-l lg:pl-6">
                    <fieldset>
                      <legend className="text-xs font-bold text-slate-700">Condition <span className="text-rose-600">*</span></legend>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(['New', 'Good', 'Damaged'] as const).map((condition) => (
                          <label key={condition} className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-semibold transition ${
                            assetForm.condition === condition ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                            <input type="radio" name="asset-condition" value={condition} checked={assetForm.condition === condition} onChange={() => setAssetForm({ ...assetForm, condition })} className="accent-blue-600" />
                            {condition}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <label className="block text-xs font-bold text-slate-700">Low Stock Threshold <span className="text-rose-600">*</span>
                      <input required type="number" min="0" step="1" value={assetForm.lowStockThreshold} onChange={(event) => setAssetForm({ ...assetForm, lowStockThreshold: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" />
                      <span className="mt-1 block font-normal text-slate-500">Flag this item when stock reaches this amount.</span>
                    </label>

                    <fieldset>
                      <legend className="text-xs font-bold text-slate-700">Asset Status <span className="text-rose-600">*</span></legend>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(['In Stock', 'In Use', 'Under Maintenance', 'Disposed'] as const).map((status) => (
                          <label key={status} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-xs font-semibold transition ${
                            assetForm.status === status ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}>
                            <input type="radio" name="asset-status" value={status} checked={assetForm.status === status} onChange={() => setAssetForm({ ...assetForm, status })} className="accent-blue-600" />
                            {status}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="border-b border-slate-100 pb-5">
                      <legend className="text-xs font-bold text-slate-700">Assign to Staff / Team</legend>
                      <label className="mt-2 flex items-start gap-2 text-xs font-semibold text-slate-700">
                        <input type="checkbox" checked={assetForm.assignStaff} onChange={(event) => setAssetForm({
                          ...assetForm,
                          assignStaff: event.target.checked,
                          assignedStaffId: event.target.checked
                            ? assetForm.assignedStaffId || suggestStaff(assetForm.category)?.id || ''
                            : '',
                        })} className="mt-0.5 h-4 w-4 accent-blue-600" />
                        <span>Assign now <span className="block pt-1 font-normal text-slate-500">You can change the assignment later from Edit Asset.</span></span>
                      </label>
                      {assetForm.assignStaff ? (
                        <select required value={assetForm.assignedStaffId} onChange={(event) => setAssetForm({ ...assetForm, assignedStaffId: event.target.value })} className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-normal">
                          <option value="">Select registered staff member</option>
                          {societyStaff.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name} · {person.role}{matchesAssetCategory(person, assetForm.category) ? ' (Suggested)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                          <input type="radio" checked={!assetForm.assignStaff} onChange={() => setAssetForm({ ...assetForm, assignStaff: false, assignedStaffId: '' })} className="accent-blue-600" />
                          <span>Unassigned <span className="block pt-1 font-normal text-slate-500">Keep this asset unassigned for now.</span></span>
                        </label>
                      )}
                      <p className="mt-2 text-[11px] text-slate-500">
                        {societyStaff.length
                          ? suggestStaff(assetForm.category)
                            ? `Suggested for ${assetForm.category}: ${suggestStaff(assetForm.category)?.name}`
                            : 'No role match found. Select any society staff member or keep unassigned.'
                          : 'Register society staff first to assign an asset.'}
                      </p>
                    </fieldset>

                    <label className="block text-xs font-bold text-slate-700">Notes / Description
                      <textarea maxLength={500} value={assetForm.notes} onChange={(event) => setAssetForm({ ...assetForm, notes: event.target.value })} rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm font-normal" placeholder="Add details, notes or specifications..." />
                      <span className="mt-1 block text-right font-normal text-slate-500">{assetForm.notes.length}/500</span>
                    </label>

                    <label className="block text-xs font-bold text-slate-700">Attachment / Photo <span className="font-normal text-slate-400">(Optional · JPG, PNG, PDF · max 500 KB)</span>
                      <span className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-4 py-4 text-sm font-medium text-blue-700 hover:bg-blue-50">
                        <UploadCloud className="h-5 w-5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{assetForm.attachmentName || 'Choose a file to attach'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) || file.size > 500 * 1024) {
                              setFormNotice('Choose a JPG, PNG, or PDF file no larger than 500 KB.');
                              event.target.value = '';
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result !== 'string') {
                                setFormNotice('The attachment could not be read. Please try again.');
                                return;
                              }
                              const attachmentDataUrl = reader.result;
                              setFormNotice('');
                              setAssetForm((current) => ({
                                ...current,
                                attachmentName: file.name,
                                attachmentDataUrl,
                              }));
                            };
                            reader.onerror = () => setFormNotice('The attachment could not be read. Please choose another file.');
                            reader.readAsDataURL(file);
                          }}
                        />
                      </span>
                      {assetForm.attachmentName && (
                        <span className="mt-1 flex items-center gap-1.5 font-normal text-slate-500">
                          <FileText className="h-3.5 w-3.5" />Attached: {assetForm.attachmentName}
                          <button type="button" onClick={() => setAssetForm({ ...assetForm, attachmentName: '', attachmentDataUrl: '' })} className="ml-auto font-semibold text-rose-600 hover:text-rose-700">Remove</button>
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                {formNotice && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formNotice}</p>}
                <footer className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Check className="h-4 w-4" />{editingAssetId ? 'Save Changes' : 'Save Asset'}</button>
                </footer>
              </form>
            ) : (
              <form onSubmit={handleQuantityUpdate} className="space-y-4 p-5">
                {!inventory.assets.length ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Add an asset first to track and update inventory stock.</p>
                ) : (
                  <>
                    <label className="block text-xs font-semibold text-slate-700">Select item
                      <select required value={selectedAssetId} onChange={(event) => {
                        setSelectedAssetId(event.target.value);
                        const nextAsset = inventory.assets.find((asset) => asset.id === event.target.value);
                        setQuantityForm(modal === 'stock' && nextAsset ? String(nextAsset.quantity) : '');
                      }} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal">
                        {inventory.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · Current stock: {asset.quantity}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">{modal === 'inventory' ? 'Quantity to add' : 'New quantity'}
                      <input required type="number" min="0" step="1" value={quantityForm} onChange={(event) => setQuantityForm(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal" />
                    </label>
                  </>
                )}
                {formNotice && <p role="alert" className="text-xs font-semibold text-rose-700">{formNotice}</p>}
                <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700">Close</button>
                  <button type="submit" disabled={!inventory.assets.length} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50">Save Stock</button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
};
