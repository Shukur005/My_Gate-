import React from 'react';
import { Car, CheckCircle2, History, LogOut } from 'lucide-react';
import type { FlatDetail, ResidentVehicleMovement } from '../../types';

export interface ResidentVehicleOption {
  key: string;
  flatNumber: string;
  residentName: string;
  vehicle: FlatDetail['vehicles'][number];
}

interface ResidentVehicleGateLogProps {
  vehicles: ResidentVehicleOption[];
  movements: ResidentVehicleMovement[];
  latestMovementByVehicle: Map<string, ResidentVehicleMovement>;
  selectedVehicleKey: string;
  selectedVehicle?: ResidentVehicleOption;
  selectedVehicleLastMovement?: ResidentVehicleMovement;
  notice: { success: boolean; message: string } | null;
  onSelectVehicle: (key: string) => void;
  onRecordMovement: (direction: 'entry' | 'exit', vehicleKey: string) => void;
  vehicleKey: (flatNumber: string, vehicleNumber: string) => string;
}

export const ResidentVehicleGateLog: React.FC<ResidentVehicleGateLogProps> = ({
  vehicles,
  movements,
  latestMovementByVehicle,
  selectedVehicleKey,
  selectedVehicle,
  selectedVehicleLastMovement,
  notice,
  onSelectVehicle,
  onRecordMovement,
  vehicleKey,
}) => (
  <section aria-labelledby="resident-vehicle-movement-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800"><Car className="h-5 w-5" /></span>
        <div>
          <h3 className="text-base font-extrabold text-slate-950" id="resident-vehicle-movement-title">Resident Vehicle Gate Log</h3>
          <p className="mt-1 text-xs text-slate-500">Select a registered vehicle to record its entry. Record its exit from the active log entry.</p>
        </div>
      </div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
        {movements.length} movement{movements.length === 1 ? '' : 's'} recorded
      </span>
    </header>

    <div className="space-y-5 p-5">
      {vehicles.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-xs font-bold text-slate-700">
            Select registered resident vehicle
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              value={selectedVehicleKey}
              onChange={(event) => onSelectVehicle(event.target.value)}
            >
              <option value="">Choose vehicle number · apartment · resident</option>
              {vehicles.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.vehicle.number} · Flat {item.flatNumber} · {item.residentName}
                </option>
              ))}
            </select>
          </label>
          <button
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            disabled={!selectedVehicle || selectedVehicleLastMovement?.direction === 'entry'}
            onClick={() => onRecordMovement('entry', selectedVehicleKey)}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Record Entry
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No resident vehicles are registered for this society yet. Ask the administrator to add vehicles to the apartment records before logging movements.
        </div>
      )}

      {selectedVehicle && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
          <span className="font-mono font-extrabold text-slate-950">{selectedVehicle.vehicle.number}</span>
          <span className="text-slate-500">
            {selectedVehicle.vehicle.type}
            {selectedVehicle.vehicle.makeModel ? ` · ${selectedVehicle.vehicle.makeModel}` : ''}
          </span>
          <span className="font-semibold text-slate-700">Flat {selectedVehicle.flatNumber} · {selectedVehicle.residentName}</span>
          {selectedVehicleLastMovement?.direction === 'entry' && (
            <span className="font-bold text-emerald-700">Already inside · Record exit from the active entry below.</span>
          )}
        </div>
      )}

      {notice && (
        <p
          className={`rounded-xl border px-3.5 py-3 text-xs font-semibold ${
            notice.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
          role={notice.success ? 'status' : 'alert'}
        >
          {notice.message}
        </p>
      )}

      <div className="border-t border-slate-100 pt-5">
        <div className="mb-3">
          <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <History className="h-4 w-4 text-slate-500" />
            Vehicle Movement Log
          </h4>
          <p className="mt-1 text-xs text-slate-500">Vehicle and resident details are filled in automatically.</p>
        </div>
        {movements.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500">
            No movements recorded yet. Select a vehicle and record its entry to start the log.
          </p>
        ) : (
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {movements.map((movement) => (
              <article className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between" key={movement.id}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 rounded-lg p-2 ${
                    movement.direction === 'entry' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {movement.direction === 'entry' ? <Car className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-950">
                      {movement.vehicleNumber} · Flat {movement.flatNumber}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {movement.residentName} · {movement.vehicleType}{movement.makeModel ? ` · ${movement.makeModel}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {movement.gateStation} · Guard: {movement.recordedBy}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <div className="sm:text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                      movement.direction === 'entry' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {movement.direction === 'entry' ? 'Entered' : 'Exited'}
                    </span>
                    <time className="mt-1 block text-[11px] text-slate-500">
                      {new Date(movement.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </time>
                  </div>
                  {movement.direction === 'entry' &&
                    latestMovementByVehicle.get(vehicleKey(movement.flatNumber, movement.vehicleNumber))?.id === movement.id && (
                      <button
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-900"
                        onClick={() => onRecordMovement('exit', vehicleKey(movement.flatNumber, movement.vehicleNumber))}
                        type="button"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Record Exit
                      </button>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);
