declare module 'react-native-sweet-alert' {
    interface SweetAlertOptions {
      title?: string;
      subTitle?: string;
      confirmButtonTitle?: string;
      confirmButtonColor?: string;
      otherButtonTitle?: string;
      otherButtonColor?: string;
      style?: 'success' | 'error' | 'warning' | 'info';
      cancellable?: boolean;
    }
  
    interface SweetAlertStatic {
      showAlertWithOptions: (options: SweetAlertOptions, callback?: () => void) => void;
    }
  
    const SweetAlert: SweetAlertStatic;
    export default SweetAlert;
  }