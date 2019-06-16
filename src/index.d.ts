
// -------- START: Declaration for Android object ---------------
declare var Android: {
  onPageChange(page: number, totalPages: number): void;
  saveData(key: string, dataJson: string): void;
  getData(key: string): string;
};
// -------- END: Declaration for Android object ---------------
