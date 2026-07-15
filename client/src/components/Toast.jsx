import React, { createContext, useContext, useMemo } from "react";
import { toast as rtToast, ToastContainer } from "react-toastify";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toast = useMemo(
    () => ({
      success: (msg, dur = 4000) =>
        rtToast.success(msg, {
          autoClose: dur,
          containerId: "prepnest-toast-container",
        }),
      error: (msg, dur = 4000) =>
        rtToast.error(msg, {
          autoClose: dur,
          containerId: "prepnest-toast-container",
        }),
      warning: (msg, dur = 4000) =>
        rtToast.warn(msg, {
          autoClose: dur,
          containerId: "prepnest-toast-container",
        }),
      info: (msg, dur = 4000) =>
        rtToast.info(msg, {
          autoClose: dur,
          containerId: "prepnest-toast-container",
        }),
      confirm: (msg, onConfirm, onCancel, title = "Confirm Deletion", type = "danger") => {
        const isDelete = type === "danger" || title.toLowerCase().includes("delete");
        const iconColorClass = isDelete ? "text-red-500" : "text-cyan-600";
        const iconBgClass = isDelete ? "bg-red-50 border-red-100" : "bg-cyan-50 border-cyan-100";
        const toastId = rtToast(
          ({ closeToast }) => (
            <div className="flex gap-4 p-4 items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${iconBgClass} flex items-center justify-center ${iconColorClass} shadow-sm border`}>
                {isDelete ? (
                  <svg
                    className="w-5.5 h-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5.5 h-5.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
                  {title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {msg}
                </p>
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
                    className={`px-4.5 py-1.5 rounded-lg text-xs font-bold ${
                      isDelete
                        ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20"
                        : "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-cyan-500/20"
                    } text-white shadow-md transition-all duration-200 cursor-pointer active:scale-95`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            containerId: "prepnest-toast-container",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            className:
              "!bg-white !rounded-2xl !border !border-slate-100 !shadow-2xl !p-0 !min-h-[auto] !w-[360px]",
            bodyClassName: "!p-0 !m-0",
          },
        );
        return toastId;
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        containerId="prepnest-toast-container"
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        stacked
        limit={5}
        theme="colored"
      />
    </ToastContext.Provider>
  );
};
