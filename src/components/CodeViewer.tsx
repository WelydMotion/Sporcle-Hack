import React, { useState } from 'react';
import { PROJECT_FILES, SourceFile } from '../projectFiles';
import { Copy, Check, FileCode, Folder, Download, Terminal, Smartphone } from 'lucide-react';
import JSZip from 'jszip';

export function CodeViewer() {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(PROJECT_FILES[3]); // default app/build.gradle.kts or MainActivity
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all files into the zip archive matching the real directory structure
      PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Also add missing standard files
      zip.file('android/gradlew', `#!/usr/bin/env sh\nexec gradle "$@"\n`);
      zip.file('android/gradlew.bat', `@echo off\ngradle %*\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'WELYD_Game_Test_Panel_Android_and_Backend.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const categories = [
    { id: 'android-kotlin', label: 'Android Kotlin Source', icon: Smartphone },
    { id: 'android-config', label: 'Gradle & Manifest Config', icon: Terminal },
    { id: 'backend', label: 'FastAPI Backend', icon: FileCode }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner with One-Click Download */}
      <div className="bg-gradient-to-r from-slate-900 via-[#121826] to-cyan-950/50 border border-cyan-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Production Project Bundle</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Complete Android & Backend Codebase</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspect all Kotlin, XML, Gradle, and Python files. Download the entire pre-structured project ZIP ready to open in Android Studio.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'PACKAGING ZIP...' : 'DOWNLOAD COMPLETE PROJECT (.ZIP)'}</span>
        </button>
      </div>

      {/* Explorer + Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* File Tree / Selector Sidebar */}
        <div className="lg:col-span-4 bg-[#121826] border border-[#26354e] rounded-2xl p-4 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {PROJECT_FILES.length} FILES
            </span>
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {categories.map(cat => {
              const files = PROJECT_FILES.filter(f => f.category === cat.id);
              if (files.length === 0) return null;
              const IconComponent = cat.icon;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 font-mono px-2 py-1">
                    <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{cat.label}</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    {files.map(file => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          selectedFile.path === file.path
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-[#1b2438] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Viewer Panel */}
        <div className="lg:col-span-8 bg-[#0a0e17] border border-[#26354e] rounded-2xl overflow-hidden flex flex-col shadow-xl">
          {/* Editor Header Bar */}
          <div className="bg-[#121826] px-4 py-3 border-b border-[#26354e] flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-white truncate">{selectedFile.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#1b2438] hover:bg-[#25324d] text-slate-300 hover:text-white border border-[#26354e] rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          {/* Code Text with Line Numbers */}
          <div className="p-4 overflow-x-auto max-h-[640px] overflow-y-auto bg-[#070b12]">
            <pre className="font-mono text-xs leading-relaxed text-slate-200">
              <code>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell text-right pr-4 select-none text-slate-600 w-10 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
