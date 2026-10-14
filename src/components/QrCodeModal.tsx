import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Printer, Download, Sparkles } from 'lucide-react';
import type { StockItem } from '../types/stock';

interface QrCodeModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');

  useEffect(() => {
    if (item && isOpen) {
      // Monta a URL completa apontando para a aplicação com o parâmetro ?move=ID
      const url = `${window.location.origin}${window.location.pathname}?move=${encodeURIComponent(
        item.id
      )}`;
      setTargetUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUri) => {
          setQrDataUrl(dataUri);
        })
        .catch((err) => {
          console.error('Erro ao gerar QRCode:', err);
        });
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="modal modal-open z-50 no-print">
        <div className="modal-box max-w-md bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-200">
          {/* Header */}
          <div className="px-6 py-4 flex justify-between items-center border-b border-base-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-base-content leading-tight">
                  QR Code do Item
                </h3>
                <p className="text-xs text-base-content/60">
                  Etiqueta para colagem e baixa rápida
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-base-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Preview da Etiqueta */}
          <div className="p-6 space-y-4">
            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-200 flex flex-col items-center text-center">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Casa de Ogum e Oxum
              </span>

              <h4 className="font-extrabold text-base text-base-content leading-tight max-w-xs">
                {item.name}
              </h4>

              <div className="flex items-center gap-2 mt-1 mb-3">
                <span className="badge badge-neutral badge-xs font-mono font-bold">
                  {item.id}
                </span>
                <span className="badge badge-outline badge-xs text-xs">
                  {item.type}
                </span>
              </div>

              {/* QR Code Canvas / Imagem */}
              <div className="p-2 bg-white rounded-xl shadow-xs border border-base-300">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code para ${item.name}`}
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-base-content/60 mt-3 max-w-xs leading-relaxed">
                Aponte a câmera do celular para este código para abrir o formulário de retirada ou entrada direto.
              </p>
            </div>

            {/* URL Info */}
            <div className="text-[11px] text-base-content/50 break-all bg-base-200/40 p-2.5 rounded-lg border border-base-200 font-mono">
              <span className="font-bold text-base-content/70">Link gerado:</span> {targetUrl}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-base-200">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="btn btn-outline btn-sm gap-1.5 flex-1 text-xs"
                title="Baixar imagem do QR Code"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Imagem</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!qrDataUrl}
                className="btn btn-primary btn-sm gap-1.5 flex-1 text-xs font-semibold shadow-xs"
                title="Imprimir Etiqueta"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Etiqueta</span>
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop bg-black/40" onClick={onClose} />
      </div>

      {/* ÁREA DE IMPRESSÃO (Visível apenas na janela de impressão do navegador) */}
      <div id="qrcode-print-area" className="hidden">
        <div
          style={{
            width: '65mm',
            padding: '12px',
            textAlign: 'center',
            border: '2px dashed #000',
            borderRadius: '8px',
            fontFamily: 'sans-serif',
            color: '#000',
            backgroundColor: '#fff',
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Casa de Ogum e Oxum
          </div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px', lineHeight: '1.2' }}>
            {item.name}
          </div>
          <div style={{ fontSize: '10px', marginTop: '2px', color: '#444' }}>
            [{item.id}] &bull; {item.type}
          </div>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={item.name}
              style={{ width: '130px', height: '130px', margin: '8px auto 4px auto', display: 'block' }}
            />
          )}
          <div style={{ fontSize: '8px', color: '#666', marginTop: '2px' }}>
            Aponte a câmera para registrar retirada/entrada
          </div>
        </div>
      </div>
    </>
  );
};
