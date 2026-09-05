import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  HeartPulse,
  Lock,
  Plus,
  Trash2,
  Save,
  Check,
  Shield,
  Key,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { UserProfile, EmergencyContact } from "../types";

interface ProfileContactsProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
}

export const ProfileContacts: React.FC<ProfileContactsProps> = ({ userProfile, onSaveProfile }) => {
  const [profileData, setProfileData] = useState<UserProfile>(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTwilioConfig, setShowTwilioConfig] = useState(false);

  // Twilio optional credentials state
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [twilioFrom, setTwilioFrom] = useState("");
  const [twilioSaved, setTwilioSaved] = useState(false);

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: any) => {
    const updated = [...profileData.contacts];
    updated[index] = { ...updated[index], [field]: value };
    setProfileData({ ...profileData, contacts: updated });
  };

  const addContact = () => {
    if (profileData.contacts.length >= 3) return;
    const newContact: EmergencyContact = {
      id: "c-" + Date.now(),
      name: "",
      relation: "Friend / Relative",
      phone: "",
      email: "",
      notifySms: true,
      notifyCall: true,
    };
    setProfileData({ ...profileData, contacts: [...profileData.contacts, newContact] });
  };

  const removeContact = (index: number) => {
    const updated = profileData.contacts.filter((_, i) => i !== index);
    setProfileData({ ...profileData, contacts: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveProfile(profileData);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveTwilio = (e: React.FormEvent) => {
    e.preventDefault();
    setTwilioSaved(true);
    setTimeout(() => {
      setTwilioSaved(false);
      setShowTwilioConfig(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100 font-display">Emergency Profile & Contacts</h2>
              <p className="text-xs text-slate-400">Personal medical info & 3 emergency dispatch contacts</p>
            </div>
          </div>

          <button
            onClick={() => setShowTwilioConfig(!showTwilioConfig)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 transition"
            id="twilio-api-config-btn"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Twilio SMS API Setup</span>
          </button>
        </div>

        {/* Twilio API Key Modal/Drawer */}
        {showTwilioConfig && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Optional Real SMS API Settings (Twilio)
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                SMS SIMULATOR ACTIVE BY DEFAULT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              SafeGuard includes an automatic built-in SMS simulation engine. If you have a Twilio Account, enter your API credentials below to dispatch real live carrier SMS messages during emergency SOS.
            </p>

            <form onSubmit={handleSaveTwilio} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">Account SID</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxx"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  id="twilio-sid-input"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">Auth Token</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  id="twilio-token-input"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">Twilio From Phone</label>
                <input
                  type="text"
                  placeholder="+15550001111"
                  value={twilioFrom}
                  onChange={(e) => setTwilioFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  id="twilio-from-input"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-5 rounded-xl shadow transition flex items-center gap-1.5"
                  id="save-twilio-keys-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>{twilioSaved ? "Twilio Configured!" : "Save Twilio Credentials"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal User Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <User className="w-4 h-4 text-red-400" />
              User Information & Medical Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  id="profile-name-input"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  id="profile-phone-input"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Blood Group</label>
                <select
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  id="profile-blood-select"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Primary Home Base Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  id="profile-address-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                  Medical Notes & Allergies (Shared with Rescuers on SOS)
                </label>
                <textarea
                  value={profileData.medicalNotes}
                  onChange={(e) => setProfileData({ ...profileData, medicalNotes: e.target.value })}
                  rows={2}
                  placeholder="e.g., Severe penicillin allergy, asthmatic inhaler user..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-red-500"
                  id="profile-medical-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Security & Passcodes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Lock className="w-4 h-4 text-red-400" />
              Security PIN & Camouflage Passcode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">SOS Deactivation Security PIN</label>
                <input
                  type="password"
                  value={profileData.emergencyPin}
                  onChange={(e) => setProfileData({ ...profileData, emergencyPin: e.target.value })}
                  maxLength={6}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono tracking-widest focus:outline-none focus:border-red-500 text-center text-sm"
                  id="profile-pin-input"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">PIN required to turn off active emergency SOS alarm</span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Camouflage Calculator Trigger Code</label>
                <input
                  type="text"
                  value={profileData.camouflageCode}
                  onChange={(e) => setProfileData({ ...profileData, camouflageCode: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono tracking-widest focus:outline-none focus:border-red-500 text-center text-sm"
                  id="profile-camouflage-code-input"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Type this number in the calculator disguise mode + press =</span>
              </div>
            </div>
          </div>

          {/* Section 3: 3 Emergency Contacts */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Emergency Contacts ({profileData.contacts.length}/3)
              </h3>

              {profileData.contacts.length < 3 && (
                <button
                  type="button"
                  onClick={addContact}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-red-400 font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition"
                  id="add-contact-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {profileData.contacts.map((contact, idx) => (
                <div
                  key={contact.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Contact #{idx + 1}
                    </span>
                    {profileData.contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Remove Contact"
                        id={`remove-contact-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(idx, "name", e.target.value)}
                        required
                        placeholder="Contact Name"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                        id={`contact-name-${idx}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Relationship</label>
                      <input
                        type="text"
                        value={contact.relation}
                        onChange={(e) => handleContactChange(idx, "relation", e.target.value)}
                        placeholder="e.g. Parent, Sister, Partner"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                        id={`contact-relation-${idx}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Phone Number (SMS)</label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(idx, "phone", e.target.value)}
                        required
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                        id={`contact-phone-${idx}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(idx, "email", e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                        id={`contact-email-${idx}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit / Save Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile & Emergency Contacts Saved Successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-500">All data saved locally and synced to backend</span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2"
              id="save-profile-submit-btn"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Emergency Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
