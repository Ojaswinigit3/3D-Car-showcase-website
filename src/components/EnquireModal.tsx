import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface EnquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFinish: 'carbon' | 'obsidian' | 'argent';
  selectedCaliper: 'blue' | 'red';
}

/**
 * Private Collector & Coachbuilding Dossier Request Modal
 */
export const EnquireModal: React.FC<EnquireModalProps> = ({
  isOpen,
  onClose,
  selectedFinish,
  selectedCaliper,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Geneva, Switzerland');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playTick(840);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Private Collector Dossier Request"
    >
      <div className="w-full max-w-lg bg-[#090a0e] border border-white/20 p-6 sm:p-8 shadow-2xl relative">
        <button
          type="button"
          onClick={() => {
            soundEngine.playTick(500);
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center border border-white/15 text-[#c9ccd1] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-xs font-mono text-[#c8102e] mb-1">
          MOLSHEIM SUR MESURE · PRIVATE DOSSIER
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-2">
          La Voiture Noire Archive & Consultation
        </h3>
        <p className="text-xs text-[#c9ccd1] leading-relaxed mb-6">
          While the 2019 La Voiture Noire is a singular one-of-one creation, collectors and automotive historians may request the complete technical monograph or register for future Coachbuilding commissions.
        </p>

        {submitted ? (
          <div className="border border-[#00b7ff]/40 bg-[#00b7ff]/10 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full border border-[#00b7ff] flex items-center justify-center text-[#00b7ff]">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-display text-xl text-white mb-1">
              Dossier Request Registered
            </h4>
            <p className="text-xs text-[#c9ccd1] mb-4">
              Your configuration preference ({selectedFinish.toUpperCase()} finish · {selectedCaliper.toUpperCase()} caliper) has been logged for {name || 'Private Collector'}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-5 py-2 text-xs font-mono bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors"
            >
              Return to Studio Turntable
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#c9ccd1] py-2 px-3 bg-[#101218] border border-white/10">
              <span>Selected Finish: {selectedFinish.toUpperCase()}</span>
              <span>·</span>
              <span>Caliper: {selectedCaliper.toUpperCase()}</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c9ccd1] mb-1.5">
                Full Name or Collection Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jean-Luc Moreau"
                className="w-full px-3.5 py-2 text-sm bg-[#050507] border border-white/15 text-white focus:border-[#00b7ff] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#c9ccd1] mb-1.5">
                  Private Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@domain.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#050507] border border-white/15 text-white focus:border-[#00b7ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c9ccd1] mb-1.5">
                  Primary Residence
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#050507] border border-white/15 text-white focus:border-[#00b7ff] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c9ccd1] mb-1.5">
                Enquiry Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify interest in the 2019 La Voiture Noire technical monograph or Sur Mesure programme..."
                className="w-full px-3.5 py-2 text-sm bg-[#050507] border border-white/15 text-white focus:border-[#00b7ff] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono border border-white/15 text-[#c9ccd1] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-mono bg-[#c8102e] text-white hover:bg-[#a50d26] transition-colors"
              >
                Submit Enquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
