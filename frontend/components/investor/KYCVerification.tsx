"use client";

import { useRef, useState, useCallback } from "react";

type KYCStep = "idle" | "document" | "selfie" | "loading" | "success" | "error";

interface KYCResult {
  success: boolean;
  similarity: number | null;
  liveness_score: number | null;
  face_found_on_document: boolean;
  face_found_on_selfie: boolean;
  reason: string;
}

interface KYCVerificationProps {
  onSuccess?: (result: KYCResult) => void;
  onError?: (reason: string) => void;
  apiUrl?: string;
}

export default function KYCVerification({
  onSuccess,
  onError,
  apiUrl = "http://localhost:8000",
}: KYCVerificationProps) {
  const [step, setStep] = useState<KYCStep>("idle");
  const [result, setResult] = useState<KYCResult | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocumentFile(file);
    setDocumentPreview(URL.createObjectURL(file));
    setStep("selfie");
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const takeSelfie = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg", 0.95);
  }, [stopCamera]);

  const submitKYC = async () => {
    if (!documentFile || !selfieBlob) return;

    setStep("loading");
    setError(null);

    const formData = new FormData();
    formData.append("document", documentFile);
    formData.append("selfie", selfieBlob, "selfie.jpg");

    try {
      const res = await fetch(`${apiUrl}/kyc/verify`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur : ${res.status}`);
      }

      const data: KYCResult = await res.json();
      setResult(data);

      if (data.success) {
        setStep("success");
        onSuccess?.(data);
      } else {
        setStep("error");
        setError(data.reason);
        onError?.(data.reason);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur réseau";
      setStep("error");
      setError(msg);
      onError?.(msg);
    }
  };

  const reset = () => {
    stopCamera();
    setStep("idle");
    setResult(null);
    setDocumentFile(null);
    setDocumentPreview(null);
    setSelfieBlob(null);
    setSelfiePreview(null);
    setError(null);
  };

  return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Vérification d'identité
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
            Vérification sécurisée — aucune donnée stockée
        </p>

        <div className="flex items-center justify-center gap-2 mb-8">
            {["Document", "Selfie", "Vérification"].map((label, i) => {
            const stepIndex = step === "idle" ? -1
                : step === "document" ? 0
                : step === "selfie" ? 1
                : 2;
            const active = i <= stepIndex;
            return (
                <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i + 1}
                </div>
                <span className={`text-sm ${active ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                    {label}
                </span>
                {i < 2 && <div className={`w-8 h-px ${active ? "bg-blue-600" : "bg-gray-200"}`} />}
                </div>
            );
            })}
        </div>

        {step === "idle" && (
            <div className="text-center">
            <div className="text-6xl mb-4">🪪</div>
            <p className="text-gray-600 mb-6">
                Préparez votre pièce d'identité (CNI, passeport ou permis de conduire)
                et assurez-vous d'être dans un endroit bien éclairé.
            </p>
            <button
                onClick={() => setStep("document")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
                Commencer la vérification
            </button>
            </div>
        )}

        {step === "document" && (
            <div className="text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-semibold text-lg mb-2">Photo de votre document</h3>
            <p className="text-gray-500 text-sm mb-6">
                Prenez en photo votre CNI recto, passeport ou permis.<br />
                Le visage doit être bien visible et net.
            </p>

            {documentPreview ? (
                <div className="mb-4">
                <img src={documentPreview} alt="Document" className="rounded-lg mx-auto max-h-48 object-cover border" />
                <button onClick={() => { setDocumentFile(null); setDocumentPreview(null); }}
                    className="mt-2 text-sm text-red-500 hover:underline">
                    Rechoisir
                </button>
                </div>
            ) : (
                <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-blue-400 transition mb-4"
                >
                <p className="text-gray-400">Cliquez pour sélectionner une photo</p>
                <p className="text-gray-300 text-xs mt-1">JPG, PNG — max 10MB</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDocumentUpload}
            />

            {documentFile && (
                <button
                onClick={() => setStep("selfie")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                >
                Continuer →
                </button>
            )}
            </div>
        )}

        {step === "selfie" && (
            <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Votre selfie</h3>
            <p className="text-gray-500 text-sm mb-4">
                Regardez la caméra, visage centré et bien éclairé.
            </p>

            {selfiePreview ? (
                <div className="mb-4">
                <img src={selfiePreview} alt="Selfie" className="rounded-xl mx-auto max-h-52 object-cover border" />
                <button onClick={() => { setSelfieBlob(null); setSelfiePreview(null); startCamera(); }}
                    className="mt-2 text-sm text-red-500 hover:underline">
                    Reprendre
                </button>
                </div>
            ) : (
                <div className="relative mb-4">
                <video
                    ref={videoRef}
                    className="rounded-xl w-full bg-gray-900"
                    style={{ display: cameraActive ? "block" : "none" }}
                    playsInline
                    muted
                />
                {!cameraActive && (
                    <div className="bg-gray-100 rounded-xl p-12 mb-4">
                    <div className="text-5xl mb-2">📷</div>
                    <p className="text-gray-400 text-sm">Caméra inactive</p>
                    </div>
                )}
                {cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-48 border-4 border-white rounded-full opacity-50" />
                    </div>
                )}
                </div>
            )}

            <div className="flex gap-3">
                {!cameraActive && !selfiePreview && (
                <button onClick={startCamera}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition">
                    📷 Activer la caméra
                </button>
                )}
                {cameraActive && (
                <button onClick={takeSelfie}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition">
                    ⚡ Prendre le selfie
                </button>
                )}
                {selfiePreview && (
                <button onClick={submitKYC}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition">
                    ✅ Vérifier mon identité
                </button>
                )}
            </div>
            </div>
        )}

        {step === "loading" && (
            <div className="text-center py-8">
            <div className="text-5xl mb-4 animate-pulse">🔍</div>
            <p className="text-gray-600 font-medium">Analyse en cours...</p>
            <p className="text-gray-400 text-sm mt-1">Comparaison du visage avec le document</p>
            <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
            </div>
        )}

        {step === "success" && result && (
            <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Identité vérifiée</h3>
            <p className="text-gray-500 mb-6">Votre KYC a été validé avec succès.</p>

            <div className="bg-green-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                <span className="text-gray-500">Similarité</span>
                <span className="font-semibold text-green-700">
                    {result.similarity !== null ? `${(result.similarity * 100).toFixed(1)}%` : "—"}
                </span>
                </div>
                <div className="flex justify-between text-sm">
                <span className="text-gray-500">Score liveness</span>
                <span className="font-semibold text-green-700">
                    {result.liveness_score !== null ? `${(result.liveness_score * 100).toFixed(1)}%` : "—"}
                </span>
                </div>
            </div>
            </div>
        )}

        {step === "error" && (
            <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Vérification échouée</h3>
            <p className="text-gray-500 mb-2">La vérification n'a pas pu être complétée.</p>
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-sm text-red-600">
                {error}
                </div>
            )}
            <button onClick={reset}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition">
                Recommencer
            </button>
            </div>
        )}

        <p className="text-center text-gray-300 text-xs mt-6">
            🔒 Traitement local — aucune image stockée sur nos serveurs
        </p>
        </div>
    );
}