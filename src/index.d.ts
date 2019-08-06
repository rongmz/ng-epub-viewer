
// -------- START: Declaration for Android object ---------------
declare var Android: {
  onPageChange(page: number, totalPages: number, extraInfo:string): void;
  saveData(key: string, dataJson: string): void;
  getData(key: string): string;
};
// -------- END: Declaration for Android object ---------------
