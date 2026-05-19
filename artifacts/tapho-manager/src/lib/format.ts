export function formatVND(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

export function parseVND(value: string): number {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
}
