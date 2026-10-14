import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, X, QrCode, Sparkles, Loader2 } from 'lucide-react';
import type { StockItem } from '../types/stock';

interface BatchQrCodeModalProps {
  items: StockItem[];
  isOpen: boolean;
  onClose: () => void;
}

interface ItemWithQr {
  item: StockItem;
  qrDataUrl: string;
}

export const BatchQrCodeModal: React.FC<BatchQrCodeModalProps> = ({
  items,
  isOpen,
  onClose,
}) => {
  const [itemsWithQr, setItemsWithQr] = useState<ItemWithQr[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setItemsWithQr([]);
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const origin = window.location.origin;
    const pathname = window.location.pathname;

    Promise.all(
      items.map(async (item) => {
        const targetUrl = `${origin}${pathname}?move=${encodeURIComponent(item.id)}`;
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        return { item, qrDataUrl };
      })
    )
      .then((results) => {
        if (isMounted) {
          setItemsWithQr(results);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Codes em lote:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [items, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal na Tela (não aparece na impressão) */}
      <div className="modal modal-open z-50 no-print">
        <div className="modal-box max-w-5xl bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-base-content leading-tight flex items-center gap-2">
                  <span>Etiquetas de QR Code em Lote</span>
                  <span className="badge badge-primary badge-sm font-semibold">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                </h3>
                <p className="text-xs text-base-content/60">
                  Pronto para impressão em folha A4 em 4 colunas para recorte e etiquetagem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGenerating || itemsWithQr.length === 0}
                className="btn btn-primary btn-sm gap-1.5 text-xs font-semibold shadow-xs"
                title="Imprimir todas as etiquetas"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Folha A4</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-base-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Grade de Etiquetas com Rolagem */}
          <div className="p-6 overflow-y-auto flex-1 bg-base-200/30">
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <h4 className="font-bold text-sm text-base-content">
                  Gerando {items.length} QR Codes em alta resolução...
                </h4>
                <p className="text-xs text-base-content/60 mt-1">
                  Aguarde um instante enquanto as etiquetas são formatadas.
                </p>
              </div>
            ) : itemsWithQr.length === 0 ? (
              <div className="py-12 text-center text-xs text-base-content/60">
                Nenhum item disponível para gerar etiquetas.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-base-content/60 bg-base-100 p-3 rounded-xl border border-base-200">
                  <span>
                    Pré-visualização em <strong>4 colunas</strong> (tamanho ideal para prateleiras, gavetas e caixas):
                  </span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn btn-primary btn-xs gap-1 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Agora</span>
                  </button>
                </div>

                {/* Grade 4 colunas na tela */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {itemsWithQr.map(({ item, qrDataUrl }) => (
                    <div
                      key={item.id}
                      className="bg-white text-slate-900 border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center text-center shadow-2xs hover:border-primary/50 transition-colors"
                    >
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        Casa de Ogum e Oxum
                      </div>

                      <h5
                        className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 min-h-[32px] flex items-center justify-center"
                        title={item.name}
                      >
                        {item.name}
                      </h5>

                      <div className="flex items-center gap-1.5 my-1 text-[10px]">
                        <span className="font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="text-slate-500 truncate max-w-[90px]" title={item.type}>
                          {item.type}
                        </span>
                      </div>

                      <img
                        src={qrDataUrl}
                        alt={item.name}
                        className="w-24 h-24 object-contain my-1"
                      />

                      <div className="text-[8px] text-slate-500 leading-tight">
                        Aponte a câmera para movimentar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <div className="px-6 py-3 border-t border-base-200 flex justify-between items-center bg-base-100 shrink-0 text-xs text-base-content/60">
            <span>Dica: Use folha sulfite A4 comum ou folha adesiva para recortar e colar.</span>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-xs"
            >
              Fechar
            </button>
          </div>
        </div>
        <div className="modal-backdrop bg-black/40" onClick={onClose} />
      </div>

      {/* ÁREA DE IMPRESSÃO EM LOTE (Visível apenas na janela de impressão Ctrl+P / window.print) */}
      <div id="batch-qrcode-print-area" className="hidden">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            width: '100%',
            margin: '0',
            padding: '4px',
            boxSizing: 'border-box',
          }}
        >
          {itemsWithQr.map(({ item, qrDataUrl }) => (
            <div
              key={`print-${item.id}`}
              style={{
                border: '1px dashed #444',
                borderRadius: '6px',
                padding: '8px 6px',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxSizing: 'border-box',
                minHeight: '160px',
              }}
            >
              <div
                style={{
                  fontSize: '8px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  color: '#444',
                  marginBottom: '2px',
                }}
              >
                Casa de Ogum e Oxum
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  maxHeight: '28px',
                  overflow: 'hidden',
                  color: '#000',
                  margin: '2px 0',
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  fontSize: '9px',
                  color: '#555',
                  marginBottom: '4px',
                }}
              >
                <strong>{item.id}</strong> &bull; {item.type}
              </div>

              <img
                src={qrDataUrl}
                alt={item.name}
                style={{
                  width: '90px',
                  height: '90px',
                  display: 'block',
                  margin: '2px auto',
                }}
              />

              <div
                style={{
                  fontSize: '7.5px',
                  color: '#666',
                  marginTop: '2px',
                }}
              >
                Aponte a câmera para movimentar
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
