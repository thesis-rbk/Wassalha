import React, { createContext, useContext, useState } from 'react';
import { StatusScreen } from '../app/screens/StatusScreen';

type StatusOptions = {
  type: 'success' | 'error';
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
};

type StatusType = {
  show: (options: StatusOptions) => void;
  hide: () => void;
};

const StatusContext = createContext<StatusType | undefined>(undefined);

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [statusProps, setStatusProps] = useState<StatusOptions | null>(null);

  const show = (options: StatusOptions) => {
    setStatusProps(options);
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
    setStatusProps(null);
  };

  return (
    <StatusContext.Provider value={{ show, hide }}>
      {children}
      {statusProps && (
        <StatusScreen
          visible={visible}
          type={statusProps.type}
          title={statusProps.title}
          message={statusProps.message}
          primaryAction={{
            ...statusProps.primaryAction,
            onPress: () => {
              statusProps.primaryAction?.onPress?.();
              hide();
            },
          }}
          secondaryAction={
            statusProps.secondaryAction
              ? {
                  ...statusProps.secondaryAction,
                  onPress: () => {
                    statusProps.secondaryAction?.onPress?.();
                    hide();
                  },
                }
              : undefined
          }
          onClose={hide}
        />
      )}
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}