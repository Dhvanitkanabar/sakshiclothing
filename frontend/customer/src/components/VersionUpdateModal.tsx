import React, { useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Sparkles, Download, AlertCircle } from 'lucide-react';
import { nativeApp } from '../services/nativeService';

interface AppVersionData {
  minVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  title: string;
  message: string;
  releaseNotes?: string;
  playStoreUrl: string;
  appStoreUrl: string;
}

// Semver comparison helper: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = v2.split('.').map(p => parseInt(p, 10) || 0);
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

export const VersionUpdateModal: React.FC = () => {
  const [versionData, setVersionData] = useState<AppVersionData | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const checkVersion = async () => {
      let installedVer = '1.0.0';
      if (nativeApp.isNative()) {
        try {
          const appInfo = await App.getInfo();
          installedVer = appInfo.version;
          setCurrentVersion(installedVer);
        } catch (e) {
          console.warn('[VersionCheck] Failed to get app info:', e);
        }
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/app-version`);
        if (!res.ok) return;

        const result = await res.json();
        const data: AppVersionData = result.data;
        if (!data) return;

        setVersionData(data);

        // Check if current version is less than minVersion (force update)
        if (data.forceUpdate || compareVersions(installedVer, data.minVersion) < 0) {
          setIsMandatory(true);
          setShowModal(true);
        } else if (compareVersions(installedVer, data.latestVersion) < 0) {
          // Optional update
          const dismissedVersion = sessionStorage.getItem('dismissedUpdateVersion');
          if (dismissedVersion !== data.latestVersion) {
            setIsMandatory(false);
            setShowModal(true);
          }
        }
      } catch (err) {
        // Silently skip if network or backend fails
      }
    };

    checkVersion();
  }, []);

  if (!showModal || !versionData) return null;

  const storeUrl = nativeApp.getPlatform() === 'ios'
    ? versionData.appStoreUrl
    : versionData.playStoreUrl;

  const handleUpdate = () => {
    window.open(storeUrl, '_system');
  };

  const handleDismiss = () => {
    if (isMandatory) return; // Cannot dismiss mandatory updates
    sessionStorage.setItem('dismissedUpdateVersion', versionData.latestVersion);
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E8E5DF] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle decorative gold badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7E1D2D]/10 text-[#7E1D2D] flex items-center justify-center border border-[#7E1D2D]/20">
          {isMandatory ? (
            <AlertCircle size={28} className="text-[#7E1D2D]" />
          ) : (
            <Sparkles size={28} className="text-[#D4AF37]" />
          )}
        </div>

        <h3 className="font-serif text-xl font-bold text-[#1A1A1A] tracking-tight mb-2">
          {isMandatory ? 'Required App Update' : versionData.title}
        </h3>

        <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
          {isMandatory
            ? 'A mandatory update is required to continue using Sakshi Clothing with essential security and payment improvements.'
            : versionData.message}
        </p>

        {versionData.releaseNotes && (
          <div className="bg-white/80 border border-[#E8E5DF] rounded-xl p-3 text-xs text-left text-[#4A4A4A] mb-5">
            <span className="font-semibold text-[#1A1A1A] block mb-1">What's New in v{versionData.latestVersion}:</span>
            {versionData.releaseNotes}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleUpdate}
            className="w-full py-3 px-4 bg-[#7E1D2D] hover:bg-[#681724] text-white font-medium text-sm rounded-xl shadow-md flex items-center justify-center gap-2 tracking-wide transition-all active:scale-[0.98]"
          >
            <Download size={16} />
            Update on {nativeApp.getPlatform() === 'ios' ? 'App Store' : 'Google Play'}
          </button>

          {!isMandatory && (
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] tracking-wider uppercase font-semibold transition-colors"
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionUpdateModal;
