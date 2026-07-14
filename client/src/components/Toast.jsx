import React, { createContext, useContext } from "react";
import { toast as rtToast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toast = {
    success: (msg, dur = 4000) => rtToast.success(msg, { autoClose: dur }),
    error: (msg, dur = 4000) => rtToast.error(msg, { autoClose: dur }),
    warning: (msg, dur = 4000) => rtToast.warn(msg, { autoClose: dur }),
    info: (msg, dur = 4000) => rtToast.info(msg, { autoClose: dur }),
    confirm: (msg, onConfirm, onCancel) => {
      const toastId = rtToast(
        ({ closeToast }) => (
          <div className="flex gap-4 p-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">Confirm Deletion</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{msg}</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    if (onCancel) onCancel();
                    rtToast.dismiss(toastId);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    rtToast.dismiss(toastId);
                  }}
                  className="px-4.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/20 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          className: "!bg-white !rounded-2xl !border !border-slate-100 !shadow-2xl !p-0 !min-h-[auto] !w-[360px]",
          bodyClassName: "!p-0 !m-0",
        }
      );
      return toastId;
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ToastContext.Provider>
  );
};
