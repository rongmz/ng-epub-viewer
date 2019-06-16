export const localStorage = {

  /**
   * Mock localStorage.getItem
   * @param key
   */
  getItem(key: string): string | undefined {
    // if android defined
    if(Android && Android.getData) {
      let data = Android.getData(key);
      return data;
    } else if(window.localStorage && window.localStorage.getItem) {
      return window.localStorage.getItem(key);
    } else
      return undefined;
  },

  /**
   * Mock localStorage.setItem
   * @param key
   * @param data
   */
  setItem(key: string, data: string): void {
    // if android defined
    if (Android && Android.saveData) {
      Android.saveData(key, data);
    } else if (window.localStorage && window.localStorage.setItem) {
      window.localStorage.setItem(key, data);
    }
  }

}
